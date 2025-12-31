import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingDown, Calendar, DollarSign, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecurringExpenses() {
  const { data: recurring = [], isLoading, refetch } = trpc.transactions.analyzeRecurring.useQuery();

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "daily":
        return "Diária";
      case "weekly":
        return "Semanal";
      case "monthly":
        return "Mensal";
      case "yearly":
        return "Anual";
      default:
        return freq;
    }
  };

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case "daily":
        return "bg-red-100 text-red-800";
      case "weekly":
        return "bg-orange-100 text-orange-800";
      case "monthly":
        return "bg-yellow-100 text-yellow-800";
      case "yearly":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalAnnualImpact = recurring.reduce((sum: number, item: any) => sum + item.annualImpact, 0);
  const totalMonthlyImpact = totalAnnualImpact / 12;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Despesas Recorrentes</h1>
          <p className="text-muted-foreground">
            Identifique assinaturas e despesas recorrentes para encontrar oportunidades de economia
          </p>
        </div>



        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Despesas Recorrentes</p>
                <p className="text-3xl font-bold text-foreground">
                  {recurring.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Impacto Anual</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(totalAnnualImpact)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Impacto Mensal</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(totalMonthlyImpact)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recurring Expenses List */}
        <div className="space-y-4">
          {recurring.length > 0 ? (
            recurring.map((expense: any, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{expense.description}</h3>
                        <Badge className={getFrequencyColor(expense.frequency)}>
                          {getFrequencyLabel(expense.frequency)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Valor</p>
                          <p className="font-medium">R$ {parseFloat(expense.amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Ocorrências</p>
                          <p className="font-medium">{expense.occurrences}x</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Última Ocorrência</p>
                          <p className="font-medium">
                            {new Date(expense.lastDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Próxima Ocorrência</p>
                          <p className="font-medium">
                            {new Date(expense.nextExpectedDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground mb-2">Impacto Anual</p>
                      <p className="text-2xl font-bold text-red-600">
                        R$ {expense.annualImpact.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingDown className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Nenhuma despesa recorrente identificada
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicione mais transações para identificar padrões
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Dicas para Economizar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-900">
            <div>
              <p className="font-medium mb-1">📱 Revise Assinaturas</p>
              <p>Muitos serviços de streaming e aplicativos cobram mensalmente. Cancele os que não usa.</p>
            </div>
            <div>
              <p className="font-medium mb-1">💳 Negocie Taxas</p>
              <p>Ligue para seu banco e negocie taxas de manutenção de conta e seguros.</p>
            </div>
            <div>
              <p className="font-medium mb-1">🔄 Consolidar Gastos</p>
              <p>Combine múltiplas assinaturas em um único serviço quando possível.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
