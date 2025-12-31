import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, AlertCircle, Zap, MessageSquare, Bell, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "inactive";
  createdAt: Date;
}

export default function N8nIntegration() {
  const [copied, setCopied] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: "1",
      name: "WhatsApp - Consulta de Saldo",
      trigger: "Mensagem WhatsApp recebida",
      action: "Enviar saldo atual",
      status: "active",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Email - Alerta de Limite",
      trigger: "Orçamento ultrapassado",
      action: "Enviar email de alerta",
      status: "active",
      createdAt: new Date("2024-01-20"),
    },
  ]);

  const webhookUrl = "https://api.finmaster.pro/webhooks/n8n";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("URL copiada para a área de transferência");
  };

  const toggleAutomation = (id: string) => {
    setAutomations(
      automations.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a
      )
    );
    toast.success("Automação atualizada");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Integração com n8n
          </h1>
          <p className="text-muted-foreground">
            Configure automações e integrações com WhatsApp, Email e outros serviços
          </p>
        </div>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração de Webhook</CardTitle>
            <CardDescription>Use esta URL para conectar seu n8n ao FinMaster Pro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Como configurar no n8n:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Crie um novo workflow no n8n</li>
                    <li>Adicione um trigger (ex: WhatsApp, Email)</li>
                    <li>Adicione um nó HTTP POST com a URL acima</li>
                    <li>Ative o workflow</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Integração com WhatsApp
            </CardTitle>
            <CardDescription>Configure chatbot para consultas via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Token do WhatsApp Business API</label>
                <Input placeholder="Insira seu token aqui" type="password" />
              </div>
              <div>
                <label className="text-sm font-medium">Número de Telefone</label>
                <Input placeholder="+55 11 98765-4321" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                ✓ Com WhatsApp integrado, seus usuários podem:
              </p>
              <ul className="text-sm text-green-800 mt-2 space-y-1 ml-4">
                <li>• Consultar saldo de contas</li>
                <li>• Ver últimas transações</li>
                <li>• Receber alertas de gastos</li>
                <li>• Solicitar relatórios</li>
              </ul>
            </div>

            <Button className="w-full">Conectar WhatsApp</Button>
          </CardContent>
        </Card>

        {/* Email Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Integração com Email
            </CardTitle>
            <CardDescription>Configure notificações por email automáticas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Servidor SMTP</label>
                <Input placeholder="smtp.gmail.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Porta</label>
                  <Input placeholder="587" />
                </div>
                <div>
                  <label className="text-sm font-medium">Protocolo</label>
                  <Input placeholder="TLS" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="seu-email@gmail.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input placeholder="sua-senha" type="password" />
              </div>
            </div>

            <Button className="w-full">Conectar Email</Button>
          </CardContent>
        </Card>

        {/* Automations List */}
        <Card>
          <CardHeader>
            <CardTitle>Automações Ativas</CardTitle>
            <CardDescription>Gerencie seus workflows e automações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{automation.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Trigger: <span className="font-mono">{automation.trigger}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ação: <span className="font-mono">{automation.action}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={automation.status === "active" ? "default" : "secondary"}>
                      {automation.status === "active" ? "Ativa" : "Inativa"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAutomation(automation.id)}
                    >
                      {automation.status === "active" ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Criar Nova Automação
            </Button>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Documentação da API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`POST /webhooks/n8n
Content-Type: application/json

{
  "event": "transaction.created",
  "data": {
    "userId": "123",
    "amount": 100.00,
    "category": "Alimentação",
    "description": "Supermercado"
  }
}

Response:
{
  "success": true,
  "message": "Webhook processado com sucesso"
}`}</pre>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Eventos disponíveis:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• transaction.created</li>
                <li>• budget.exceeded</li>
                <li>• goal.reached</li>
                <li>• debt.payment</li>
                <li>• alert.triggered</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
