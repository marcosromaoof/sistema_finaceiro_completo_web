import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
  BarChart3,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PortfolioAnalysis() {
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

  // Queries
  const { data: investments = [], isLoading: investmentsLoading } = trpc.investments.list.useQuery();
  const { data: dividends = [] } = trpc.dividends.list.useQuery({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular métricas da carteira
  const totalInvested = investments.reduce((sum, inv: any) => sum + parseFloat(inv.totalInvested || 0), 0);
  const currentValue = investments.reduce((sum, inv: any) => sum + parseFloat(inv.currentValue || inv.totalInvested || 0), 0);
  const totalReturn = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Diversificação por tipo
  const diversificationData = investments.reduce((acc: any, inv: any) => {
    const type = inv.type || "other";
    const value = parseFloat(inv.currentValue || inv.totalInvested || 0);
    
    if (!acc[type]) {
      acc[type] = { type, value: 0, count: 0 };
    }
    acc[type].value += value;
    acc[type].count += 1;
    return acc;
  }, {});

  const typeLabels: Record<string, string> = {
    stocks: "Ações",
    bonds: "Títulos",
    funds: "Fundos",
    real_estate: "Imóveis",
    crypto: "Cripto",
    other: "Outros",
  };

  const diversificationChartData = Object.values(diversificationData).map((item: any) => ({
    name: typeLabels[item.type] || item.type,
    value: item.value,
    percentage: totalInvested > 0 ? ((item.value / currentValue) * 100).toFixed(1) : 0,
  }));

  // Performance por investimento
  const performanceData = investments
    .map((inv: any) => {
      const invested = parseFloat(inv.totalInvested || 0);
      const current = parseFloat(inv.currentValue || invested);
      const returnValue = current - invested;
      const returnPct = invested > 0 ? (returnValue / invested) * 100 : 0;
      
      return {
        name: inv.name.length > 20 ? inv.name.substring(0, 20) + "..." : inv.name,
        return: returnPct,
        value: current,
      };
    })
    .sort((a, b) => b.return - a.return)
    .slice(0, 10); // Top 10

  const COLORS = ["#10b981", "#22c55e", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];

  // Calcular nível de diversificação
  const diversificationScore = Object.keys(diversificationData).length;
  const getDiversificationLevel = () => {
    if (diversificationScore >= 5) return { label: "Excelente", color: "bg-green-500", icon: TrendingUp };
    if (diversificationScore >= 3) return { label: "Boa", color: "bg-blue-500", icon: Target };
    if (diversificationScore >= 2) return { label: "Moderada", color: "bg-yellow-500", icon: AlertCircle };
    return { label: "Baixa", color: "bg-red-500", icon: TrendingDown };
  };

  const diversificationLevel = getDiversificationLevel();

  // Gerar recomendações com IA
  const generateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    
    try {
      // Simular análise com IA (pode ser substituído por chamada real à API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const recommendations = [];
      
      // Análise de diversificação
      if (diversificationScore < 3) {
        recommendations.push("🎯 Sua carteira está pouco diversificada. Considere adicionar investimentos em diferentes classes de ativos para reduzir riscos.");
      }
      
      // Análise de concentração
      const maxConcentration = Math.max(...Object.values(diversificationData).map((d: any) => (d.value / currentValue) * 100));
      if (maxConcentration > 50) {
        recommendations.push("⚠️ Mais de 50% da sua carteira está concentrada em um único tipo de ativo. Considere rebalancear para reduzir exposição.");
      }
      
      // Análise de performance
      const negativeReturns = investments.filter((inv: any) => {
        const invested = parseFloat(inv.totalInvested || 0);
        const current = parseFloat(inv.currentValue || invested);
        return current < invested;
      });
      
      if (negativeReturns.length > 0) {
        recommendations.push(`📉 ${negativeReturns.length} investimento(s) com retorno negativo. Avalie se é momento de reposicionar esses ativos.`);
      }
      
      // Análise de dividendos
      if (dividends.length === 0 && investments.some((inv: any) => inv.type === "stocks")) {
        recommendations.push("💰 Você possui ações mas não registrou dividendos. Considere adicionar ativos que pagam dividendos regulares para gerar renda passiva.");
      }
      
      // Recomendação de rebalanceamento
      if (diversificationScore >= 3 && maxConcentration > 40) {
        recommendations.push("🔄 Sugestão de rebalanceamento: Reduza exposição no ativo mais concentrado e redistribua para classes sub-representadas.");
      }
      
      // Recomendação geral
      if (recommendations.length === 0) {
        recommendations.push("✅ Sua carteira está bem equilibrada! Continue monitorando regularmente e ajustando conforme seus objetivos financeiros.");
      }
      
      setAiRecommendations(recommendations);
      toast.success("Análise concluída!", {
        description: `${recommendations.length} recomendação(ões) gerada(s)`,
      });
    } catch (error) {
      toast.error("Erro ao gerar recomendações");
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const isLoading = investmentsLoading;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Análise de Carteira</h1>
            <p className="text-muted-foreground">
              Diversificação, performance e recomendações inteligentes
            </p>
          </div>
          <Button 
            onClick={generateRecommendations} 
            disabled={isGeneratingRecommendations || investments.length === 0}
            className="gap-2"
          >
            {isGeneratingRecommendations ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                Gerar Recomendações IA
              </>
            )}
          </Button>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Investido
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalInvested)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {investments.length} investimento(s)
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Atual
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(currentValue)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Valor de mercado
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Retorno Total
                </CardTitle>
                {totalReturn >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(totalReturn)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {returnPercentage >= 0 ? "+" : ""}{returnPercentage.toFixed(2)}%
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Diversificação
                </CardTitle>
                <diversificationLevel.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {diversificationScore}
                  </div>
                  <Badge className={`${diversificationLevel.color} text-white mt-2`}>
                    {diversificationLevel.label}
                  </Badge>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diversificação por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Diversificação por Tipo
              </CardTitle>
              <CardDescription>
                Distribuição da carteira por classe de ativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {diversificationChartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhum investimento registrado
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={diversificationChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {diversificationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Performance por Investimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Performance por Investimento
              </CardTitle>
              <CardDescription>
                Top 10 investimentos por retorno percentual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhum investimento registrado
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "11px" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "12px" }}
                      label={{ value: "Retorno (%)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "return") return [`${value.toFixed(2)}%`, "Retorno"];
                        return [formatCurrency(value), "Valor Atual"];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="return" 
                      fill="#10b981" 
                      name="Retorno (%)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recomendações IA */}
        {aiRecommendations.length > 0 && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Recomendações Inteligentes
              </CardTitle>
              <CardDescription>
                Análise automatizada da sua carteira de investimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiRecommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {investments.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum investimento registrado</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione seus investimentos para visualizar análises e recomendações personalizadas
                </p>
                <Button asChild>
                  <a href="/investments">Adicionar Investimento</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
