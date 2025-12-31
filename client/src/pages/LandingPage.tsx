import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, TrendingUp, Shield, BarChart3, Target, CreditCard, Users, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function LandingPage() {
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Dashboard Inteligente",
      description: "Visualize todo seu patrimônio em um só lugar com gráficos interativos e análises em tempo real."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta e autenticação de dois fatores."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Relatórios Detalhados",
      description: "Análises profundas de seus gastos com exportação para PDF, Excel e CSV."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Metas Financeiras",
      description: "Defina e acompanhe suas metas com calculadoras inteligentes e projeções."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Gestão de Dívidas",
      description: "Planeje o pagamento de dívidas com estratégias snowball e avalanche."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Colaboração Familiar",
      description: "Compartilhe orçamentos e metas com sua família de forma segura."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "IA Integrada",
      description: "Assistente financeiro com inteligência artificial para análises personalizadas."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Investimentos",
      description: "Acompanhe a performance de sua carteira e compare com benchmarks."
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar",
      features: [
        "Até 3 contas financeiras",
        "Categorização manual",
        "Orçamentos básicos",
        "1 meta financeira",
        "Relatórios mensais",
        "Suporte por email"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Premium",
      price: "R$ 99",
      period: "/mês",
      description: "Para quem quer mais controle",
      features: [
        "Contas ilimitadas",
        "Categorização automática com IA",
        "Orçamentos avançados",
        "Metas ilimitadas",
        "Gestão de dívidas",
        "Acompanhamento de investimentos",
        "Relatórios ilimitados",
        "Assistente IA",
        "Suporte prioritário"
      ],
      cta: "Assinar Premium",
      popular: true
    },
    {
      name: "Family",
      price: "R$ 199",
      period: "/mês",
      description: "Para toda a família",
      features: [
        "Tudo do Premium",
        "Até 5 membros da família",
        "Orçamentos compartilhados",
        "Metas familiares",
        "Dashboard consolidado",
        "Controle de permissões",
        "Suporte VIP 24/7"
      ],
      cta: "Assinar Family",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      content: "O FinMaster Pro transformou completamente a forma como gerencio minhas finanças. Consegui economizar 30% em 3 meses!",
      avatar: "MS"
    },
    {
      name: "João Santos",
      role: "Desenvolvedor",
      content: "A integração com IA é incrível! O assistente me ajuda a tomar decisões financeiras mais inteligentes todos os dias.",
      avatar: "JS"
    },
    {
      name: "Ana Costa",
      role: "Médica",
      content: "Finalmente consigo acompanhar meus investimentos e dívidas em um só lugar. Interface intuitiva e relatórios excelentes!",
      avatar: "AC"
    }
  ];

  const faqs = [
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Você tem 14 dias para testar todos os recursos Premium sem compromisso. Não é necessário cartão de crédito para começar."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim! Utilizamos criptografia de ponta a ponta, autenticação de dois fatores e estamos em conformidade com a LGPD."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem taxas ou multas. Seus dados ficam disponíveis por 30 dias após o cancelamento."
    },
    {
      question: "Como funciona a categorização automática?",
      answer: "Nossa IA analisa suas transações e as categoriza automaticamente. O sistema aprende com suas correções para melhorar continuamente."
    },
    {
      question: "Posso usar em múltiplos dispositivos?",
      answer: "Sim! O FinMaster Pro funciona em qualquer dispositivo - computador, tablet ou smartphone, com sincronização automática."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Nav */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FinMaster Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Preços
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Depoimentos
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
            <Button asChild>
              <a href={getLoginUrl()}>Começar Grátis</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Controle Total das Suas{" "}
              <span className="text-primary">Finanças Pessoais</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Gerencie contas, orçamentos, metas e investimentos em uma plataforma completa com inteligência artificial. 
              Tome decisões financeiras mais inteligentes com o FinMaster Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>Começar Grátis</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Ver Recursos</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Teste grátis por 14 dias ✓ Sem cartão de crédito ✓ Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos Poderosos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar suas finanças de forma profissional
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={plan.popular ? "border-primary shadow-lg" : ""}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                    <a href={getLoginUrl()}>{plan.cta}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O Que Dizem Nossos Clientes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Milhares de pessoas já transformaram suas finanças com o FinMaster Pro
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas sobre o FinMaster Pro
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Transformar Suas Finanças?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já estão no controle total de suas finanças
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href={getLoginUrl()}>Começar Grátis Agora</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">FinMaster Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Gestão financeira inteligente para você e sua família.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Preços</a></li>
                <li><a href="#" className="hover:text-foreground">Segurança</a></li>
                <li><a href="#" className="hover:text-foreground">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Carreiras</a></li>
                <li><a href="#" className="hover:text-foreground">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground">LGPD</a></li>
                <li><a href="#" className="hover:text-foreground">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 FinMaster Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
