import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingDown, Calendar, DollarSign, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RecurringExpense {
  id: number;
  description: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  category: string;
  lastDate: Date;
  nextDate: Date;
  status: "active" | "inactive";
  savings?: number;
}

export default function RecurringExpenses() {
  const { data: transactions } = trpc.transactions.list.useQuery({});
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRecurringExpenses = () => {
    setIsAnalyzing(true);

    try {
      if (!transactions || transactions.length === 0) {
        toast.error("Nenhuma transação encontrada");
        setIsAnalyzing(false);
        return;
      }

      // Group transactions by description
      const grouped = transactions.reduce(
        (acc, t) => {
          const key = t.description || "Sem descrição";
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(t);
          return acc;
        },
        {} as Record<string, any[]>
      );

      // Identify recurring patterns
      const recurring: RecurringExpense[] = [];

      Object.entries(grouped).forEach(([description, trans]) => {
        if (trans.length >= 2) {
          // Sort by date
          const sorted = trans.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          // Calculate intervals
          const intervals: number[] = [];
          for (let i = 1; i < sorted.length; i++) {
            const diff = new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime();
            intervals.push(Math.round(diff / (1000 * 60 * 60 * 24))); // Convert to days
          }

          // Check if intervals are consistent (within 2 days tolerance)
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const isConsistent = intervals.every((i) => Math.abs(i - avgInterval) <= 2);

          if (isConsistent && avgInterval > 0) {
            let frequency: "daily" | "weekly" | "monthly" | "yearly" = "monthly";
            if (avgInterval <= 1) frequency = "daily";
            else if (avgInterval <= 7) frequency = "weekly";
            else if (avgInterval <= 35) frequency = "monthly";
            else frequency = "yearly";

            const avgAmount = trans.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) / trans.length;
            const lastDate = new Date(sorted[sorted.length - 1].date);
            const nextDate = new Date(lastDate);

            if (frequency === "daily") nextDate.setDate(nextDate.getDate() + 1);
            else if (frequency === "weekly") nextDate.setDate(nextDate.getDate() + 7);
            else if (frequency === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
            else nextDate.setFullYear(nextDate.getFullYear() + 1);

            // Calculate potential savings if cancelled
            let monthlySavings = 0;
            if (frequency === "daily") monthlySavings = avgAmount * 30;
            else if (frequency === "weekly") monthlySavings = avgAmount * 4.33;
            else if (frequency === "monthly") monthlySavings = avgAmount;
            else monthlySavings = avgAmount / 12;

            recurring.push({
              id: Math.random(),
              description,
              amount: avgAmount,
              frequency,
              category: trans[0].categoryId || "Sem categoria",
              lastDate,
              nextDate,
              status: "active",
              savings: monthlySavings,
            });
          }
        }
      });

      setRecurringExpenses(recurring.sort((a, b) => (b.savings || 0) - (a.savings || 0)));
      toast.success(`${recurring.length} despesas recorrentes identificadas!`);
    } catch (error) {
      toast.error("Erro ao analisar despesas recorrentes");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const totalMonthlySavings = recurringExpenses.reduce((sum, e) => sum + (e.savings || 0), 0);
  const totalMonthlyExpense = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);

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

        {/* Analysis Button */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Analisar Despesas Recorrentes</p>
                  <p className="text-sm text-blue-700">
                    Clique para identificar padrões de gastos repetidos
                  </p>
                </div>
              </div>
              <Button onClick={analyzeRecurringExpenses} disabled={isAnalyzing}>
                {isAnalyzing ? "Analisando..." : "Analisar Agora"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {recurringExpenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Despesas Recorrentes</p>
                  <p className="text-3xl font-bold text-foreground">
                    {recurringExpenses.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Gasto Mensal</p>
                  <p className="text-3xl font-bold text-red-600">
                    R$ {totalMonthlyExpense.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Economia Potencial</p>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {totalMonthlySavings.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recurring Expenses List */}
        <div className="space-y-4">
          {recurringExpenses.length > 0 ? (
            recurringExpenses.map((expense) => (
              <Card key={expense.id}>
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
                          <p className="font-medium">R$ {expense.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Categoria</p>
                          <p className="font-medium">{expense.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Última Ocorrência</p>
                          <p className="font-medium">
                            {expense.lastDate.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Próxima Ocorrência</p>
                          <p className="font-medium">
                            {expense.nextDate.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground mb-2">Economia Mensal</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {(expense.savings || 0).toFixed(2)}
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Cancelar
                      </Button>
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
                  Clique em "Analisar Agora" para começar
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
