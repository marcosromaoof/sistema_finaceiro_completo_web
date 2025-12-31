import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

const reportSchema = z.object({
  reportType: z.enum(["summary", "detailed", "category", "account"]),
  period: z.enum(["month", "quarter", "year", "custom"]),
  exportFormat: z.enum(["pdf", "excel", "csv"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  topCategoryAmount: number;
}

export default function Reports() {
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: transactions } = trpc.transactions.list.useQuery({});

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      reportType: "summary",
      period: "month",
      exportFormat: "pdf",
    },
  });

  const calculateReportSummary = (data: any[]): ReportSummary | null => {
    if (!data || data.length === 0) {
      return null;
    }

    const income = data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expenses = data
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const categoryTotals = data.reduce(
      (acc, t) => {
        const category = t.categoryId || "Sem categoria";
        acc[category] = (acc[category] || 0) + parseFloat(t.amount || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategoryEntry = Object.entries(categoryTotals).sort(([, a], [, b]) => (b as number) - (a as number))[0];

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      transactionCount: data.length,
      averageTransaction: data.length > 0 ? (income + expenses) / data.length : 0,
      topCategory: topCategoryEntry?.[0] || "N/A",
      topCategoryAmount: (topCategoryEntry?.[1] as number) || 0,
    };
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true);

    try {
      // Calculate summary
      const summary = calculateReportSummary(transactions || []);
      setReportSummary(summary);

      // Generate export
      const exportData = {
        reportType: data.reportType,
        period: data.period,
        format: data.exportFormat,
        generatedAt: new Date().toISOString(),
        summary,
        transactions: transactions || [],
      };

      // Create download based on format
      if (data.exportFormat === "csv") {
        downloadCSV(exportData);
      } else if (data.exportFormat === "excel") {
        downloadExcel(exportData);
      } else if (data.exportFormat === "pdf") {
        downloadPDF(exportData);
      }

      toast.success(`Relatório exportado em ${data.exportFormat.toUpperCase()}!`);
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = (data: any): void => {
    const headers = ["Data", "Descrição", "Categoria", "Valor", "Tipo"];
    const rows = (data.transactions || []).map((t: any) => [
      new Date(t.date).toLocaleDateString("pt-BR"),
      t.description || "",
      t.categoryId || "Sem categoria",
      t.amount || 0,
      t.type,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${new Date().getTime()}.csv`;
    link.click();
  };

  const downloadExcel = (data: any) => {
    // Simplified Excel export - in production, use xlsx library
    downloadCSV(data);
    toast.info("Para Excel completo, use a exportação CSV e abra no Excel");
  };

  const downloadPDF = (data: any) => {
    // Simplified PDF export - in production, use jsPDF or similar
    const content = `
RELATÓRIO FINANCEIRO
Data: ${new Date().toLocaleDateString("pt-BR")}

RESUMO:
- Receitas: R$ ${data.summary?.totalIncome?.toFixed(2) || 0}
- Despesas: R$ ${data.summary?.totalExpenses?.toFixed(2) || 0}
- Líquido: R$ ${data.summary?.netIncome?.toFixed(2) || 0}
- Total de Transações: ${data.summary?.transactionCount || 0}
- Categoria Principal: ${data.summary?.topCategory}

TRANSAÇÕES:
${(data.transactions || [])
  .map(
    (t: any) =>
      `${new Date(t.date).toLocaleDateString("pt-BR")} - ${t.description} - R$ ${t.amount}`
  )
  .join("\n")}
    `;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${new Date().getTime()}.txt`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Gere e exporte relatórios detalhados de suas finanças
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Gerar Relatório</CardTitle>
              <CardDescription>Configure os parâmetros do relatório</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Tipo de Relatório</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="summary">Resumo</SelectItem>
                            <SelectItem value="detailed">Detalhado</SelectItem>
                            <SelectItem value="category">Por Categoria</SelectItem>
                            <SelectItem value="account">Por Conta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Período</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="month">Este Mês</SelectItem>
                            <SelectItem value="quarter">Este Trimestre</SelectItem>
                            <SelectItem value="year">Este Ano</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exportFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Formato de Exportação</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? "Gerando..." : "Gerar e Baixar"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="lg:col-span-2 space-y-4">
            {reportSummary ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Resumo do Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Receitas</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {reportSummary.totalIncome.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Despesas</p>
                      <p className="text-2xl font-bold text-red-600">
                        R$ {reportSummary.totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Líquido</p>
                      <p className={`text-2xl font-bold ${reportSummary.netIncome >= 0 ? "text-blue-600" : "text-red-600"}`}>
                        R$ {reportSummary.netIncome.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Transações</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {reportSummary.transactionCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Categoria Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{reportSummary.topCategory}</span>
                      <Badge variant="secondary">
                        R$ {reportSummary.topCategoryAmount.toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    Nenhum relatório gerado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Configure os parâmetros e clique em "Gerar e Baixar"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Relatórios Pré-configurados</CardTitle>
            <CardDescription>Clique para gerar um relatório rápido</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex flex-col items-start p-4">
              <Calendar className="w-5 h-5 mb-2 text-primary" />
              <span className="font-medium">Resumo Mensal</span>
              <span className="text-xs text-muted-foreground mt-1">
                Receitas, despesas e saldo do mês
              </span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-start p-4">
              <BarChart3 className="w-5 h-5 mb-2 text-primary" />
              <span className="font-medium">Análise por Categoria</span>
              <span className="text-xs text-muted-foreground mt-1">
                Distribuição de gastos por categoria
              </span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-start p-4">
              <TrendingUp className="w-5 h-5 mb-2 text-primary" />
              <span className="font-medium">Relatório Anual</span>
              <span className="text-xs text-muted-foreground mt-1">
                Visão completa do ano financeiro
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
