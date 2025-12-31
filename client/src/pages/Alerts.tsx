import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bell, CheckCircle, Info, AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Alert {
  id: number;
  type: "warning" | "error" | "info" | "success";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  action?: string;
}

const mockAlerts: Alert[] = [
  {
    id: 1,
    type: "warning",
    title: "Orçamento de Alimentação Ultrapassado",
    description: "Você já gastou 95% do orçamento de alimentação para este mês",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    action: "Ver Orçamento",
  },
  {
    id: 2,
    type: "error",
    title: "Dívida de Cartão de Crédito Vencendo",
    description: "Sua fatura do cartão de crédito vence em 3 dias",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    action: "Ver Dívidas",
  },
  {
    id: 3,
    type: "success",
    title: "Meta Atingida!",
    description: "Parabéns! Você atingiu sua meta de poupança para este mês",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    action: "Ver Meta",
  },
  {
    id: 4,
    type: "info",
    title: "Novo Investimento Disponível",
    description: "Um novo fundo de investimento com bom histórico está disponível",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    action: "Explorar",
  },
  {
    id: 5,
    type: "warning",
    title: "Saldo Baixo em Conta Corrente",
    description: "Seu saldo em conta corrente está abaixo de R$ 1.000",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredAlerts = filter === "unread" ? alerts.filter((a) => !a.read) : alerts;
  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAsRead = (id: number) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter((a) => a.id !== id));
    toast.success("Alerta removido");
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
    toast.success("Todos os alertas marcados como lidos");
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case "info":
        return <Info className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Há alguns minutos";
    if (hours < 24) return `Há ${hours}h`;
    if (days < 7) return `Há ${days}d`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notificações</h1>
            <p className="text-muted-foreground">
              Acompanhe alertas e notificações importantes
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Marcar tudo como lido
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Todos ({alerts.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Não Lidos ({unreadCount})
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border ${getAlertColor(alert.type)} ${!alert.read ? "ring-2 ring-primary ring-opacity-50" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {alert.action && (
                          <Button size="sm" variant="outline">
                            {alert.action}
                          </Button>
                        )}
                        {!alert.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(alert.id)}
                          >
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  {filter === "unread" ? "Sem notificações não lidas" : "Sem notificações"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {filter === "unread"
                    ? "Você está em dia com todas as suas notificações"
                    : "Nenhuma notificação no momento"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Alert Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dicas de Notificações</CardTitle>
            <CardDescription>
              Configure suas preferências de notificação em Configurações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Receba alertas quando ultrapassar limites de orçamento</li>
              <li>✓ Seja notificado sobre dívidas próximas do vencimento</li>
              <li>✓ Acompanhe o progresso de suas metas financeiras</li>
              <li>✓ Receba recomendações personalizadas de investimentos</li>
              <li>✓ Obtenha lembretes de transações recorrentes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
