import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import secrets
import datetime
import pyotp
from typing import Optional

def get_db_connection():
    """Подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Проверка пароля"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_session_token() -> str:
    """Генерация токена сессии"""
    return secrets.token_urlsafe(64)

def generate_2fa_secret() -> str:
    """Генерация секрета для 2FA"""
    return pyotp.random_base32()

def verify_2fa_token(secret: str, token: str) -> bool:
    """Проверка 2FA токена"""
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)

def handler(event: dict, context) -> dict:
    """
    API для аутентификации пользователей с поддержкой 2FA
    
    Эндпоинты:
    - POST /register - Регистрация нового пользователя
    - POST /login - Вход пользователя
    - POST /verify-2fa - Подтверждение 2FA кода
    - POST /enable-2fa - Включение 2FA для пользователя
    - POST /logout - Выход пользователя
    - GET /me - Получение данных текущего пользователя
    """
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', '') if event.get('queryStringParameters') else ''
    
    try:
        conn = get_db_connection()
        
        if method == 'POST' and path == 'register':
            return handle_register(event, conn)
        elif method == 'POST' and path == 'login':
            return handle_login(event, conn)
        elif method == 'POST' and path == 'verify-2fa':
            return handle_verify_2fa(event, conn)
        elif method == 'POST' and path == 'enable-2fa':
            return handle_enable_2fa(event, conn)
        elif method == 'POST' and path == 'logout':
            return handle_logout(event, conn)
        elif method == 'GET' and path == 'me':
            return handle_get_user(event, conn)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint not found'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'conn' in locals():
            conn.close()

def handle_register(event: dict, conn) -> dict:
    """Регистрация нового пользователя"""
    data = json.loads(event.get('body', '{}'))
    
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    
    if not email or not password or not full_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email, password and full_name are required'}),
            'isBase64Encoded': False
        }
    
    password_hash = hash_password(password)
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id, email, full_name, created_at",
                (email, password_hash, full_name)
            )
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'User registered successfully',
                    'user': dict(user)
                }, default=str),
                'isBase64Encoded': False
            }
    except psycopg2.IntegrityError:
        conn.rollback()
        return {
            'statusCode': 409,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User with this email already exists'}),
            'isBase64Encoded': False
        }

def handle_login(event: dict, conn) -> dict:
    """Вход пользователя"""
    data = json.loads(event.get('body', '{}'))
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and password are required'}),
            'isBase64Encoded': False
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT id, email, password_hash, full_name, two_factor_enabled FROM users WHERE email = %s",
            (email,)
        )
        user = cur.fetchone()
        
        if not user or not verify_password(password, user['password_hash']):
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'}),
                'isBase64Encoded': False
            }
        
        if user['two_factor_enabled']:
            temp_token = generate_session_token()
            expires_at = datetime.datetime.now() + datetime.timedelta(minutes=5)
            
            cur.execute(
                "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], temp_token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'requires_2fa': True,
                    'temp_token': temp_token,
                    'message': 'Please provide 2FA code'
                }),
                'isBase64Encoded': False
            }
        
        session_token = generate_session_token()
        expires_at = datetime.datetime.now() + datetime.timedelta(days=30)
        
        cur.execute(
            "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], session_token, expires_at)
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'session_token': session_token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name']
                }
            })
        }

def handle_verify_2fa(event: dict, conn) -> dict:
    """Подтверждение 2FA кода"""
    data = json.loads(event.get('body', '{}'))
    
    temp_token = data.get('temp_token')
    code = data.get('code')
    
    if not temp_token or not code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Temp token and 2FA code are required'}),
            'isBase64Encoded': False
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT u.id, u.email, u.full_name, u.two_factor_secret
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = %s AND s.expires_at > NOW()
            """,
            (temp_token,)
        )
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid or expired temp token'}),
                'isBase64Encoded': False
            }
        
        if not verify_2fa_token(user['two_factor_secret'], code):
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid 2FA code'}),
                'isBase64Encoded': False
            }
        
        cur.execute("DELETE FROM user_sessions WHERE session_token = %s", (temp_token,))
        
        session_token = generate_session_token()
        expires_at = datetime.datetime.now() + datetime.timedelta(days=30)
        
        cur.execute(
            "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], session_token, expires_at)
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'session_token': session_token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name']
                }
            }),
            'isBase64Encoded': False
        }

def handle_enable_2fa(event: dict, conn) -> dict:
    """Включение 2FA для пользователя"""
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Session token required'}),
            'isBase64Encoded': False
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT u.id, u.email
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = %s AND s.expires_at > NOW()
            """,
            (session_token,)
        )
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid session'}),
                'isBase64Encoded': False
            }
        
        secret = generate_2fa_secret()
        totp = pyotp.TOTP(secret)
        qr_uri = totp.provisioning_uri(name=user['email'], issuer_name='CryptoMine')
        
        cur.execute(
            "UPDATE users SET two_factor_secret = %s, two_factor_enabled = TRUE WHERE id = %s",
            (secret, user['id'])
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'secret': secret,
                'qr_uri': qr_uri,
                'message': '2FA enabled successfully'
            }),
            'isBase64Encoded': False
        }

def handle_logout(event: dict, conn) -> dict:
    """Выход пользователя"""
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Session token required'}),
            'isBase64Encoded': False
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("DELETE FROM user_sessions WHERE session_token = %s", (session_token,))
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Logged out successfully'}),
            'isBase64Encoded': False
        }

def handle_get_user(event: dict, conn) -> dict:
    """Получение данных текущего пользователя"""
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Session token required'}),
            'isBase64Encoded': False
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT u.id, u.email, u.full_name, u.two_factor_enabled, u.created_at
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = %s AND s.expires_at > NOW()
            """,
            (session_token,)
        )
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid session'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': dict(user)}, default=str),
            'isBase64Encoded': False
        }