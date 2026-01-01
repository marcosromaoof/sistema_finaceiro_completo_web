import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp,
  Award,
  Lock,
  Check,
  Zap,
  User
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useAchievementNotifications } from "@/components/AchievementUnlockedToast";

export default function Achievements() {
  const [selectedTab, setSelectedTab] = useState("all");

  // Queries
  const { data: progress, isLoading: progressLoading } = trpc.gamification.getProgress.useQuery();
  const { data: achievements, isLoading: achievementsLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: achievementProgress } = trpc.gamification.getAchievementProgress.useQuery();

  // Notificações de conquistas
  const { checkAndNotifyNewAchievements } = useAchievementNotifications();

  // Verificar novas conquistas desbloqueadas
  useEffect(() => {
    if (achievements) {
      checkAndNotifyNewAchievements(achievements as any);
    }
  }, [achievements]);

  const isLoading = progressLoading || achievementsLoading;

  // Calcular XP para próximo nível
  const currentLevel = progress?.currentLevel || 1;
  const currentXP = progress?.totalXp || 0;
  const xpForNextLevel = currentLevel * 1000;
  const xpProgress = (currentXP / xpForNextLevel) * 100;

  // Filtrar conquistas
  const filteredAchievements = achievements?.filter((achievement: any) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "unlocked") return achievement.unlockedAt !== null;
    if (selectedTab === "locked") return achievement.unlockedAt === null;
    return true;
  });

  // Agrupar conquistas por categoria
  const groupedAchievements = filteredAchievements?.reduce((acc: any, achievement: any) => {
    const category = achievement.category || "Geral";
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Conquistas</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e desbloqueie conquistas
          </p>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Nível {currentLevel}</CardTitle>
                <CardDescription>
                  {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/profile/${progress?.userId || ''}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary hover-lift ripple transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver Meu Perfil</span>
                </a>
                <div className="p-3 rounded-full bg-primary/20">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={xpProgress} className="h-3" />
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-accent" />
                  <p className="text-2xl font-bold text-foreground">
                    {achievements?.filter((a: any) => a.unlockedAt).length || 0}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Desbloqueadas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold text-foreground">
                    {achievements?.length || 0}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-2xl font-bold text-foreground">
                    {(achievements && achievements.length > 0)
                      ? Math.round((achievements.filter((a: any) => a.unlockedAt).length / achievements.length) * 100)
                      : 0}%
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements List */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Conquistas</CardTitle>
            <CardDescription>
              Complete desafios para ganhar XP e subir de nível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unlocked">Desbloqueadas</TabsTrigger>
                <TabsTrigger value="locked">Bloqueadas</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="w-20 h-6" />
                      </div>
                    ))}
                  </div>
                ) : (
                  Object.entries(groupedAchievements || {}).map(([category, categoryAchievements]: [string, any]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-accent" />
                        {category}
                      </h3>
                      <div className="grid gap-4">
                        {categoryAchievements.map((achievement: any) => {
                          const isUnlocked = achievement.unlockedAt !== null;
                          const progressData = achievementProgress?.find((p: any) => p.achievementId === achievement.id);
                          const progressPercent = progressData 
                            ? (progressData.currentProgress / progressData.targetProgress) * 100
                            : 0;

                          return (
                            <div
                              key={achievement.id}
                              className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                                isUnlocked
                                  ? "bg-accent/5 border-accent/30"
                                  : "bg-muted/30 border-muted"
                              }`}
                            >
                              {/* Icon */}
                              <div
                                className={`p-3 rounded-full ${
                                  isUnlocked
                                    ? "bg-accent/20"
                                    : "bg-muted"
                                }`}
                              >
                                {isUnlocked ? (
                                  <Check className="w-6 h-6 text-accent" />
                                ) : (
                                  <Lock className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-semibold ${
                                    isUnlocked ? "text-foreground" : "text-muted-foreground"
                                  }`}>
                                    {achievement.name}
                                  </h4>
                                  {isUnlocked && (
                                    <Badge variant="outline" className="text-xs border-accent text-accent">
                                      Desbloqueada
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {achievement.description}
                                </p>

                                {/* Progress Bar */}
                                {!isUnlocked && progressData && (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>Progresso</span>
                                      <span>
                                        {progressData.currentProgress} / {progressData.targetProgress}
                                      </span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                  </div>
                                )}

                                {isUnlocked && achievement.unlockedAt && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>

                              {/* XP Badge */}
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">
                                  +{achievement.xpReward} XP
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
