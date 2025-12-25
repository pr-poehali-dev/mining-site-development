import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_API = 'https://functions.poehali.dev/b6c4b238-1da2-47dd-bed3-42800767e6d5';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (sessionToken: string, user: any) => void;
}

export default function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: 'Регистрация завершена. Теперь войдите в систему.',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось зарегистрироваться',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: 'Ошибка',
        description: 'Введите email и пароль',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires_2fa) {
          setRequires2FA(true);
          setTempToken(data.temp_token);
          toast({
            title: 'Требуется 2FA',
            description: 'Введите код из приложения аутентификатора',
          });
        } else {
          localStorage.setItem('session_token', data.session_token);
          toast({
            title: 'Добро пожаловать!',
            description: `Вход выполнен успешно`,
          });
          onSuccess(data.session_token, data.user);
          onClose();
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверные учетные данные',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode) {
      toast({
        title: 'Ошибка',
        description: 'Введите код 2FA',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API}?action=verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_token: tempToken, code: twoFactorCode }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('session_token', data.session_token);
        toast({
          title: 'Успешно!',
          description: 'Вход выполнен',
        });
        onSuccess(data.session_token, data.user);
        onClose();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный код',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Двухфакторная аутентификация</DialogTitle>
            <DialogDescription>Введите код из вашего приложения аутентификатора</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="2fa-code">Код 2FA</Label>
              <Input
                id="2fa-code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="bg-muted/50"
              />
            </div>
            <Button onClick={handleVerify2FA} disabled={loading} className="w-full glow-hover">
              {loading ? 'Проверка...' : 'Подтвердить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Вход в систему</DialogTitle>
          <DialogDescription>Войдите или создайте новый аккаунт</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Пароль</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted/50"
              />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full glow-hover">
              <Icon name="LogIn" size={18} className="mr-2" />
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </TabsContent>
          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Полное имя</Label>
              <Input
                id="register-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Пароль</Label>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted/50"
              />
            </div>
            <Button onClick={handleRegister} disabled={loading} className="w-full glow-hover">
              <Icon name="UserPlus" size={18} className="mr-2" />
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
