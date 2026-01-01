import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  Trash2,
  PieChart,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dividends() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("dividend");
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Queries
  const { data: dividends = [], isLoading: dividendsLoading, refetch } = trpc.dividends.list.useQuery({});
  const { data: stats, isLoading: statsLoading } = trpc.dividends.getStats.useQuery();
  const { data: investments = [] } = trpc.investments.list.useQuery();

  // Mutations
  const createDividend = trpc.dividends.create.useMutation({
    onSuccess: (data) => {
      toast.success("Dividendo registrado com sucesso! 💰", {
        description: "Seu dividendo foi registrado e você foi notificado.",
      });
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erro ao registrar dividendo", {
        description: error.message,
      });
    },
  });

  const deleteDividend = trpc.dividends.delete.useMutation({
    onSuccess: () => {
      toast.success("Dividendo excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir dividendo", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setSelectedType("dividend");
    setSelectedInvestmentId("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInvestmentId || !amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createDividend.mutate({
      investmentId: Number(selectedInvestmentId),
      type: selectedType as "dividend" | "jcp" | "interest" | "bonus",
      amount: parseFloat(amount),
      paymentDate: new Date(date),
      notes: notes || undefined,
    });
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      dividend: { label: "Dividendo", variant: "default" as const },
      jcp: { label: "JCP", variant: "secondary" as const },
      interest: { label: "Juros", variant: "outline" as const },
      bonus: { label: "Bônus", variant: "default" as const },
    };
    const badge = badges[type as keyof typeof badges] || badges.dividend;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  // Preparar dados para gráficos
  const dividendsByType = dividends.reduce((acc: any, div: any) => {
    const type = div.type || "dividend";
    acc[type] = (acc[type] || 0) + parseFloat(div.amount);
    return acc;
  }, {});

  const typeData = Object.entries(dividendsByType).map(([name, value]) => ({
    name: name === "dividend" ? "Dividendo" : name === "jcp" ? "JCP" : name === "interest" ? "Juros" : "Bônus",
    value,
  }));

  const COLORS = ["#0A8F3A", "#D4AF37", "#0F2A44", "#10b981"];

  // Evolução mensal (últimos 6 meses)
  const monthlyData = dividends.reduce((acc: any, div: any) => {
    const month = new Date(div.date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += parseFloat(div.amount);
    return acc;
  }, {});

  const evolutionData = Object.entries(monthlyData)
    .map(([month, total]) => ({ month, total }))
    .slice(-6);

  const isLoading = dividendsLoading || statsLoading;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dividendos e Rendimentos</h1>
            <p className="text-muted-foreground">
              Acompanhe seus dividendos, JCP, juros e bonificações
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Registrar Dividendo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Novo Dividendo</DialogTitle>
                <DialogDescription>
                  Adicione um dividendo, JCP, juros ou bonificação recebida
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="investment">Investimento *</Label>
                  <Select value={selectedInvestmentId} onValueChange={setSelectedInvestmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o investimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {investments.map((inv: any) => (
                        <SelectItem key={inv.id} value={inv.id.toString()}>
                          {inv.name} {inv.ticker ? `(${inv.ticker})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dividend">Dividendo</SelectItem>
                      <SelectItem value="jcp">JCP (Juros sobre Capital Próprio)</SelectItem>
                      <SelectItem value="interest">Juros</SelectItem>
                      <SelectItem value="bonus">Bonificação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date">Data do Pagamento *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    placeholder="Ex: Referente ao mês de dezembro"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createDividend.isPending}>
                    {createDividend.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Recebido
                </CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.totalReceived || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {dividends.length} pagamentos registrados
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Renda Mensal Média
                </CardTitle>
                <Calendar className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.monthlyAverage || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Últimos 12 meses
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Dividend Yield Médio
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {stats?.yearlyTotal && dividends.length > 0 ? `${((stats.yearlyTotal / dividends.length) * 100).toFixed(2)}%` : "0%"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Retorno anual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Evolução Mensal
              </CardTitle>
              <CardDescription>
                Dividendos recebidos nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evolutionData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhum dividendo registrado ainda
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#0A8F3A" 
                      strokeWidth={3}
                      dot={{ fill: "#0A8F3A", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Total"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Type Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent" />
                Distribuição por Tipo
              </CardTitle>
              <CardDescription>
                Proporção de cada tipo de rendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {typeData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhum dividendo registrado ainda
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
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
        </div>

        {/* Dividends Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Dividendos</CardTitle>
            <CardDescription>
              Todos os dividendos e rendimentos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dividendsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : dividends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhum dividendo registrado</p>
                <p className="text-sm">
                  Clique em "Registrar Dividendo" para adicionar seu primeiro rendimento
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Investimento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.map((dividend: any) => (
                    <TableRow key={dividend.id}>
                      <TableCell>{formatDate(dividend.date)}</TableCell>
                      <TableCell className="font-medium">
                        {dividend.investment?.name || "N/A"}
                        {dividend.investment?.ticker && (
                          <span className="text-muted-foreground ml-1">
                            ({dividend.investment.ticker})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(dividend.type)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(dividend.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dividend.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Deseja realmente excluir este dividendo?")) {
                              deleteDividend.mutate({ id: dividend.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
