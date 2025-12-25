import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [hashrate, setHashrate] = useState('100');
  const [power, setPower] = useState('3000');
  const [electricity, setElectricity] = useState('0.05');

  const calculateProfit = () => {
    const btcPrice = 42000;
    const dailyBTC = (parseFloat(hashrate) / 1000000) * 0.00001;
    const dailyRevenue = dailyBTC * btcPrice;
    const dailyElectricity = (parseFloat(power) / 1000) * 24 * parseFloat(electricity);
    return (dailyRevenue - dailyElectricity).toFixed(2);
  };

  const cryptoStats = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$42,157', change: '+2.4%', hashrate: '450 EH/s' },
    { name: 'Ethereum', symbol: 'ETH', price: '$2,234', change: '+1.8%', hashrate: '950 TH/s' },
    { name: 'Litecoin', symbol: 'LTC', price: '$73.21', change: '-0.5%', hashrate: '680 TH/s' },
  ];

  const equipment = [
    {
      name: 'Antminer S19 Pro',
      hashrate: '110 TH/s',
      power: '3250W',
      price: '$2,899',
      efficiency: '29.5 J/TH',
      image: '⚡'
    },
    {
      name: 'Whatsminer M30S++',
      hashrate: '112 TH/s',
      power: '3472W',
      price: '$2,699',
      efficiency: '31 J/TH',
      image: '🔥'
    },
    {
      name: 'AvalonMiner 1246',
      hashrate: '90 TH/s',
      power: '3420W',
      price: '$2,199',
      efficiency: '38 J/TH',
      image: '⛏️'
    },
  ];

  const services = [
    {
      name: 'Базовый',
      price: '499',
      features: ['10 TH/s мощности', 'Электричество включено', 'Круглосуточный мониторинг', 'Базовая поддержка'],
      popular: false
    },
    {
      name: 'Профессиональный',
      price: '999',
      features: ['50 TH/s мощности', 'Электричество включено', 'Круглосуточный мониторинг', 'Приоритетная поддержка', 'Персональный менеджер'],
      popular: true
    },
    {
      name: 'Корпоративный',
      price: '2499',
      features: ['200 TH/s мощности', 'Электричество включено', 'Круглосуточный мониторинг', 'VIP поддержка', 'Персональный менеджер', 'Индивидуальные условия'],
      popular: false
    },
  ];

  const team = [
    { name: 'Алексей Иванов', role: 'CEO & Основатель', experience: '15 лет в криптоиндустрии' },
    { name: 'Мария Петрова', role: 'Технический директор', experience: '10 лет в разработке ПО' },
    { name: 'Дмитрий Сидоров', role: 'Директор по операциям', experience: '12 лет в дата-центрах' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">⛏️</div>
            <span className="text-2xl font-bold text-gradient">CryptoMine</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground/80 hover:text-primary transition-colors">Главная</a>
            <a href="#equipment" className="text-foreground/80 hover:text-primary transition-colors">Оборудование</a>
            <a href="#calculator" className="text-foreground/80 hover:text-primary transition-colors">Калькулятор</a>
            <a href="#services" className="text-foreground/80 hover:text-primary transition-colors">Услуги</a>
            <a href="#stats" className="text-foreground/80 hover:text-primary transition-colors">Статистика</a>
            <a href="#about" className="text-foreground/80 hover:text-primary transition-colors">О проекте</a>
          </div>
          <Button className="glow-hover">
            <Icon name="LogIn" size={18} className="mr-2" />
            Войти
          </Button>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-primary/20 text-primary border-primary/30">Новое поколение майнинга</Badge>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Майнинг <span className="text-gradient">нового уровня</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Профессиональное оборудование, прозрачная статистика и максимальная доходность для вашего бизнеса
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="glow-hover">
                  <Icon name="Rocket" size={20} className="mr-2" />
                  Начать майнинг
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30">
                  <Icon name="PlayCircle" size={20} className="mr-2" />
                  Как это работает
                </Button>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl animate-pulse-glow"></div>
              <Card className="glass relative">
                <CardHeader>
                  <CardTitle>Живая статистика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cryptoStats.map((crypto, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                          {crypto.symbol === 'BTC' ? '₿' : crypto.symbol === 'ETH' ? 'Ξ' : 'Ł'}
                        </div>
                        <div>
                          <div className="font-semibold">{crypto.name}</div>
                          <div className="text-sm text-muted-foreground">{crypto.hashrate}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{crypto.price}</div>
                        <div className={`text-sm ${crypto.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {crypto.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="equipment" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">Оборудование</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Топовое оборудование для майнинга</h2>
            <p className="text-xl text-muted-foreground">Профессиональные ASIC-майнеры с лучшей эффективностью</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {equipment.map((item, i) => (
              <Card key={i} className="glass hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader>
                  <div className="text-6xl mb-4 text-center">{item.image}</div>
                  <CardTitle className="text-center">{item.name}</CardTitle>
                  <CardDescription className="text-center text-lg font-bold text-primary">{item.price}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Хешрейт:</span>
                    <span className="font-semibold">{item.hashrate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Мощность:</span>
                    <span className="font-semibold">{item.power}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Эффективность:</span>
                    <span className="font-semibold">{item.efficiency}</span>
                  </div>
                  <Button className="w-full glow-hover mt-4">
                    <Icon name="ShoppingCart" size={18} className="mr-2" />
                    Заказать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Калькулятор</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Рассчитайте доходность</h2>
            <p className="text-xl text-muted-foreground">Узнайте потенциальную прибыль от майнинга</p>
          </div>
          <Card className="glass animate-scale-in">
            <CardHeader>
              <CardTitle>Калькулятор майнинга Bitcoin</CardTitle>
              <CardDescription>Введите параметры вашего оборудования</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hashrate">Хешрейт (TH/s)</Label>
                <Input
                  id="hashrate"
                  type="number"
                  value={hashrate}
                  onChange={(e) => setHashrate(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="power">Потребление энергии (Вт)</Label>
                <Input
                  id="power"
                  type="number"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electricity">Стоимость электричества ($/кВт⋅ч)</Label>
                <Input
                  id="electricity"
                  type="number"
                  step="0.01"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-center text-lg mb-2">
                  <span>Дневная прибыль:</span>
                  <span className="font-bold text-2xl text-primary">${calculateProfit()}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Месячная прибыль:</span>
                  <span className="font-semibold">${(parseFloat(calculateProfit()) * 30).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Годовая прибыль:</span>
                  <span className="font-semibold">${(parseFloat(calculateProfit()) * 365).toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full glow-hover">
                <Icon name="Calculator" size={18} className="mr-2" />
                Детальный расчет
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="services" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">Услуги</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Тарифные планы</h2>
            <p className="text-xl text-muted-foreground">Выберите подходящий план для вашего бизнеса</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <Card key={i} className={`glass animate-fade-in-up relative ${service.popular ? 'border-primary glow scale-105' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary">Популярный</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center text-2xl">{service.name}</CardTitle>
                  <CardDescription className="text-center">
                    <span className="text-4xl font-bold text-primary">${service.price}</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Icon name="Check" size={18} className="text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  <Button className={`w-full mt-6 ${service.popular ? 'glow-hover' : ''}`}>
                    <Icon name="Zap" size={18} className="mr-2" />
                    Выбрать план
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Статистика</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Наши достижения</h2>
            <p className="text-xl text-muted-foreground">Цифры, которые говорят сами за себя</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { value: '2.5 EH/s', label: 'Общий хешрейт', icon: 'Activity' },
              { value: '12,000+', label: 'Активных майнеров', icon: 'Users' },
              { value: '99.9%', label: 'Аптайм', icon: 'TrendingUp' },
              { value: '$50M+', label: 'Выплачено клиентам', icon: 'DollarSign' },
            ].map((stat, i) => (
              <Card key={i} className="glass text-center animate-scale-in hover:scale-110 transition-transform" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon name={stat.icon as any} size={32} className="text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">О проекте</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Наша команда</h2>
            <p className="text-xl text-muted-foreground">Профессионалы с многолетним опытом</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {team.map((member, i) => (
              <Card key={i} className="glass text-center animate-fade-in-up hover:scale-105 transition-transform" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="pt-8 pb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-4xl">
                    👤
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-primary font-semibold mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.experience}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass max-w-3xl mx-auto animate-scale-in">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4 text-center">О CryptoMine</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                CryptoMine — это профессиональная платформа для майнинга криптовалют, основанная в 2020 году. 
                Мы предоставляем полный спектр услуг от подбора оборудования до размещения и обслуживания майнинг-ферм.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Наши дата-центры расположены в регионах с дешевой электроэнергией и оптимальными климатическими условиями. 
                Мы гарантируем максимальную доходность и прозрачность всех операций.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">⛏️</div>
                <span className="text-xl font-bold text-gradient">CryptoMine</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Профессиональный майнинг криптовалют с максимальной доходностью
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Продукты</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#equipment" className="hover:text-primary transition-colors">Оборудование</a></li>
                <li><a href="#calculator" className="hover:text-primary transition-colors">Калькулятор</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors">Услуги</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#about" className="hover:text-primary transition-colors">О нас</a></li>
                <li><a href="#stats" className="hover:text-primary transition-colors">Статистика</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Контакты</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Связь</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>support@cryptomine.com</li>
                <li>+7 (495) 123-45-67</li>
                <li className="flex gap-3 mt-4">
                  <a href="#" className="hover:text-primary transition-colors">
                    <Icon name="Github" size={20} />
                  </a>
                  <a href="#" className="hover:text-primary transition-colors">
                    <Icon name="Twitter" size={20} />
                  </a>
                  <a href="#" className="hover:text-primary transition-colors">
                    <Icon name="Linkedin" size={20} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 CryptoMine. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
