import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, AlertTriangle, TrendingUp, PieChart, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const budgetSchema = z.object({
  categoryId: z.number({ message: "Selecione uma categoria" }),
  amount: z.string().min(1, "Limite é obrigatório"),
  period: z.string().min(1, "Período é obrigatório"),
  alertThreshold: z.coerce.number().default(80),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function Budgets() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<number | null>(null);

  const { data: budgets, isLoading } = trpc.budgets.list.useQuery({});
  const { data: categories } = trpc.categories.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      setIsCreateOpen(false);
      form.reset();
      toast.success("Orçamento criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar orçamento: " + error.message);
    },
  });

  const updateMutation = trpc.budgets.update.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      setEditingBudget(null);
      toast.success("Orçamento atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar orçamento: " + error.message);
    },
  });

  const deleteMutation = trpc.budgets.delete.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      setDeletingBudgetId(null);
      toast.success("Orçamento excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir orçamento: " + error.message);
    },
  });

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      categoryId: 0,
      amount: "",
      period: new Date().toISOString().split("T")[0].slice(0, 7),
      alertThreshold: 80,
    },
  });

  const editForm = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema) as any,
  });

  const onSubmit = (data: BudgetFormData) => {
    if (editingBudget) {
      updateMutation.mutate({
        id: editingBudget.id,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    editForm.reset({
      categoryId: budget.categoryId,
      amount: budget.amount,
      period: budget.period,
      alertThreshold: budget.alertThreshold.toString(),
    });
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const getCategoryName = (categoryId: number) => {
    return categories?.find((c) => c.id === categoryId)?.name || "Categoria desconhecida";
  };

  const getProgressPercentage = (spent: string | number, limit: string | number) => {
    const spentNum = typeof spent === 'string' ? parseFloat(spent) : spent;
    const limitNum = typeof limit === 'string' ? parseFloat(limit) : limit;
    return Math.min((spentNum / limitNum) * 100, 100);
  };

  const getProgressColor = (percentage: number, threshold: number) => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= threshold) return "bg-yellow-500";
    return "bg-accent";
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Orçamentos</h1>
            <p className="text-muted-foreground">
              Controle seus gastos com orçamentos mensais
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Orçamento</DialogTitle>
                <DialogDescription>
                  Defina um limite de gastos para uma categoria
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
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
                          <FormLabel>Período</FormLabel>
                          <FormControl>
                            <Input type="month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alertThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alerta em (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" placeholder="80" {...field} value={field.value || ''} onChange={(e) => field.onChange(parseInt(e.target.value) || 80)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Criando..." : "Criar Orçamento"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        {budgets && budgets.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orçado</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0).toString())}
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
                    <p className="text-sm text-muted-foreground mb-1">Total Gasto</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0).toString())}
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
                    <p className="text-sm text-muted-foreground mb-1">Disponível</p>
                    <p
                      className={`text-2xl font-bold ${
                        budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0) - budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0) >= 0
                          ? "text-accent"
                          : "text-destructive"
                      }`}
                    >
                      {formatCurrency((budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0) - budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0)).toString())}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budgets List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : budgets && budgets.length > 0 ? (
            budgets.map((budget) => {
              const percentage = getProgressPercentage(
                budget.spent,
                budget.amount
              );
              const threshold = budget.alertThreshold;
              const isOverBudget = percentage >= 100;
              const isNearLimit = percentage >= threshold && percentage < 100;

              return (
                <Card key={budget.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {getCategoryName(budget.categoryId)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(budget.period + "-01").toLocaleDateString("pt-BR", {
                            month: "long",
                            year: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverBudget && (
                          <Badge variant="destructive">Excedido</Badge>
                        )}
                        {isNearLimit && !isOverBudget && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            Atenção
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(budget)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingBudgetId(budget.id)}
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
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(parseFloat(budget.spent))} de {formatCurrency(parseFloat(budget.amount))}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Disponível: {formatCurrency(
                          (parseFloat(budget.amount) - parseFloat(budget.spent)).toString()
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        Alerta em: {budget.alertThreshold}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PieChart className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Nenhum orçamento criado
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie orçamentos para controlar seus gastos por categoria
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Orçamento
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Orçamento</DialogTitle>
              <DialogDescription>
                Atualize as informações do orçamento
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="alertThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alerta em (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} value={field.value || ''} onChange={(e) => field.onChange(parseInt(e.target.value) || 80)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingBudget(null)}
                  >
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
        <AlertDialog
          open={deletingBudgetId !== null}
          onOpenChange={() => setDeletingBudgetId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingBudgetId) {
                    deleteMutation.mutate({ id: deletingBudgetId });
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
