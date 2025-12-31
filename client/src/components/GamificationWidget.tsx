import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export function GamificationWidget() {
  const { data: progress, isLoading: progressLoading } = trpc.gamification.getProgress.useQuery();
  const { data: achievements } = trpc.gamification.getAchievements.useQuery();
  const { data: achievementProgress } = trpc.gamification.getAchievementProgress.useQuery();

  if (progressLoading || !progress) {
    return (
      <Card className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Seu Progresso</h3>
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate level progress
  const levelInfoMap = {
    1: { title: "Aprendiz Financeiro", minXp: 0, maxXp: 500 },
    2: { title: "Economista Iniciante", minXp: 500, maxXp: 1500 },
    3: { title: "Gestor Financeiro", minXp: 1500, maxXp: 3500 },
    4: { title: "Mestre das Finanças", minXp: 3500, maxXp: 7000 },
    5: { title: "Guru Financeiro", minXp: 7000, maxXp: Infinity },
  };
  const levelInfo = levelInfoMap[progress.currentLevel as 1 | 2 | 3 | 4 | 5] || levelInfoMap[1];

  const currentLevelXp = progress.totalXp - levelInfo.minXp;
  const xpForNextLevel = levelInfo.maxXp - levelInfo.minXp;
  const levelProgress = levelInfo.maxXp === Infinity 
    ? 100 
    : (currentLevelXp / xpForNextLevel) * 100;

  // Find next achievement close to completion
  const nextAchievement = achievementProgress
    ?.map(ap => ({
      ...ap,
      progress: (ap.currentProgress / ap.targetProgress) * 100
    }))
    .filter(ap => ap.progress < 100)
    .sort((a, b) => b.progress - a.progress)[0];

  const achievementNames: Record<string, string> = {
    primeiros_passos: "Primeiros Passos",
    cacador_metas: "Caçador de Metas",
    analista_financeiro: "Analista Financeiro",
    orcamento_controle: "Orçamento no Controle",
  };

  return (
    <Card className="glass-card p-6 animate-fade-in hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-prosperity">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Seu Progresso</h3>
            <p className="text-sm text-muted-foreground">
              Nível {progress.currentLevel} - {levelInfo.title}
            </p>
          </div>
        </div>
        <Link href="/achievements">
          <Button variant="ghost" size="sm">
            Ver Todas
          </Button>
        </Link>
      </div>

      {/* Level Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">XP Total</span>
          <span className="font-semibold text-primary">
            {progress.totalXp.toLocaleString()} XP
          </span>
        </div>
        <Progress value={levelProgress} className="h-2" />
        {levelInfo.maxXp !== Infinity && (
          <p className="text-xs text-muted-foreground text-right">
            {xpForNextLevel - currentLevelXp} XP para o próximo nível
          </p>
        )}
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 mb-4">
        <Zap className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium">
          {progress.currentStreak} {progress.currentStreak === 1 ? 'dia' : 'dias'} de sequência
        </span>
        {progress.currentStreak > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            🔥 Recorde: {progress.longestStreak}
          </span>
        )}
      </div>

      {/* Next Achievement */}
      {nextAchievement && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Próxima Conquista</span>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">
                {achievementNames[nextAchievement.achievementType] || nextAchievement.achievementType}
              </span>
              <span className="text-xs font-semibold text-primary">
                {nextAchievement.level.toUpperCase()}
              </span>
            </div>
            <Progress value={nextAchievement.progress} className="h-2 mb-1" />
            <p className="text-xs text-muted-foreground">
              {nextAchievement.currentProgress} / {nextAchievement.targetProgress}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-lg bg-primary/5 text-center">
          <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{achievements?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Conquistas</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 text-center">
          <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{progress.longestStreak}</p>
          <p className="text-xs text-muted-foreground">Melhor Sequência</p>
        </div>
      </div>
    </Card>
  );
}
