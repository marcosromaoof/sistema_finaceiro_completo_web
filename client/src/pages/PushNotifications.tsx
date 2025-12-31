import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, Calendar, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PushNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [scheduleDate, setScheduleDate] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Novo recurso disponível",
      message: "Confira o novo sistema de transferências automáticas!",
      audience: "Todos os usuários",
      sent: "2025-01-15",
      status: "sent",
      recipients: 1250,
    },
    {
      id: 2,
      title: "Lembrete de orçamento",
      message: "Você está próximo do limite do seu orçamento mensal",
      audience: "Usuários Premium",
      sent: "2025-01-10",
      status: "sent",
      recipients: 450,
    },
    {
      id: 3,
      title: "Promoção especial",
      message: "50% de desconto no plano anual!",
      audience: "Usuários Free",
      scheduled: "2025-02-01",
      status: "scheduled",
      recipients: 800,
    },
  ];

  const handleSendNotification = () => {
    if (!title || !message) {
      toast.error("Preencha título e mensagem");
      return;
    }

    if (scheduleDate) {
      toast.success(`Notificação agendada para ${scheduleDate}`);
    } else {
      toast.success("Notificação enviada com sucesso!");
    }

    setTitle("");
    setMessage("");
    setScheduleDate("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Enviada
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Agendada
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Notificações Push em Massa</h1>
        <p className="text-muted-foreground">
          Envie notificações para seus usuários
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.500</div>
            <p className="text-xs text-muted-foreground">usuários ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notificações Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.700</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">média geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Nova Notificação
          </CardTitle>
          <CardDescription>
            Crie e envie notificações push para seus usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ex: Novo recurso disponível"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite a mensagem da notificação..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/200 caracteres
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="audience">Público-Alvo</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários (2.500)</SelectItem>
                  <SelectItem value="free">Usuários Free (800)</SelectItem>
                  <SelectItem value="premium">Usuários Premium (1.200)</SelectItem>
                  <SelectItem value="family">Usuários Family (500)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Agendar (opcional)</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSendNotification} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              {scheduleDate ? "Agendar Notificação" : "Enviar Agora"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTitle("");
                setMessage("");
                setScheduleDate("");
              }}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Histórico de Notificações
          </CardTitle>
          <CardDescription>
            Notificações enviadas e agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{notification.title}</h4>
                    {getStatusBadge(notification.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{notification.recipients} destinatários</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {notification.status === "sent"
                          ? `Enviada em ${notification.sent}`
                          : `Agendada para ${notification.scheduled}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
