import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  MessageSquare, 
  Mail, 
  Webhook,
  ExternalLink,
  Settings,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function AdminIntegrations() {
  const integrations = [
    {
      id: "n8n",
      name: "n8n Automações",
      description: "Crie workflows e automações personalizadas",
      icon: Zap,
      status: "active",
      color: "text-purple-500",
      link: "/n8n",
      features: [
        "Webhooks personalizados",
        "Automações de transações",
        "Alertas automáticos",
        "Integração com APIs externas"
      ]
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Envie notificações via WhatsApp",
      icon: MessageSquare,
      status: "inactive",
      color: "text-green-500",
      link: "/admin/whatsapp-config",
      features: [
        "Notificações de transações",
        "Alertas de orçamento",
        "Lembretes de contas",
        "Relatórios automáticos"
      ]
    },
    {
      id: "email",
      name: "Email SMTP",
      description: "Configure servidor de email personalizado",
      icon: Mail,
      status: "inactive",
      color: "text-blue-500",
      link: "/admin/email-config",
      features: [
        "Emails transacionais",
        "Newsletters",
        "Relatórios mensais",
        "Alertas por email"
      ]
    },
    {
      id: "webhooks",
      name: "Webhooks",
      description: "Receba eventos em tempo real",
      icon: Webhook,
      status: "active",
      color: "text-orange-500",
      link: "/admin/webhooks-config",
      features: [
        "Eventos de transações",
        "Eventos de usuários",
        "Eventos de pagamentos",
        "Eventos personalizados"
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground mt-2">
            Configure integrações e automações para expandir as funcionalidades do sistema
          </p>
        </div>

        {/* Cards de Integrações */}
        <div className="grid gap-6 md:grid-cols-2">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isActive = integration.status === "active";

            return (
              <Card key={integration.id} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${integration.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {isActive ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Inativa
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Recursos */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recursos:</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      className="flex-1 gap-2"
                      onClick={() => window.location.href = integration.link}
                    >
                      {isActive ? (
                        <>
                          <Settings className="h-4 w-4" />
                          Gerenciar
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(integration.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre Integrações</CardTitle>
            <CardDescription>
              Como funcionam as integrações no Organizai
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">🔌 Webhooks</h4>
              <p className="text-sm text-muted-foreground">
                Receba notificações em tempo real quando eventos importantes acontecem no sistema.
                Configure URLs para receber payloads JSON com dados de transações, usuários e mais.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">⚡ n8n Automações</h4>
              <p className="text-sm text-muted-foreground">
                Crie workflows personalizados sem código. Conecte o Organizai com centenas de
                serviços externos como Slack, Discord, Google Sheets, Notion e muito mais.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📱 WhatsApp Business</h4>
              <p className="text-sm text-muted-foreground">
                Envie notificações importantes diretamente no WhatsApp dos seus usuários.
                Configure mensagens automáticas para alertas de orçamento, lembretes de contas e relatórios.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📧 Email SMTP</h4>
              <p className="text-sm text-muted-foreground">
                Configure seu próprio servidor de email para enviar notificações transacionais,
                newsletters e relatórios mensais com sua marca personalizada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
