import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const retirementSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  targetAge: z.coerce.number().min(50, "Idade mínima: 50 anos"),
  currentAge: z.coerce.number().min(18, "Idade mínima: 18 anos"),
  currentSavings: z.string().min(1, "Valor atual é obrigatório"),
  targetAmount: z.string().min(1, "Valor alvo é obrigatório"),
  monthlyContribution: z.string().min(1, "Contribuição mensal é obrigatória"),
  expectedReturn: z.string().min(0, "Retorno esperado é obrigatório"),
});

type RetirementFormData = z.infer<typeof retirementSchema>;

export default function Retirement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);

  const { data: plans, isLoading } = trpc.retirementPlans.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.retirementPlans.create.useMutation({
    onSuccess: () => {
      utils.retirementPlans.list.invalidate();
      setIsCreateOpen(false);
      form.reset();
      toast.success("Plano de aposentadoria criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar plano: " + error.message);
    },
  });

  const updateMutation = trpc.retirementPlans.update.useMutation({
    onSuccess: () => {
      utils.retirementPlans.list.invalidate();
      setEditingPlan(null);
      toast.success("Plano atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar plano: " + error.message);
    },
  });

  const deleteMutation = trpc.retirementPlans.delete.useMutation({
    onSuccess: () => {
      utils.retirementPlans.list.invalidate();
      setDeletingPlanId(null);
      toast.success("Plano excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir plano: " + error.message);
    },
  });

  const form = useForm<RetirementFormData>({
    resolver: zodResolver(retirementSchema) as any,
    defaultValues: {
      name: "",
      targetAge: 65,
      currentAge: 30,
      currentSavings: "",
      targetAmount: "",
      monthlyContribution: "",
      expectedReturn: "7",
    },
  });

  const editForm = useForm<RetirementFormData>({
    resolver: zodResolver(retirementSchema) as any,
  });

  const onSubmit = (data: RetirementFormData) => {
    const submitData = {
      name: data.name,
      currentAge: data.currentAge,
      retirementAge: data.targetAge,
      currentSavings: data.currentSavings,
      monthlyContribution: data.monthlyContribution,
      expectedReturn: data.expectedReturn,
    };
    if (editingPlan) {
      updateMutation.mutate({
        id: editingPlan.id,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    editForm.reset(plan);
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const calculateProjection = (
    currentSavings: number,
    monthlyContribution: number,
    expectedReturn: number,
    yearsToRetirement: number
  ) => {
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;

    let balance = currentSavings;
    for (let i = 0; i < months; i++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
    }

    return balance;
  };

  const calculateMonthlyNeeded = (
    targetAmount: number,
    currentSavings: number,
    expectedReturn: number,
    yearsToRetirement: number
  ) => {
    if (yearsToRetirement <= 0) return 0;

    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;

    const futureValueOfCurrent = currentSavings * Math.pow(1 + monthlyRate, months);
    const remainingNeeded = targetAmount - futureValueOfCurrent;

    if (remainingNeeded <= 0) return 0;

    const monthlyPayment =
      remainingNeeded /
      (Math.pow(1 + monthlyRate, months) - 1) *
      monthlyRate;

    return Math.max(0, monthlyPayment);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Planejamento de Aposentadoria</h1>
            <p className="text-muted-foreground">
              Simule e planeje sua aposentadoria com projeções realistas
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Plano de Aposentadoria</DialogTitle>
                <DialogDescription>
                  Configure um plano de aposentadoria com simulações de cenários
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Plano</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Aposentadoria Confortável" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade Atual</FormLabel>
                          <FormControl>
                            <Input type="number" min="18" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade de Aposentadoria</FormLabel>
                          <FormControl>
                            <Input type="number" min="50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentSavings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poupança Atual (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Alvo (R$)</FormLabel>
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
                      name="monthlyContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contribuição Mensal (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expectedReturn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retorno Esperado (% a.a.)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="7.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Criando..." : "Criar Plano"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
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
          ) : plans && plans.length > 0 ? (
            plans.map((plan: any) => {
              const yearsToRetirement = plan.targetAge - plan.currentAge;
              const projection = calculateProjection(
                parseFloat(plan.currentSavings),
                parseFloat(plan.monthlyContribution),
                parseFloat(plan.expectedReturn),
                yearsToRetirement
              );
              const percentage = (projection / parseFloat(plan.targetAmount)) * 100;
              const monthlyNeeded = calculateMonthlyNeeded(
                parseFloat(plan.targetAmount),
                parseFloat(plan.currentSavings),
                parseFloat(plan.expectedReturn),
                yearsToRetirement
              );

              return (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        <CardDescription>
                          Aposentadoria aos {plan.targetAge} anos ({yearsToRetirement} anos)
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={percentage >= 100 ? "bg-accent" : "bg-primary"}>
                          {percentage.toFixed(0)}%
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingPlanId(plan.id)}
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
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Projeção: {formatCurrency(projection)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Alvo: {formatCurrency(plan.targetAmount)}
                        </span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Poupança Atual</p>
                        <p className="font-medium text-foreground">
                          {formatCurrency(plan.currentSavings)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contribuição Mensal</p>
                        <p className="font-medium text-accent">
                          {formatCurrency(plan.monthlyContribution)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Retorno Esperado</p>
                        <p className="font-medium text-foreground">
                          {plan.expectedReturn}% a.a.
                        </p>
                      </div>
                    </div>

                    {monthlyNeeded > parseFloat(plan.monthlyContribution) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          Para atingir o alvo, você precisa aumentar a contribuição mensal para{" "}
                          <strong>{formatCurrency(monthlyNeeded)}</strong>
                        </p>
                      </div>
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
                  Nenhum plano de aposentadoria
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie um plano para simular sua aposentadoria
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Plano
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
              <DialogDescription>
                Atualize as informações do plano de aposentadoria
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="monthlyContribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribuição Mensal (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
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
        <AlertDialog open={deletingPlanId !== null} onOpenChange={() => setDeletingPlanId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingPlanId) {
                    deleteMutation.mutate({ id: deletingPlanId });
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
