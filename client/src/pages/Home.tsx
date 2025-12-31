import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Plus,
  BarChart3,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UpcomingBills } from "@/components/UpcomingBills";
import { DashboardSkeleton } from "@/components/skeletons/PageSkeleton";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { PatrimonyChart } from "@/components/PatrimonyChart";
import { GoalsSection } from "@/components/GoalsSection";
import { CategoryChart } from "@/components/CategoryChart";
import { AIInsights } from "@/components/AIInsights";
import { GamificationWidget } from "@/components/GamificationWidget";

export default function Home() {
  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Get current hour for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bom dia" : currentHour < 18 ? "Boa tarde" : "Boa noite";
  const greetingIcon = currentHour < 18 ? Sun : Moon;
  const GreetingIcon = greetingIcon;

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (!summary) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Não foi possível carregar os dados</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Patrimônio Líquido",
      value: formatCurrency(summary.netWorth),
      change: "+12.5%",
      icon: Wallet,
      trend: summary.netWorth >= 0 ? "up" : "down",
      color: summary.netWorth >= 0 ? "text-prosperity" : "text-destructive",
      bgColor: summary.netWorth >= 0 ? "bg-prosperity/10" : "bg-destructive/10",
    },
    {
      title: "Receitas do Mês",
      value: formatCurrency(summary.monthIncome),
      change: "+8.2%",
      icon: TrendingUp,
      trend: "up",
      color: "text-prosperity",
      bgColor: "bg-prosperity/10",
    },
    {
      title: "Despesas do Mês",
      value: formatCurrency(summary.monthExpenses),
      change: "-5.1%",
      icon: TrendingDown,
      trend: "down",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Saldo Disponível",
      value: formatCurrency(summary.totalBalance),
      change: "+15.7%",
      icon: CreditCard,
      trend: summary.totalBalance >= 0 ? "up" : "down",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Premium Header with Greeting */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GreetingIcon className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  {greeting}!
                </h1>
              </div>
              <p className="text-muted-foreground">
                Aqui está um resumo das suas finanças
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Premium Metric Cards */}
        <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StaggerItem key={stat.title}>
              <div className="metric-card group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-prosperity' : 'text-destructive'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </h3>
                
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    em relação ao mês passado
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="metric-card hover-lift ripple group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Contas Ativas</h3>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {summary.accountsCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              contas cadastradas
            </p>
          </div>

          <div className="metric-card hover-lift ripple group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Metas Ativas</h3>
              <div className="p-2 rounded-lg bg-prosperity/10 group-hover:bg-prosperity/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-prosperity" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {summary.activeGoalsCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              metas em andamento
            </p>
          </div>

          <div className="metric-card hover-lift ripple group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Alertas</h3>
              <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {summary.unreadAlertsCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              notificações não lidas
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PatrimonyChart />
          <CategoryChart />
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Transactions - 2 columns */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Transações Recentes</h2>
                    <p className="text-sm text-muted-foreground">
                      Últimas movimentações
                    </p>
                  </div>
                  <button className="text-sm text-primary hover:underline">
                    Ver todas →
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {summary.recentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma transação encontrada
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comece adicionando suas contas e transações
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {summary.recentTransactions.slice(0, 6).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              transaction.type === "income"
                                ? "bg-prosperity/10"
                                : "bg-destructive/10"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="w-4 h-4 text-prosperity" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {transaction.description || "Sem descrição"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(transaction.date), "dd MMM yyyy", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-mono font-semibold ${
                              transaction.type === "income"
                                ? "text-prosperity"
                                : "text-destructive"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                          </p>
                          {transaction.isPending && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Bills - 1 column */}
          <div className="lg:col-span-1">
            <UpcomingBills />
          </div>
        </div>

        {/* Two Column: AI Insights + Gamification */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AIInsights />
          <GamificationWidget />
        </div>

        {/* Goals Section */}
        <GoalsSection />

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="metric-card text-center hover-lift ripple group">
            <div className="p-3 rounded-lg bg-prosperity/10 w-fit mx-auto mb-3 group-hover:bg-prosperity/20 transition-colors">
              <Plus className="h-8 w-8 text-prosperity" />
            </div>
            <span className="text-sm font-medium">Adicionar Transação</span>
          </button>
          <button className="metric-card text-center hover-lift ripple group">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <span className="text-sm font-medium">Ver Gráficos</span>
          </button>
          <button className="metric-card text-center hover-lift ripple group">
            <div className="p-3 rounded-lg bg-secondary/10 w-fit mx-auto mb-3 group-hover:bg-secondary/20 transition-colors">
              <Wallet className="h-8 w-8 text-secondary" />
            </div>
            <span className="text-sm font-medium">Gerenciar Contas</span>
          </button>
          <button className="metric-card text-center hover-lift ripple group">
            <div className="p-3 rounded-lg bg-muted/30 w-fit mx-auto mb-3 group-hover:bg-muted/50 transition-colors">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Configurações</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
