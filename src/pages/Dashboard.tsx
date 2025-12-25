import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_API = 'https://functions.poehali.dev/b6c4b238-1da2-47dd-bed3-42800767e6d5';
const MINING_API = 'https://functions.poehali.dev/181bc9fc-3fe4-452b-9b10-5a31248b3556';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const sessionToken = localStorage.getItem('session_token');
    
    if (!sessionToken) {
      navigate('/');
      return;
    }

    try {
      const [userResponse, dashboardResponse] = await Promise.all([
        fetch(`${AUTH_API}?action=me`, {
          headers: { 'X-Session-Token': sessionToken },
        }),
        fetch(`${MINING_API}?action=dashboard`, {
          headers: { 'X-Session-Token': sessionToken },
        }),
      ]);

      if (userResponse.ok && dashboardResponse.ok) {
        const userData = await userResponse.json();
        const dashboardData = await dashboardResponse.json();
        
        setUser(userData.user);
        setDashboard(dashboardData);
      } else {
        localStorage.removeItem('session_token');
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('session_token');
    
    if (sessionToken) {
      await fetch(`${AUTH_API}?action=logout`, {
        method: 'POST',
        headers: { 'X-Session-Token': sessionToken },
      });
    }
    
    localStorage.removeItem('session_token');
    navigate('/');
    toast({
      title: 'Выход выполнен',
      description: 'До скорой встречи!',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⛏️</div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const totalProfit = dashboard?.recent_stats?.reduce((sum: number, stat: any) => sum + parseFloat(stat.daily_profit || 0), 0) || 0;
  const totalBTC = dashboard?.recent_stats?.reduce((sum: number, stat: any) => sum + parseFloat(stat.daily_btc || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">⛏️</div>
            <span className="text-2xl font-bold text-gradient">CryptoMine</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Личный кабинет</h1>
          <p className="text-muted-foreground">Добро пожаловать, {user?.full_name}!</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-muted-foreground text-sm">Активные аккаунты</div>
                <Icon name="Activity" size={20} className="text-primary" />
              </div>
              <div className="text-3xl font-bold">{dashboard?.summary?.total_accounts || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-muted-foreground text-sm">Общий хешрейт</div>
                <Icon name="Zap" size={20} className="text-primary" />
              </div>
              <div className="text-3xl font-bold">{parseFloat(dashboard?.summary?.total_hashrate || 0).toFixed(1)} TH/s</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-muted-foreground text-sm">Прибыль (7 дней)</div>
                <Icon name="DollarSign" size={20} className="text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">${totalProfit.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-muted-foreground text-sm">BTC (7 дней)</div>
                <Icon name="Bitcoin" size={20} className="text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-orange-400">{totalBTC.toFixed(8)}</div>
            </CardContent>
          </Card>
        </div>

        {dashboard?.subscription && (
          <Card className="glass mb-8 border-primary glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Текущая подписка</CardTitle>
                  <CardDescription>Ваш активный план майнинга</CardDescription>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">Активна</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-muted-foreground text-sm mb-1">План</div>
                  <div className="text-2xl font-bold">{dashboard.subscription.plan_name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Мощность</div>
                  <div className="text-2xl font-bold">{dashboard.subscription.hashrate_allocation} TH/s</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Стоимость</div>
                  <div className="text-2xl font-bold text-primary">${dashboard.subscription.price_usd}/мес</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass">
          <CardHeader>
            <CardTitle>Статистика за последние 7 дней</CardTitle>
            <CardDescription>Доходность ваших майнинг-операций</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.recent_stats?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recent_stats.map((stat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="TrendingUp" size={24} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{new Date(stat.date).toLocaleDateString('ru-RU')}</div>
                        <div className="text-sm text-muted-foreground">{parseFloat(stat.daily_btc).toFixed(8)} BTC</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">${parseFloat(stat.daily_profit).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Прибыль</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="BarChart3" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Статистика появится после начала майнинга</p>
                <Button className="mt-4" onClick={() => navigate('/')}>
                  <Icon name="Rocket" size={18} className="mr-2" />
                  Выбрать тариф
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="Home" size={18} className="mr-2" />
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
