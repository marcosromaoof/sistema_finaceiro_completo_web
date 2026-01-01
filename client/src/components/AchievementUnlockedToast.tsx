import { Trophy, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Achievement {
  id: number;
  name: string;
  description: string;
  xpReward: number;
  icon?: string;
}

/**
 * Exibe uma notificação animada quando uma conquista é desbloqueada
 */
export function showAchievementUnlockedToast(achievement: Achievement) {
  toast.custom(
    (t) => (
      <div
        className="relative overflow-hidden rounded-lg border border-accent/50 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-4 shadow-lg backdrop-blur-sm"
        style={{
          animation: "slideIn 0.3s ease-out, pulse 0.5s ease-in-out 0.3s",
        }}
      >
        {/* Sparkles Background */}
        <div className="absolute inset-0 opacity-20">
          <Sparkles className="absolute top-2 right-2 w-4 h-4 text-accent animate-pulse" />
          <Sparkles className="absolute bottom-2 left-2 w-3 h-3 text-primary animate-pulse delay-100" />
          <Sparkles className="absolute top-1/2 left-1/2 w-5 h-5 text-accent animate-pulse delay-200" />
        </div>

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 p-3 rounded-full bg-accent/20 animate-bounce">
            <Trophy className="w-6 h-6 text-accent" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-accent">
                🎉 Conquista Desbloqueada!
              </p>
            </div>
            <h4 className="font-bold text-foreground mb-1">
              {achievement.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 w-fit">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-primary">
                +{achievement.xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "top-right",
    }
  );
}

/**
 * Hook para detectar e notificar conquistas desbloqueadas
 */
export function useAchievementNotifications() {
  // Armazena IDs de conquistas já notificadas na sessão
  const notifiedAchievements = new Set<number>();

  const checkAndNotifyNewAchievements = (achievements: Achievement[]) => {
    achievements.forEach((achievement: any) => {
      // Se foi desbloqueada recentemente (últimos 5 segundos) e ainda não notificamos
      if (achievement.unlockedAt) {
        const unlockedTime = new Date(achievement.unlockedAt).getTime();
        const now = Date.now();
        const fiveSecondsAgo = now - 5000;

        if (
          unlockedTime > fiveSecondsAgo &&
          !notifiedAchievements.has(achievement.id)
        ) {
          notifiedAchievements.add(achievement.id);
          showAchievementUnlockedToast(achievement);
        }
      }
    });
  };

  return { checkAndNotifyNewAchievements };
}
