import { useState, useEffect } from "react";
import { useConfetti } from "@/hooks/useConfetti";
import { useSound } from "@/hooks/useSound";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { 
  Trophy, 
  Medal,
  Crown,
  TrendingUp,
  Zap,
  Calendar,
  Users,
  User
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "monthly" | "weekly">("all");
  const { fireTop1Confetti } = useConfetti();
  const { playTop1Sound } = useSound();
  const [hasPlayedTop1Effect, setHasPlayedTop1Effect] = useState(false);

  // Query
  const { data: leaderboard, isLoading } = trpc.gamification.getLeaderboard.useQuery({
    period: selectedPeriod,
    limit: 10,
  });

  // Tocar efeito de top 1 quando carregar o ranking
  useEffect(() => {
    if (leaderboard && leaderboard.length > 0 && !hasPlayedTop1Effect) {
      // Delay para dar tempo do usuário ver a página
      const timer = setTimeout(() => {
        fireTop1Confetti();
        playTop1Sound();
        setHasPlayedTop1Effect(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [leaderboard, hasPlayedTop1Effect, fireTop1Confetti, playTop1Sound]);

  // Reset efeito quando mudar período
  useEffect(() => {
    setHasPlayedTop1Effect(false);
  }, [selectedPeriod]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
    return "bg-muted/30 border-muted";
  };

  const getPeriodLabel = () => {
    if (selectedPeriod === "weekly") return "Últimos 7 Dias";
    if (selectedPeriod === "monthly") return "Último Mês";
    return "Todo o Tempo";
  };

  const getPeriodIcon = () => {
    if (selectedPeriod === "weekly") return <Calendar className="w-4 h-4" />;
    if (selectedPeriod === "monthly") return <Calendar className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ranking</h1>
          <p className="text-muted-foreground">
            Veja os usuários com mais XP e conquistas
          </p>
        </div>

        {/* Stats Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {getPeriodIcon()}
                  Top 10 - {getPeriodLabel()}
                </CardTitle>
                <CardDescription>
                  Os usuários mais dedicados do Organizai
                </CardDescription>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Classificação</CardTitle>
            <CardDescription>
              Ganhe XP completando transações, metas e desafios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">Todo o Tempo</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedPeriod} className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="w-20 h-6" />
                      </div>
                    ))}
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((entry: any) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${getRankBadgeColor(
                        entry.rank
                      )}`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {entry.userName?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {entry.userName || "Usuário Anônimo"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Nível {entry.currentLevel}
                          </Badge>
                          {entry.levelInfo && (
                            <span className="text-xs">{entry.levelInfo.title}</span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-lg font-bold text-foreground">
                            {entry.totalXp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">XP Total</p>
                      </div>

                      {/* Streak Badge */}
                      {entry.currentStreak > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20">
                          <TrendingUp className="w-3 h-3 text-accent" />
                          <span className="text-xs font-semibold text-accent">
                            {entry.currentStreak} dias
                          </span>
                        </div>
                      )}

                      {/* Ver Perfil Button */}
                      <a
                        href={`/profile/${entry.userId}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary hover-lift ripple transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Ver Perfil</span>
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhum usuário encontrado
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Seja o primeiro a ganhar XP e aparecer no ranking!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
