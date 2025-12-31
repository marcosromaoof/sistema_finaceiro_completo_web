import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, TrendingUp, DollarSign, AlertCircle, BarChart3, Settings, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  churnRate: number;
  avgUserValue: number;
  newUsersThisMonth: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  plan: "free" | "premium" | "family";
  status: "active" | "inactive" | "blocked";
  createdAt: Date;
  lastLogin: Date;
  revenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 1250,
    activeUsers: 980,
    monthlyRevenue: 45000,
    churnRate: 2.5,
    avgUserValue: 36,
    newUsersThisMonth: 150,
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      plan: "premium",
      status: "active",
      createdAt: new Date("2024-01-15"),
      lastLogin: new Date(),
      revenue: 99,
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      plan: "family",
      status: "active",
      createdAt: new Date("2024-02-20"),
      lastLogin: new Date(Date.now() - 86400000),
      revenue: 199,
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@example.com",
      plan: "free",
      status: "inactive",
      createdAt: new Date("2023-12-10"),
      lastLogin: new Date(Date.now() - 2592000000),
      revenue: 0,
    },
  ]);

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-screen">
          <Lock className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Apenas administradores podem acessar este painel.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleBlockUser = (userId: number) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u
      )
    );
    toast.success("Status do usuário atualizado");
  };

  const handleSendEmail = (email: string) => {
    toast.success(`Email enviado para ${email}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie usuários, planos e métricas da plataforma</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.totalUsers}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.activeUsers}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% ativos
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Receita Mensal</p>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {metrics.monthlyRevenue.toLocaleString("pt-BR")}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Taxa de Churn</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.churnRate}%</p>
                  <p className="text-xs text-red-600 mt-1">Cancelamentos este mês</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor Médio por Usuário</p>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {metrics.avgUserValue.toLocaleString("pt-BR")}
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Novos Usuários</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.newUsersThisMonth}</p>
                  <p className="text-xs text-blue-600 mt-1">Este mês</p>
                </div>
                <Users className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Usuários</CardTitle>
            <CardDescription>Lista de usuários cadastrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Plano</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Receita</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            u.plan === "premium"
                              ? "default"
                              : u.plan === "family"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {u.plan === "premium"
                            ? "Premium"
                            : u.plan === "family"
                              ? "Family"
                              : "Free"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            u.status === "active"
                              ? "default"
                              : u.status === "blocked"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {u.status === "active"
                            ? "Ativo"
                            : u.status === "blocked"
                              ? "Bloqueado"
                              : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">R$ {u.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockUser(u.id)}
                        >
                          {u.status === "blocked" ? "Desbloquear" : "Bloquear"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendEmail(u.email)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Plans Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Planos</CardTitle>
            <CardDescription>Configure os planos de assinatura disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Free", price: "R$ 0", features: ["Dashboard básico", "5 contas", "Sem suporte"] },
                { name: "Premium", price: "R$ 99/mês", features: ["Dashboard completo", "Contas ilimitadas", "Suporte prioritário"] },
                { name: "Family", price: "R$ 199/mês", features: ["Múltiplos usuários", "Colaboração", "Suporte 24/7"] },
              ].map((plan) => (
                <Card key={plan.name} className="border-2">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-4">{plan.price}</p>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="text-sm text-muted-foreground">
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
