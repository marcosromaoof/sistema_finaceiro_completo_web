import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UpcomingBills } from "@/components/UpcomingBills";

export default function Home() {
  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
      icon: Wallet,
      trend: summary.netWorth >= 0 ? "up" : "down",
      color: summary.netWorth >= 0 ? "text-accent" : "text-destructive",
      bgColor: summary.netWorth >= 0 ? "bg-accent/10" : "bg-destructive/10",
    },
    {
      title: "Receitas do Mês",
      value: formatCurrency(summary.monthIncome),
      icon: TrendingUp,
      trend: "up",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Despesas do Mês",
      value: formatCurrency(summary.monthExpenses),
      icon: TrendingDown,
      trend: "down",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Saldo Total",
      value: formatCurrency(summary.totalBalance),
      icon: CreditCard,
      trend: summary.totalBalance >= 0 ? "up" : "down",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-5 h-5 text-accent" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-destructive" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {summary.accountsCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                contas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {summary.activeGoalsCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                metas em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {summary.unreadAlertsCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                notificações não lidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bills */}
        <UpcomingBills />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma transação encontrada
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comece adicionando suas contas e transações
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === "income"
                            ? "bg-accent/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-4 h-4 text-accent" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
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
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-accent"
                            : "text-destructive"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(parseFloat(transaction.amount))}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
