import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  title: string;
  description: string;
  icon: 'lightbulb' | 'trending-up' | 'trending-down' | 'alert' | 'sparkles';
  action?: {
    label: string;
    href: string;
  };
}

interface AIInsightsProps {
  insights?: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  // Mock insights se não houver dados reais
  const mockInsights: Insight[] = [
    {
      id: '1',
      type: 'success',
      title: 'Economia recorde em transporte!',
      description: 'Você economizou 23% em transporte este mês comparado ao anterior. Continue assim!',
      icon: 'trending-down',
      action: {
        label: 'Ver Detalhes',
        href: '/transacoes?category=transporte',
      },
    },
    {
      id: '2',
      type: 'warning',
      title: 'Padrão detectado: gastos às sextas',
      description: 'Seus gastos com lazer aumentam 45% às sextas-feiras. Considere planejar melhor.',
      icon: 'alert',
      action: {
        label: 'Criar Orçamento',
        href: '/orcamentos',
      },
    },
    {
      id: '3',
      type: 'info',
      title: 'Meta de emergência quase completa',
      description: 'Faltam apenas R$ 1.500 para atingir sua meta de fundo de emergência. Você está 90% lá!',
      icon: 'trending-up',
      action: {
        label: 'Adicionar Valor',
        href: '/metas',
      },
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Melhor mês do ano!',
      description: 'Este foi seu melhor mês em economia. Você guardou 18% da sua renda total.',
      icon: 'sparkles',
      action: {
        label: 'Ver Relatório',
        href: '/relatorios',
      },
    },
  ];

  const displayInsights = insights || mockInsights;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'lightbulb':
        return Lightbulb;
      case 'trending-up':
        return TrendingUp;
      case 'trending-down':
        return TrendingDown;
      case 'alert':
        return AlertTriangle;
      case 'sparkles':
        return Sparkles;
      default:
        return Lightbulb;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-prosperity/10',
          border: 'border-prosperity/30',
          icon: 'text-prosperity',
          iconBg: 'bg-prosperity/20',
        };
      case 'warning':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          icon: 'text-destructive',
          iconBg: 'bg-destructive/20',
        };
      case 'info':
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          icon: 'text-primary',
          iconBg: 'bg-primary/20',
        };
      case 'achievement':
        return {
          bg: 'bg-secondary/10',
          border: 'border-secondary/30',
          icon: 'text-secondary',
          iconBg: 'bg-secondary/20',
        };
      default:
        return {
          bg: 'bg-muted/10',
          border: 'border-muted/30',
          icon: 'text-muted-foreground',
          iconBg: 'bg-muted/20',
        };
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Insights da IA</h2>
              <p className="text-sm text-muted-foreground">
                Análises inteligentes do seu comportamento financeiro
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {displayInsights.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum insight disponível no momento
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Continue usando o sistema para gerar análises
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {displayInsights.map((insight) => {
              const Icon = getIcon(insight.icon);
              const styles = getStyles(insight.type);

              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl border-2 ${styles.bg} ${styles.border} hover-lift ripple group cursor-pointer`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${styles.iconBg} group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-5 w-5 ${styles.icon}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    
                    {insight.action && (
                      <Link href={insight.action.href}>
                        <button className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${styles.icon} ${styles.iconBg} hover:scale-105`}>
                          {insight.action.label}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
