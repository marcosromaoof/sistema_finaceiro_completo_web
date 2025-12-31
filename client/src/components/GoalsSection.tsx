import { CircularProgress } from "./CircularProgress";
import { Target, TrendingUp, Calendar } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  category: string;
}

interface GoalsSectionProps {
  goals?: Goal[];
}

export function GoalsSection({ goals }: GoalsSectionProps) {
  // Mock data se não houver metas reais
  const mockGoals: Goal[] = [
    {
      id: '1',
      name: 'Fundo de Emergência',
      currentAmount: 8500,
      targetAmount: 15000,
      deadline: '2025-06-30',
      category: 'Reserva',
    },
    {
      id: '2',
      name: 'Viagem para Europa',
      currentAmount: 12000,
      targetAmount: 25000,
      deadline: '2025-12-31',
      category: 'Lazer',
    },
    {
      id: '3',
      name: 'Novo Carro',
      currentAmount: 45000,
      targetAmount: 80000,
      deadline: '2026-03-31',
      category: 'Patrimônio',
    },
  ];

  const displayGoals = goals || mockGoals;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'hsl(142 76% 36%)'; // prosperity (verde)
    if (percentage >= 50) return 'hsl(43 96% 56%)'; // premium (dourado)
    if (percentage >= 25) return 'hsl(47 96% 53%)'; // amarelo
    return 'hsl(0 84% 60%)'; // vermelho
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Metas Financeiras</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe o progresso das suas metas
            </p>
          </div>
          <button className="text-sm text-primary hover:underline">
            Ver todas →
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {displayGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma meta cadastrada
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie suas primeiras metas financeiras
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayGoals.map((goal) => {
              const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
              const progressColor = getProgressColor(percentage);
              const remaining = goal.targetAmount - goal.currentAmount;

              return (
                <div
                  key={goal.id}
                  className="metric-card group hover:scale-105 transition-transform cursor-pointer"
                >
                  {/* Progress Circle */}
                  <div className="flex justify-center mb-4">
                    <CircularProgress
                      percentage={percentage}
                      size={100}
                      strokeWidth={8}
                      color={progressColor}
                    />
                  </div>

                  {/* Goal Info */}
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
                    <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      {goal.category}
                    </span>
                  </div>

                  {/* Amounts */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Atual:</span>
                      <span className="font-semibold text-prosperity">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Meta:</span>
                      <span className="font-semibold">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Faltam:</span>
                      <span className="font-semibold text-destructive">
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000 ease-out rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: progressColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Prazo: {formatDate(goal.deadline)}</span>
                  </div>

                  {/* Achievement Badge */}
                  {percentage >= 100 && (
                    <div className="mt-4 p-2 rounded-lg bg-prosperity/10 text-prosperity text-center text-sm font-semibold">
                      🎉 Meta Atingida!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
