import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, 
  Award, 
  Zap, 
  Target,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Stats() {
  // Queries
  const { data: progress, isLoading: progressLoading } = trpc.gamification.getProgress.useQuery();
  const { data: achievements, isLoading: achievementsLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: leaderboard } = trpc.gamification.getLeaderboard.useQuery({
    period: "all",
    limit: 100,
  });

  const isLoading = progressLoading || achievementsLoading;

  // Mock data para evolução de XP (últimos 30 dias)
  const xpEvolutionData = [
    { date: "01/12", xp: 0 },
    { date: "05/12", xp: 150 },
    { date: "10/12", xp: 350 },
    { date: "15/12", xp: 600 },
    { date: "20/12", xp: 950 },
    { date: "25/12", xp: 1300 },
    { date: "30/12", xp: progress?.totalXp || 1500 },
  ];

  // Distribuição de conquistas por categoria
  const unlockedAchievements = achievements?.filter((a: any) => a.unlockedAt) || [];
  const achievementsByCategory = unlockedAchievements.reduce((acc: any, achievement: any) => {
    const category = achievement.category || "Geral";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(achievementsByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#0A8F3A", "#D4AF37", "#0F2A44", "#10b981", "#f59e0b"];

  // Comparação com média da plataforma
  const avgXP = leaderboard && leaderboard.length > 0
    ? leaderboard.reduce((sum: number, entry: any) => sum + entry.totalXp, 0) / leaderboard.length
    : 0;

  const avgAchievements = leaderboard && leaderboard.length > 0
    ? leaderboard.reduce((sum: number, entry: any) => sum + (entry.unlockedCount || 0), 0) / leaderboard.length
    : 0;

  const comparisonData = [
    {
      metric: "XP Total",
      você: progress?.totalXp || 0,
      média: Math.round(avgXP),
    },
    {
      metric: "Conquistas",
      você: unlockedAchievements.length,
      média: Math.round(avgAchievements),
    },
    {
      metric: "Nível",
      você: progress?.currentLevel || 1,
      média: 2,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Estatísticas</h1>
          <p className="text-muted-foreground">
            Análise detalhada do seu progresso e desempenho
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  XP Total
                </CardTitle>
                <Zap className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {progress?.totalXp.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {progress?.totalXp && avgXP > 0
                  ? `${Math.round(((progress.totalXp - avgXP) / avgXP) * 100)}% vs média`
                  : "Carregando..."}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nível Atual
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {progress?.currentLevel || 1}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {progress?.currentLevel && progress.currentLevel >= 2
                  ? `${Math.round(((progress.currentLevel - 2) / 2) * 100)}% acima da média`
                  : "Continue subindo!"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conquistas
                </CardTitle>
                <Award className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {unlockedAchievements.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {achievements?.length || 0} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift ripple">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Streak
                </CardTitle>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {progress?.currentStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                dias consecutivos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1: XP Evolution + Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* XP Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolução de XP
              </CardTitle>
              <CardDescription>
                Seu progresso nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={xpEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#0A8F3A" 
                      strokeWidth={3}
                      dot={{ fill: "#0A8F3A", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="XP"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Conquistas por Categoria
              </CardTitle>
              <CardDescription>
                Distribuição das suas conquistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">
                    Desbloqueie conquistas para ver a distribuição
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison with Platform Average */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Comparação com a Plataforma
            </CardTitle>
            <CardDescription>
              Como você se compara com a média dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="metric" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="você" fill="#0A8F3A" name="Você" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="média" fill="#D4AF37" name="Média da Plataforma" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress && progress.totalXp > avgXP && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Desempenho Acima da Média!</p>
                  <p className="text-sm text-muted-foreground">
                    Você está {Math.round(((progress.totalXp - avgXP) / avgXP) * 100)}% acima da média de XP da plataforma.
                  </p>
                </div>
              </div>
            )}
            
            {unlockedAchievements.length > avgAchievements && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Caçador de Conquistas!</p>
                  <p className="text-sm text-muted-foreground">
                    Você desbloqueou mais conquistas que a média ({unlockedAchievements.length} vs {Math.round(avgAchievements)}).
                  </p>
                </div>
              </div>
            )}

            {progress && progress.currentStreak >= 7 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Streak Impressionante!</p>
                  <p className="text-sm text-muted-foreground">
                    Você mantém um streak de {progress.currentStreak} dias consecutivos. Continue assim!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
