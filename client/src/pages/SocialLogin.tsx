import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chrome, Apple, Facebook, Link2, Unlink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SocialLogin() {
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: true,
    apple: false,
    facebook: false,
  });

  const handleConnect = (provider: string) => {
    toast.success(`Conectando com ${provider}...`);
    setTimeout(() => {
      setConnectedAccounts(prev => ({ ...prev, [provider]: true }));
      toast.success(`${provider} conectado com sucesso!`);
    }, 1500);
  };

  const handleDisconnect = (provider: string) => {
    setConnectedAccounts(prev => ({ ...prev, [provider]: false }));
    toast.success(`${provider} desconectado`);
  };

  const socialProviders = [
    {
      id: "google",
      name: "Google",
      icon: Chrome,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      description: "Continue com sua conta Google",
    },
    {
      id: "apple",
      name: "Apple",
      icon: Apple,
      color: "text-gray-900 dark:text-gray-100",
      bgColor: "bg-gray-50 dark:bg-gray-900",
      description: "Continue com seu Apple ID",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      description: "Continue com sua conta Facebook",
    },
  ];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Login Social</h1>
        <p className="text-muted-foreground">
          Conecte suas contas sociais para fazer login mais rápido
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Contas Conectadas
          </CardTitle>
          <CardDescription>
            Gerencie as contas sociais vinculadas à sua conta do FinMaster Pro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>
              Você pode fazer login com qualquer uma das contas conectadas
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Social Providers */}
      <div className="grid gap-4">
        {socialProviders.map((provider) => {
          const isConnected = connectedAccounts[provider.id as keyof typeof connectedAccounts];
          const Icon = provider.icon;

          return (
            <Card key={provider.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg ${provider.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${provider.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{provider.name}</h3>
                        {isConnected && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Conectado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                  </div>

                  {isConnected ? (
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(provider.id)}
                    >
                      <Unlink className="mr-2 h-4 w-4" />
                      Desconectar
                    </Button>
                  ) : (
                    <Button onClick={() => handleConnect(provider.id)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Conectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Privacidade:</strong> Não armazenamos suas senhas de redes sociais.
            Usamos OAuth 2.0 para autenticação segura.
          </p>
          <p>
            <strong>Permissões:</strong> Solicitamos apenas as permissões mínimas necessárias
            (nome, email e foto de perfil).
          </p>
          <p>
            <strong>Desconexão:</strong> Você pode desconectar suas contas sociais a qualquer
            momento sem perder acesso à sua conta do FinMaster Pro.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
