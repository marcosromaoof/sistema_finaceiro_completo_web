import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Trophy,
  Calculator,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PassiveIncomeGoals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    monthlyTarget: "",
    targetDate: "",
    notes: "",
  });

  // Queries
  const { data: goals = [], isLoading, refetch } = trpc.passiveIncomeGoals.list.useQuery({ activeOnly: false });
  const { data: dividendStats } = trpc.dividends.getStats.useQuery();

  // Mutations
  const createGoal = trpc.passiveIncomeGoals.create.useMutation({
    onSuccess: () => {
      toast.success("Meta criada com sucesso! 🎯");
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar meta", {
        description: error.message,
      });
    },
  });

  const updateGoal = trpc.passiveIncomeGoals.update.useMutation({
    onSuccess: () => {
      toast.success("Meta atualizada com sucesso!");
      refetch();
      resetForm();
      setIsDialogOpen(false);
      setEditingGoal(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar meta", {
        description: error.message,
      });
    },
  });

  const deleteGoal = trpc.passiveIncomeGoals.delete.useMutation({
    onSuccess: () => {
      toast.success("Meta excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir meta", {
        description: error.message,
      });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      monthlyTarget: "",
      targetDate: "",
      notes: "",
    });
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const monthlyTarget = parseFloat(formData.monthlyTarget);
    if (isNaN(monthlyTarget) || monthlyTarget <= 0) {
      toast.error("Meta mensal deve ser um valor positivo");
      return;
    }

    const data = {
      name: formData.name,
      monthlyTarget,
      targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
      notes: formData.notes || undefined,
    };

    if (editingGoal) {
      updateGoal.mutate({ id: editingGoal.id, ...data });
    } else {
      createGoal.mutate(data);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      monthlyTarget: goal.monthlyTarget,
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "",
      notes: goal.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      deleteGoal.mutate({ id });
    }
  };

  // Calcular métricas
  const activeGoals = goals.filter((g: any) => g.isActive);
  const totalMonthlyTarget = activeGoals.reduce((sum: number, g: any) => sum + parseFloat(g.monthlyTarget || 0), 0);
  const currentMonthDividends = dividendStats?.totalReceived || 0;
  const overallProgress = totalMonthlyTarget > 0 ? (currentMonthDividends / totalMonthlyTarget) * 100 : 0;

  // Calcular projeção de independência financeira
  const averageMonthlyDividends = dividendStats?.monthlyAverage || 0;
  const monthsToIndependence = totalMonthlyTarget > 0 && averageMonthlyDividends > 0
    ? Math.ceil(totalMonthlyTarget / averageMonthlyDividends)
    : null;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Metas de Renda Passiva</h1>
            <p className="text-muted-foreground">
              Defina e acompanhe suas metas de dividendos mensais
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Editar Meta" : "Nova Meta de Renda Passiva"}</DialogTitle>
                <DialogDescription>
                  Defina uma meta mensal de dividendos para acompanhar seu progresso
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Meta</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Independência Financeira"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyTarget">Meta Mensal (R$)</Label>
                  <Input
                    id="monthlyTarget"
                    type="number"
                    step="0.01"
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
                    placeholder="5000.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="targetDate">Data Alvo (Opcional)</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Descreva sua estratégia ou observações..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createGoal.isPending || updateGoal.isPending}>
                    {editingGoal ? "Atualizar" : "Criar Meta"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Metas Ativas
                </CardTitle>
                <Target className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {activeGoals.length}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {goals.length} total
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Meta Mensal Total
                </CardTitle>
                <DollarSign className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalMonthlyTarget)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Soma das metas ativas
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recebido Este Mês
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(currentMonthDividends)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {overallProgress.toFixed(1)}% da meta
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Projeção
                </CardTitle>
                <Calculator className="w-4 h-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              {monthsToIndependence ? (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {monthsToIndependence}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    meses para atingir meta
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Dados insuficientes
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progresso Geral */}
        {activeGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Progresso Geral
              </CardTitle>
              <CardDescription>
                Acompanhe seu progresso em relação às metas ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Meta Total:</span>
                  <span className="font-semibold">{formatCurrency(totalMonthlyTarget)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recebido:</span>
                  <span className="font-semibold text-green-500">{formatCurrency(currentMonthDividends)}</span>
                </div>
                <Progress value={Math.min(overallProgress, 100)} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso:</span>
                  <span className="font-semibold">{overallProgress.toFixed(1)}%</span>
                </div>
                {overallProgress >= 100 ? (
                  <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Meta atingida este mês! 🎉</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Faltam {formatCurrency(totalMonthlyTarget - currentMonthDividends)} para atingir a meta</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Metas */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Metas</CardTitle>
            <CardDescription>
              Gerencie suas metas de renda passiva
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira meta de renda passiva para começar a acompanhar seu progresso
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Meta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal: any) => {
                  const monthlyTarget = parseFloat(goal.monthlyTarget);
                  const progress = totalMonthlyTarget > 0 ? (currentMonthDividends / monthlyTarget) * 100 : 0;
                  const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
                  const isOverdue = targetDate && targetDate < new Date() && progress < 100;

                  return (
                    <Card key={goal.id} className={`${!goal.isActive ? "opacity-60" : ""}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{goal.name}</h3>
                              {goal.isActive ? (
                                <Badge className="bg-green-500 text-white">Ativa</Badge>
                              ) : (
                                <Badge variant="secondary">Inativa</Badge>
                              )}
                              {isOverdue && (
                                <Badge variant="destructive">Atrasada</Badge>
                              )}
                            </div>
                            {goal.notes && (
                              <p className="text-sm text-muted-foreground mb-3">{goal.notes}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Meta Mensal:</span>
                                <p className="font-semibold">{formatCurrency(monthlyTarget)}</p>
                              </div>
                              {targetDate && (
                                <div>
                                  <span className="text-muted-foreground">Data Alvo:</span>
                                  <p className="font-semibold flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {targetDate.toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(goal)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(goal.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        {goal.isActive && (
                          <div className="space-y-2">
                            <Progress value={Math.min(progress, 100)} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatCurrency(currentMonthDividends)} recebido</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculadora de Independência Financeira */}
        {activeGoals.length > 0 && dividendStats && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Calculadora de Independência Financeira
              </CardTitle>
              <CardDescription>
                Projeções baseadas no seu histórico de dividendos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Média Mensal Atual</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(averageMonthlyDividends)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Baseado no histórico de dividendos
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Taxa de Crescimento</p>
                  <p className="text-2xl font-bold text-accent">
                    N/A
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dividend yield médio
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                  <p className="text-2xl font-bold text-green-500">
                    {monthsToIndependence || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {monthsToIndependence ? "meses para atingir meta" : "Dados insuficientes"}
                  </p>
                </div>
              </div>
              
              {monthsToIndependence && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Projeção:</strong> Mantendo a média atual de {formatCurrency(averageMonthlyDividends)} por mês,
                    você atingirá sua meta de {formatCurrency(totalMonthlyTarget)} em aproximadamente{" "}
                    <strong>{monthsToIndependence} meses</strong> ({Math.ceil(monthsToIndependence / 12)} anos).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
