import { Button } from "@/components/ui/button";
import SupportChatWidget from "@/components/SupportChatWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, TrendingUp, Shield, BarChart3, Target, CreditCard, Users, Zap, Wallet, Sparkles, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function LandingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const createCheckoutSession = trpc.checkout.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Erro ao iniciar checkout", {
        description: error.message,
      });
      setLoadingPlan(null);
    },
  });

  const handleCheckout = async (plan: "free" | "premium" | "family") => {
    if (plan === "free") {
      window.location.href = getLoginUrl();
      return;
    }

    setLoadingPlan(plan);
    createCheckoutSession.mutate({ plan });
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Dashboard Inteligente",
      description: "Visualize todo seu patrimônio em um só lugar com gráficos interativos e análises em tempo real."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta e autenticação de dois fatores."
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Análises profundas de seus gastos com exportação para PDF, Excel e CSV."
    },
    {
      icon: Target,
      title: "Metas Financeiras",
      description: "Defina e acompanhe suas metas com calculadoras inteligentes e projeções."
    },
    {
      icon: CreditCard,
      title: "Gestão de Dívidas",
      description: "Planeje o pagamento de dívidas com estratégias snowball e avalanche."
    },
    {
      icon: Users,
      title: "Colaboração Familiar",
      description: "Compartilhe orçamentos e metas com sua família de forma segura."
    },
    {
      icon: Zap,
      title: "IA Integrada",
      description: "Assistente financeiro com inteligência artificial para análises personalizadas."
    },
    {
      icon: BarChart3,
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
      content: "O Organizai transformou completamente a forma como gerencio minhas finanças. Consegui economizar 30% em 3 meses!",
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
      answer: "Sim! O Organizai funciona em qualquer dispositivo - computador, tablet ou smartphone, com sincronização automática."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header/Nav */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg gradient-prosperity flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">Organizai</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
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
            <Button asChild className="gradient-prosperity border-0 hover-lift">
              <a href={getLoginUrl()}>Começar Grátis</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden gradient-sky py-24 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-prosperity/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-premium/20 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 fade-in">
              <span className="w-2 h-2 rounded-full bg-prosperity animate-pulse" />
              <span className="text-sm text-white">
                Sua fortuna, organizada.
              </span>
            </div>
            
            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 slide-up">
              Gerencie suas finanças com
              <span className="text-gradient-prosperity block mt-2">
                inteligência artificial
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto slide-up" style={{ animationDelay: '0.1s' }}>
              Controle completo de contas, orçamentos, metas e investimentos.
              Análises inteligentes para decisões financeiras mais assertivas.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" asChild className="gradient-prosperity border-0 hover-lift ripple text-lg px-8 py-6">
                <a href={getLoginUrl()}>
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="glass hover:bg-white/10 text-white border-white/20 hover-lift text-lg px-8 py-6">
                <a href="#features">Ver Demonstração</a>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <p className="text-sm text-white/70 mt-8 flex items-center justify-center gap-6 flex-wrap">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-prosperity" />
                Teste grátis por 14 dias
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-prosperity" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-prosperity" />
                Cancele quando quiser
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Recursos Poderosos</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa para
              <span className="text-gradient-prosperity"> organizar suas finanças</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais para gestão financeira pessoal e familiar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="metric-card group fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 gradient-emerald">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="fade-in">
              <div className="text-5xl font-bold mb-2">10k+</div>
              <div className="text-white/80">Usuários Ativos</div>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold mb-2">R$ 50M+</div>
              <div className="text-white/80">Patrimônio Gerenciado</div>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold mb-2">4.9/5</div>
              <div className="text-white/80">Avaliação Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-4">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Planos Flexíveis</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Planos para todos os perfis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`metric-card relative fade-in ${
                  plan.popular ? 'ring-2 ring-primary scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full gradient-prosperity text-white text-sm font-semibold shadow-lg">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full hover-lift ripple ${
                    plan.popular 
                      ? 'gradient-prosperity border-0' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  size="lg"
                  onClick={() => handleCheckout(plan.name.toLowerCase() as "free" | "premium" | "family")}
                  disabled={loadingPlan === plan.name.toLowerCase()}
                >
                  {loadingPlan === plan.name.toLowerCase() ? "Processando..." : plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Milhares de pessoas já transformaram suas finanças com o Organizai
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="metric-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full gradient-prosperity flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas sobre o Organizai
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="metric-card fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-sky">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 fade-in">
              Pronto para transformar suas finanças?
            </h2>
            <p className="text-xl text-white/80 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
              Junte-se a milhares de usuários que já estão no controle do seu dinheiro
            </p>
            <Button size="lg" asChild className="gradient-prosperity border-0 hover-lift ripple text-lg px-8 py-6 fade-in" style={{ animationDelay: '0.2s' }}>
              <a href={getLoginUrl()}>
                Começar Grátis Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg gradient-prosperity flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">Organizai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sua fortuna, organizada.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Organizai. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <SupportChatWidget />
    </div>
  );
}
