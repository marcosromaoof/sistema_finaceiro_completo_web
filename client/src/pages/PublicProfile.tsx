import { useRoute } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { 
  Trophy, 
  Zap,
  TrendingUp,
  Calendar,
  Target,
  Receipt,
  Award,
  Star,
  Crown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function PublicProfile() {
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId ? parseInt(params.userId) : 0;

  // Query
  const { data: profile, isLoading } = trpc.gamification.getPublicProfile.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Perfil não encontrado
          </h2>
          <p className="text-muted-foreground">
            O usuário que você está procurando não existe.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { user, progress, achievements, stats, levelInfo } = profile;

  // Calcular progresso para próximo nível
  const xpForNextLevel = levelInfo.maxXp === Infinity ? 0 : levelInfo.maxXp - levelInfo.minXp;
  const currentXpInLevel = progress.totalXp - levelInfo.minXp;
  const progressPercentage = xpForNextLevel > 0 
    ? Math.min((currentXpInLevel / xpForNextLevel) * 100, 100) 
    : 100;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {user.name || "Usuário Anônimo"}
                  </h1>
                  {stats.rankPosition && stats.rankPosition <= 3 && (
                    <Crown className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <Badge variant="outline" className="text-sm">
                    <Zap className="w-3 h-3 mr-1" />
                    Nível {progress.currentLevel}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {levelInfo.title}
                  </Badge>
                  {stats.rankPosition && (
                    <Badge variant="outline" className="text-sm bg-accent/20 border-accent/50">
                      <Trophy className="w-3 h-3 mr-1" />
                      #{stats.rankPosition} no Ranking
                    </Badge>
                  )}
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {progress.totalXp.toLocaleString()} XP
                    </span>
                    {levelInfo.maxXp !== Infinity && (
                      <span className="text-muted-foreground">
                        {levelInfo.maxXp.toLocaleString()} XP
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                XP Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {progress.totalXp.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {achievements.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Streak Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {progress.currentStreak} dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {stats.transactions}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Conquistas Desbloqueadas ({achievements.total})
            </CardTitle>
            <CardDescription>
              Todas as conquistas que este usuário já desbloqueou
            </CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.list.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.list.map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 rounded-full bg-accent/20">
                      <Trophy className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {achievement.achievementType}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            achievement.level === "gold"
                              ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-400"
                              : achievement.level === "silver"
                              ? "bg-gray-400/20 border-gray-400/50 text-gray-700 dark:text-gray-300"
                              : "bg-amber-600/20 border-amber-600/50 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {achievement.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.currentProgress} / {achievement.targetProgress}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {achievement.updatedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(achievement.updatedAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma conquista desbloqueada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Este usuário ainda não desbloqueou nenhuma conquista.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Estatísticas de Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Streak Atual</span>
                <span className="text-lg font-bold text-foreground">
                  {progress.currentStreak} dias
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Maior Streak</span>
                <span className="text-lg font-bold text-foreground">
                  {progress.longestStreak} dias
                </span>
              </div>
              {progress.lastActivityDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Última Atividade</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(progress.lastActivityDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transações Registradas</span>
                <span className="text-lg font-bold text-foreground">
                  {stats.transactions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Metas Criadas</span>
                <span className="text-lg font-bold text-foreground">
                  {stats.goals}
                </span>
              </div>
              {user.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Membro desde</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
