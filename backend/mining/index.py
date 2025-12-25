import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import datetime
from decimal import Decimal

def get_db_connection():
    """Подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def get_user_from_session(session_token: str, conn):
    """Получение пользователя по токену сессии"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT u.id, u.email, u.full_name
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = %s AND s.expires_at > NOW()
            """,
            (session_token,)
        )
        return cur.fetchone()

def handler(event: dict, context) -> dict:
    """
    API для управления майнинг-аккаунтами и статистикой
    
    Эндпоинты:
    - GET /accounts - Получение списка майнинг-аккаунтов пользователя
    - POST /accounts - Создание нового майнинг-аккаунта
    - GET /stats/:account_id - Получение статистики по аккаунту
    - GET /dashboard - Получение данных дашборда
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
        
        session_token = event.get('headers', {}).get('X-Session-Token')
        if not session_token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Authentication required'}),
                'isBase64Encoded': False
            }
        
        user = get_user_from_session(session_token, conn)
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid session'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and path == 'accounts':
            return handle_get_accounts(user, conn)
        elif method == 'POST' and path == 'accounts':
            return handle_create_account(user, event, conn)
        elif method == 'GET' and path.startswith('stats/'):
            account_id = path.split('/')[-1]
            return handle_get_stats(user, account_id, conn)
        elif method == 'GET' and path == 'dashboard':
            return handle_get_dashboard(user, conn)
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

def handle_get_accounts(user: dict, conn) -> dict:
    """Получение списка майнинг-аккаунтов"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id, account_name, hashrate, power_consumption, is_active, created_at
            FROM mining_accounts
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user['id'],)
        )
        accounts = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'accounts': [dict(acc) for acc in accounts]}, default=str),
            'isBase64Encoded': False
        }

def handle_create_account(user: dict, event: dict, conn) -> dict:
    """Создание нового майнинг-аккаунта"""
    data = json.loads(event.get('body', '{}'))
    
    account_name = data.get('account_name')
    hashrate = data.get('hashrate', 0)
    power_consumption = data.get('power_consumption', 0)
    
    if not account_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Account name is required'}),
            'isBase64Encoded': False
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO mining_accounts (user_id, account_name, hashrate, power_consumption)
            VALUES (%s, %s, %s, %s)
            RETURNING id, account_name, hashrate, power_consumption, is_active, created_at
            """,
            (user['id'], account_name, hashrate, power_consumption)
        )
        account = cur.fetchone()
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'account': dict(account)}, default=str),
            'isBase64Encoded': False
        }

def handle_get_stats(user: dict, account_id: str, conn) -> dict:
    """Получение статистики по аккаунту"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT ma.id
            FROM mining_accounts ma
            WHERE ma.id = %s AND ma.user_id = %s
            """,
            (account_id, user['id'])
        )
        
        if not cur.fetchone():
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Account not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """
            SELECT date, total_hashrate, power_used, btc_mined, revenue_usd, electricity_cost, profit_usd
            FROM mining_stats
            WHERE mining_account_id = %s
            ORDER BY date DESC
            LIMIT 30
            """,
            (account_id,)
        )
        stats = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'stats': [dict(s) for s in stats]}, default=str),
            'isBase64Encoded': False
        }

def handle_get_dashboard(user: dict, conn) -> dict:
    """Получение данных для дашборда"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT 
                COUNT(*) as total_accounts,
                COALESCE(SUM(hashrate), 0) as total_hashrate,
                COALESCE(SUM(power_consumption), 0) as total_power
            FROM mining_accounts
            WHERE user_id = %s AND is_active = TRUE
            """,
            (user['id'],)
        )
        summary = cur.fetchone()
        
        cur.execute(
            """
            SELECT 
                ms.date,
                COALESCE(SUM(ms.profit_usd), 0) as daily_profit,
                COALESCE(SUM(ms.btc_mined), 0) as daily_btc
            FROM mining_stats ms
            JOIN mining_accounts ma ON ms.mining_account_id = ma.id
            WHERE ma.user_id = %s
            GROUP BY ms.date
            ORDER BY ms.date DESC
            LIMIT 7
            """,
            (user['id'],)
        )
        recent_stats = cur.fetchall()
        
        cur.execute(
            """
            SELECT plan_name, price_usd, hashrate_allocation, status, expires_at
            FROM subscriptions
            WHERE user_id = %s AND status = 'active'
            ORDER BY expires_at DESC
            LIMIT 1
            """,
            (user['id'],)
        )
        subscription = cur.fetchone()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'summary': dict(summary) if summary else {},
                'recent_stats': [dict(s) for s in recent_stats],
                'subscription': dict(subscription) if subscription else None
            }, default=str),
            'isBase64Encoded': False
        }