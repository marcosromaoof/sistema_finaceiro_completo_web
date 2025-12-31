import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, AlertTriangle, TrendingDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const debtSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  totalAmount: z.string().min(1, "Valor total é obrigatório"),
  interestRate: z.string().min(0, "Taxa de juros é obrigatória"),
  payoffStrategy: z.enum(["snowball", "avalanche", "custom"]).default("avalanche"),
  creditor: z.string().optional(),
  minimumPayment: z.string().optional(),
  dueDay: z.coerce.number().optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

export default function Debts() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [deletingDebtId, setDeletingDebtId] = useState<number | null>(null);

  const { data: debts, isLoading } = trpc.debts.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.debts.create.useMutation({
    onSuccess: () => {
      utils.debts.list.invalidate();
      setIsCreateOpen(false);
      form.reset();
      toast.success("Dívida criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar dívida: " + error.message);
    },
  });

  const updateMutation = trpc.debts.update.useMutation({
    onSuccess: () => {
      utils.debts.list.invalidate();
      setEditingDebt(null);
      toast.success("Dívida atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar dívida: " + error.message);
    },
  });

  const deleteMutation = trpc.debts.delete.useMutation({
    onSuccess: () => {
      utils.debts.list.invalidate();
      setDeletingDebtId(null);
      toast.success("Dívida excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir dívida: " + error.message);
    },
  });

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema) as any,
    defaultValues: {
      name: "",
      totalAmount: "",
      interestRate: "0",
      payoffStrategy: "avalanche",
      creditor: "",
      minimumPayment: "",
    },
  });

  const editForm = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema) as any,
  });

  const onSubmit = (data: DebtFormData) => {
    const submitData = {
      ...data,
      remainingAmount: data.totalAmount,
      startDate: new Date(),
    };
    if (editingDebt) {
      updateMutation.mutate({
        id: editingDebt.id,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (debt: any) => {
    setEditingDebt(debt);
    editForm.reset({
      name: debt.name,
      totalAmount: debt.totalAmount,
      interestRate: debt.interestRate,
      payoffStrategy: debt.payoffStrategy,
      creditor: debt.creditor,
      minimumPayment: debt.minimumPayment,
      dueDay: debt.dueDay,
    });
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const getPayoffPercentage = (remaining: string | number, total: string | number) => {
    const remainingNum = typeof remaining === "string" ? parseFloat(remaining) : remaining;
    const totalNum = typeof total === "string" ? parseFloat(total) : total;
    return Math.min(((totalNum - remainingNum) / totalNum) * 100, 100);
  };

  const calculatePayoffMonths = (remaining: number, minimumPayment: number, interestRate: number) => {
    if (minimumPayment <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return Math.ceil(remaining / minimumPayment);
    return Math.ceil(Math.log(minimumPayment / (minimumPayment - remaining * monthlyRate)) / Math.log(1 + monthlyRate));
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Dívidas</h1>
            <p className="text-muted-foreground">
              Acompanhe e gerencie suas dívidas e empréstimos
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Dívida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Dívida</DialogTitle>
                <DialogDescription>
                  Adicione uma dívida ou empréstimo para acompanhamento
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
                          <FormLabel>Nome da Dívida</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Empréstimo Pessoal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="creditor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credor</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Banco XYZ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Total (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Juros (% a.a.)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minimumPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pagamento Mínimo (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dueDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia do Vencimento</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="31" placeholder="15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="payoffStrategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estratégia de Quitação</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="snowball">Snowball (menor saldo primeiro)</SelectItem>
                            <SelectItem value="avalanche">Avalanche (maior juros primeiro)</SelectItem>
                            <SelectItem value="custom">Customizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Criando..." : "Registrar Dívida"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        {debts && debts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dívida Total</p>
                    <p className="text-2xl font-bold text-destructive">
                      {formatCurrency(debts.reduce((sum, d) => sum + parseFloat(d.remainingAmount), 0))}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dívidas Ativas</p>
                    <p className="text-2xl font-bold text-foreground">
                      {debts.filter((d) => !d.isPaidOff).length}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Debts List */}
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
          ) : debts && debts.length > 0 ? (
            debts.map((debt) => {
              const percentage = getPayoffPercentage(debt.remainingAmount, debt.totalAmount);
              const monthsToPayoff = calculatePayoffMonths(
                parseFloat(debt.remainingAmount),
                parseFloat(debt.minimumPayment || "0"),
                parseFloat(debt.interestRate)
              );

              return (
                <Card key={debt.id} className={`hover:shadow-md transition-shadow ${debt.isPaidOff ? "opacity-75" : ""}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{debt.name}</CardTitle>
                        <CardDescription>
                          {debt.creditor && `${debt.creditor} • `}
                          Taxa: {debt.interestRate}% a.a.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {debt.isPaidOff && <Badge className="bg-accent">Quitada</Badge>}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(debt)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingDebtId(debt.id)}
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
                          {formatCurrency(debt.remainingAmount)} de {formatCurrency(debt.totalAmount)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(0)}% quitada
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Pagamento Mínimo</p>
                        <p className="font-medium text-foreground">
                          {formatCurrency(debt.minimumPayment || "0")}
                        </p>
                      </div>
                      {monthsToPayoff > 0 && (
                        <div>
                          <p className="text-muted-foreground">Meses para Quitação</p>
                          <p className="font-medium text-accent">
                            {monthsToPayoff} meses
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Nenhuma dívida registrada
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Registre suas dívidas para acompanhar e planejar a quitação
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Dívida
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingDebt} onOpenChange={() => setEditingDebt(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Dívida</DialogTitle>
              <DialogDescription>
                Atualize as informações da dívida
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros (% a.a.)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingDebt(null)}>
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
        <AlertDialog open={deletingDebtId !== null} onOpenChange={() => setDeletingDebtId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta dívida? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingDebtId) {
                    deleteMutation.mutate({ id: deletingDebtId });
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
