import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, TrendingUp, PieChart, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const investmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["stocks", "funds", "crypto", "real_estate", "other", "bonds"]),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  purchasePrice: z.string().min(1, "Preço de compra é obrigatório"),
  currentPrice: z.string().min(1, "Preço atual é obrigatório"),
  purchaseDate: z.string().optional(),
  description: z.string().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export default function Investments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [deletingInvestmentId, setDeletingInvestmentId] = useState<number | null>(null);

  const { data: investments, isLoading } = trpc.investments.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.investments.create.useMutation({
    onSuccess: () => {
      utils.investments.list.invalidate();
      setIsCreateOpen(false);
      form.reset();
      toast.success("Investimento registrado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao registrar investimento: " + error.message);
    },
  });

  const updateMutation = trpc.investments.update.useMutation({
    onSuccess: () => {
      utils.investments.list.invalidate();
      setEditingInvestment(null);
      toast.success("Investimento atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar investimento: " + error.message);
    },
  });

  const deleteMutation = trpc.investments.delete.useMutation({
    onSuccess: () => {
      utils.investments.list.invalidate();
      setDeletingInvestmentId(null);
      toast.success("Investimento excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir investimento: " + error.message);
    },
  });

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema) as any,
    defaultValues: {
      name: "",
      type: "stocks",
      quantity: "",
      purchasePrice: "",
      currentPrice: "",
      description: "",
      purchaseDate: "",
    },
  });

  const editForm = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema) as any,
  });

  const onSubmit = (data: InvestmentFormData) => {
    const qty = parseFloat(data.quantity);
    const price = parseFloat(data.purchasePrice);
    const totalInvested = (qty * price).toString();
    const submitData = {
      ...data,
      totalInvested,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
    };
    if (editingInvestment) {
      updateMutation.mutate({
        id: editingInvestment.id,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    editForm.reset({
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity,
      purchasePrice: investment.purchasePrice,
      currentPrice: investment.currentPrice,
      purchaseDate: investment.purchaseDate ? new Date(investment.purchaseDate).toISOString().split("T")[0] : undefined,
      description: investment.notes || "",
    });
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      stocks: "Ações",
      funds: "Fundos",
      fixed_income: "Renda Fixa",
      crypto: "Criptomoedas",
      real_estate: "Imóveis",
      other: "Outro",
    };
    return labels[type] || type;
  };

  const calculatePerformance = (quantity: number, purchasePrice: number, currentPrice: number) => {
    const totalInvested = quantity * purchasePrice;
    const currentValue = quantity * currentPrice;
    const gain = currentValue - totalInvested;
    const percentage = (gain / totalInvested) * 100;
    return { gain, percentage, totalInvested, currentValue };
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Investimentos</h1>
            <p className="text-muted-foreground">
              Acompanhe a performance de seus investimentos
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Novo Investimento</DialogTitle>
                <DialogDescription>
                  Adicione um investimento para acompanhar sua carteira
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Investimento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: PETR4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="stocks">Ações</SelectItem>
                            <SelectItem value="funds">Fundos</SelectItem>
                            <SelectItem value="bonds">Renda Fixa</SelectItem>
                            <SelectItem value="crypto">Criptomoedas</SelectItem>
                            <SelectItem value="real_estate">Imóveis</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço de Compra (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Atual (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Compra (opcional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Registrando..." : "Registrar Investimento"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        {investments && investments.length > 0 && (() => {
          const totalInvested = investments.reduce((sum, inv) => {
            const qty = parseFloat(inv.quantity || "0");
            const price = parseFloat(inv.purchasePrice || "0");
            return sum + qty * price;
          }, 0);

          const totalCurrent = investments.reduce((sum, inv) => {
            const qty = parseFloat(inv.quantity || "0");
            const price = parseFloat(inv.currentPrice || "0");
            return sum + qty * price;
          }, 0);

          const totalGain = totalCurrent - totalInvested;
          const gainPercentage = (totalGain / totalInvested) * 100;

          return (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Investimento Total</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(totalInvested)}
                      </p>
                    </div>
                    <PieChart className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(totalCurrent)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Ganho/Perda</p>
                      <p className={`text-2xl font-bold ${totalGain >= 0 ? "text-accent" : "text-destructive"}`}>
                        {formatCurrency(totalGain)} ({gainPercentage.toFixed(2)}%)
                      </p>
                    </div>
                    <TrendingUp className={`w-8 h-8 ${totalGain >= 0 ? "text-accent" : "text-destructive"}`} />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Investments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : investments && investments.length > 0 ? (
            investments.map((investment) => {
              const qty = parseFloat(investment.quantity || "0");
              const purchasePrice = parseFloat(investment.purchasePrice || "0");
              const currentPrice = parseFloat(investment.currentPrice || "0");
              const perf = calculatePerformance(qty, purchasePrice, currentPrice);

              return (
                <Card key={investment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{investment.name}</CardTitle>
                        <CardDescription>
                          {getTypeLabel(investment.type)}
                          {investment.purchaseDate && ` • ${new Date(investment.purchaseDate).toLocaleDateString("pt-BR")}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={perf.percentage >= 0 ? "bg-accent" : "bg-destructive"}>
                          {perf.percentage >= 0 ? "+" : ""}{perf.percentage.toFixed(2)}%
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(investment)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingInvestmentId(investment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantidade</p>
                        <p className="font-medium text-foreground">{qty}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Preço Unitário</p>
                        <p className="font-medium text-foreground">{formatCurrency(currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Investido</p>
                        <p className="font-medium text-foreground">{formatCurrency(perf.totalInvested)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor Atual</p>
                        <p className={`font-medium ${perf.gain >= 0 ? "text-accent" : "text-destructive"}`}>
                          {formatCurrency(perf.currentValue)}
                        </p>
                      </div>
                    </div>
                    {investment.notes && (
                      <p className="text-sm text-muted-foreground italic">{investment.notes}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PieChart className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Nenhum investimento registrado
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Registre seus investimentos para acompanhar a carteira
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Investimento
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingInvestment} onOpenChange={() => setEditingInvestment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Investimento</DialogTitle>
              <DialogDescription>
                Atualize as informações do investimento
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Atual (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingInvestment(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deletingInvestmentId !== null} onOpenChange={() => setDeletingInvestmentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingInvestmentId) {
                    deleteMutation.mutate({ id: deletingInvestmentId });
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
