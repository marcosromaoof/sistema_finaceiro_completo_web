import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, DollarSign, TrendingUp, CreditCard, Settings, 
  Key, Zap, MessageSquare, Save, Eye, EyeOff, Shield,
  BarChart3, Activity, AlertCircle, Lock
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [showKeys, setShowKeys] = useState(false);

  // Configurações de IA
  const [openaiKey, setOpenaiKey] = useState("sk-proj-****");
  const [claudeKey, setClaudeKey] = useState("sk-ant-****");
  const [geminiKey, setGeminiKey] = useState("AIza****");

  // Configurações de Pagamento
  const [stripePublicKey, setStripePublicKey] = useState("pk_test_****");
  const [stripeSecretKey, setStripeSecretKey] = useState("sk_test_****");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("whsec_****");

  // Configurações de n8n
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("https://n8n.example.com/webhook/****");
  const [n8nApiKey, setN8nApiKey] = useState("n8n_****");

  // Configurações de WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState("+55 11 99999-9999");
  const [whatsappToken, setWhatsappToken] = useState("EAAx****");

  const handleSaveConfig = (section: string) => {
    toast.success(`Configurações de ${section} salvas com sucesso!`);
  };

  const stats = [
    {
      title: "Total de Usuários",
      value: "2.543",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Receita Mensal",
      value: "R$ 127.450",
      change: "+8.2%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Taxa de Conversão",
      value: "18.4%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Churn Rate",
      value: "3.2%",
      change: "-0.8%",
      icon: Activity,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ];

  const recentUsers = [
    { name: "João Silva", email: "joao@example.com", plan: "Premium", status: "Ativo", date: "2025-01-15" },
    { name: "Maria Santos", email: "maria@example.com", plan: "Free", status: "Ativo", date: "2025-01-14" },
    { name: "Pedro Costa", email: "pedro@example.com", plan: "Family", status: "Ativo", date: "2025-01-13" },
    { name: "Ana Lima", email: "ana@example.com", plan: "Premium", status: "Cancelado", date: "2025-01-12" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie a plataforma, usuários e configurações
          </p>
        </div>
        <Badge variant="default" className="gap-1">
          <Shield className="h-3 w-3" />
          Administrador
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  {' '}vs. mês anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="ai">Inteligência Artificial</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Recentes</CardTitle>
                <CardDescription>Últimos usuários cadastrados na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.status === "Ativo" ? "default" : "secondary"}>
                          {user.plan}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{user.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
                <CardDescription>Notificações e avisos importantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Backup Pendente</p>
                      <p className="text-xs text-muted-foreground">
                        Último backup realizado há 3 dias
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Atualização Disponível</p>
                      <p className="text-xs text-muted-foreground">
                        Nova versão 2.1.0 disponível
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Sistema Saudável</p>
                      <p className="text-xs text-muted-foreground">
                        Todos os serviços operando normalmente
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>Gerencie todos os usuários da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Buscar usuários..." className="flex-1" />
                  <Button>Buscar</Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Plano</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{user.plan}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.status === "Ativo" ? "default" : "secondary"}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm">Editar</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configurações de Pagamento (Stripe)
              </CardTitle>
              <CardDescription>
                Configure as chaves de API do Stripe para processar pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-public">Chave Pública (Publishable Key)</Label>
                <div className="flex gap-2">
                  <Input
                    id="stripe-public"
                    type={showKeys ? "text" : "password"}
                    value={stripePublicKey}
                    onChange={(e) => setStripePublicKey(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys(!showKeys)}
                  >
                    {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Chave Secreta (Secret Key)</Label>
                <Input
                  id="stripe-secret"
                  type={showKeys ? "text" : "password"}
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                <Input
                  id="stripe-webhook"
                  type={showKeys ? "text" : "password"}
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                />
              </div>

              <Button onClick={() => handleSaveConfig("Pagamento")} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações de Pagamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  OpenAI
                </CardTitle>
                <CardDescription>Configure a API da OpenAI (GPT-4)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key</Label>
                  <Input
                    id="openai-key"
                    type={showKeys ? "text" : "password"}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSaveConfig("OpenAI")} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Claude (Anthropic)
                </CardTitle>
                <CardDescription>Configure a API do Claude</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claude-key">API Key</Label>
                  <Input
                    id="claude-key"
                    type={showKeys ? "text" : "password"}
                    value={claudeKey}
                    onChange={(e) => setClaudeKey(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSaveConfig("Claude")} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Google Gemini
                </CardTitle>
                <CardDescription>Configure a API do Gemini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">API Key</Label>
                  <Input
                    id="gemini-key"
                    type={showKeys ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSaveConfig("Gemini")} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  n8n Automação
                </CardTitle>
                <CardDescription>Configure webhooks e automações do n8n</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="n8n-webhook">Webhook URL</Label>
                  <Input
                    id="n8n-webhook"
                    value={n8nWebhookUrl}
                    onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="n8n-api">API Key</Label>
                  <Input
                    id="n8n-api"
                    type={showKeys ? "text" : "password"}
                    value={n8nApiKey}
                    onChange={(e) => setN8nApiKey(e.target.value)}
                  />
                </div>

                <Button onClick={() => handleSaveConfig("n8n")} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações n8n
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  WhatsApp Business
                </CardTitle>
                <CardDescription>Configure integração com WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                  <Input
                    id="whatsapp-number"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-token">Access Token</Label>
                  <Input
                    id="whatsapp-token"
                    type={showKeys ? "text" : "password"}
                    value={whatsappToken}
                    onChange={(e) => setWhatsappToken(e.target.value)}
                  />
                </div>

                <Button onClick={() => handleSaveConfig("WhatsApp")} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}
