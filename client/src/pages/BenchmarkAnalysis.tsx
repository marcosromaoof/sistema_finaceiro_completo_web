import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Target, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "@/components/skeletons/PageSkeleton";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { InfoTooltip } from "@/components/InfoTooltip";

type RangeOption = "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max";
type BenchmarkOption = "ibovespa" | "sp500" | "cdi";

export default function BenchmarkAnalysis() {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("1y");
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkOption>("ibovespa");

  const { data: comparison, isLoading, refetch } = trpc.benchmarks.comparePortfolio.useQuery({
    benchmark: selectedBenchmark,
    range: selectedRange,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getBenchmarkLabel = (benchmark: string) => {
    const labels = {
      ibovespa: "Ibovespa",
      sp500: "S&P 500",
      cdi: "CDI",
    };
    return labels[benchmark as keyof typeof labels] || benchmark;
  };

  const getRangeLabel = (range: string) => {
    const labels = {
      "1mo": "1 Mês",
      "3mo": "3 Meses",
      "6mo": "6 Meses",
      "1y": "1 Ano",
      "2y": "2 Anos",
      "5y": "5 Anos",
      max: "Máximo",
    };
    return labels[range as keyof typeof labels] || range;
  };

  // Preparar dados para o gráfico
  const chartData = comparison?.benchmarkHistory.data.map((item, index) => {
    const benchmarkValue = item.value;
    const benchmarkChange = ((benchmarkValue - comparison.benchmarkHistory.data[0].value) / 
      comparison.benchmarkHistory.data[0].value) * 100;

    // Simular evolução do portfólio (em produção, usar dados reais)
    const portfolioChange = comparison.portfolio.returnPercent * (index / comparison.benchmarkHistory.data.length);

    return {
      date: new Date(item.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
      benchmark: benchmarkChange,
      portfolio: portfolioChange,
    };
  }) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Análise de Performance
            </h1>
            <p className="text-muted-foreground">
              Compare seus investimentos com benchmarks do mercado
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Período</p>
                <div className="flex gap-2">
                  {(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as RangeOption[]).map((range) => (
                    <Button
                      key={range}
                      variant={selectedRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRange(range)}
                    >
                      {getRangeLabel(range)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Benchmark</p>
                <div className="flex gap-2">
                  {(["ibovespa", "sp500", "cdi"] as BenchmarkOption[]).map((benchmark) => (
                    <Button
                      key={benchmark}
                      variant={selectedBenchmark === benchmark ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedBenchmark(benchmark)}
                    >
                      {getBenchmarkLabel(benchmark)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Seu Portfólio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPercent(comparison?.portfolio.returnPercent || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(comparison?.portfolio.currentValue || 0)}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  (comparison?.portfolio.returnPercent || 0) >= 0 
                    ? "bg-green-100 dark:bg-green-950" 
                    : "bg-red-100 dark:bg-red-950"
                }`}>
                  {(comparison?.portfolio.returnPercent || 0) >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {getBenchmarkLabel(selectedBenchmark)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPercent(comparison?.benchmarkHistory.changePercent || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getRangeLabel(selectedRange)}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  (comparison?.benchmarkHistory.changePercent || 0) >= 0 
                    ? "bg-blue-100 dark:bg-blue-950" 
                    : "bg-orange-100 dark:bg-orange-950"
                }`}>
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Alpha
                </CardTitle>
                <InfoTooltip 
                  content="O Alpha mede o retorno do seu portfólio acima (ou abaixo) do benchmark. Um Alpha positivo indica que você está batendo o mercado."
                  side="right"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPercent(comparison?.metrics.alpha || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    vs {getBenchmarkLabel(selectedBenchmark)}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  (comparison?.metrics.alpha || 0) >= 0 
                    ? "bg-green-100 dark:bg-green-950" 
                    : "bg-red-100 dark:bg-red-950"
                }`}>
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              {(comparison?.metrics.alpha || 0) > 0 ? (
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                  Superando o mercado
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-2 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">
                  Abaixo do mercado
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ganho/Perda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className={`text-2xl font-bold ${
                  (comparison?.portfolio.return || 0) >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {formatCurrency(comparison?.portfolio.return || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Investido: {formatCurrency(comparison?.portfolio.initialValue || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparativa</CardTitle>
            <CardDescription>
              Evolução do seu portfólio vs {getBenchmarkLabel(selectedBenchmark)} nos últimos {getRangeLabel(selectedRange).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Seu Portfólio"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name={getBenchmarkLabel(selectedBenchmark)}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Insights de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
            {(comparison?.metrics.alpha || 0) > 0 ? (
              <div>
                <p className="font-medium mb-1">✅ Excelente Performance</p>
                <p>
                  Seu portfólio está superando o {getBenchmarkLabel(selectedBenchmark)} em {formatPercent(comparison?.metrics.alpha || 0)}. 
                  Continue diversificando e monitorando seus investimentos.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium mb-1">⚠️ Performance Abaixo do Mercado</p>
                <p>
                  Seu portfólio está {formatPercent(Math.abs(comparison?.metrics.alpha || 0))} abaixo do {getBenchmarkLabel(selectedBenchmark)}. 
                  Considere revisar sua estratégia de investimentos e diversificar mais.
                </p>
              </div>
            )}
            <div>
              <p className="font-medium mb-1">📊 Alpha Explicado</p>
              <p>
                O Alpha mede o retorno do seu portfólio acima (ou abaixo) do benchmark. 
                Um Alpha positivo indica que você está batendo o mercado, enquanto negativo indica performance inferior.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
