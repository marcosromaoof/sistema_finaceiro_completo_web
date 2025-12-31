import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Mail, Key, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TwoFactorAuth() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);

  const handleEnable2FA = () => {
    setShowQRCode(true);
    toast.info("Escaneie o QR Code com seu aplicativo autenticador");
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setIs2FAEnabled(true);
      setShowQRCode(false);
      toast.success("2FA ativado com sucesso!");
    } else {
      toast.error("Código inválido. Digite um código de 6 dígitos.");
    }
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    toast.success("2FA desativado");
  };

  const handleSendSMS = () => {
    if (phoneNumber) {
      toast.success(`Código enviado para ${phoneNumber}`);
    } else {
      toast.error("Digite um número de telefone válido");
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Autenticação de Dois Fatores (2FA)</h1>
        <p className="text-muted-foreground">
          Adicione uma camada extra de segurança à sua conta
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Status da Autenticação</CardTitle>
                <CardDescription>
                  {is2FAEnabled
                    ? "Sua conta está protegida com 2FA"
                    : "Sua conta não está protegida com 2FA"}
                </CardDescription>
              </div>
            </div>
            <Badge variant={is2FAEnabled ? "default" : "secondary"} className="gap-1">
              {is2FAEnabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Ativo
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Inativo
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 2FA Methods */}
      <Tabs defaultValue="app" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="app">
            <Smartphone className="mr-2 h-4 w-4" />
            App Autenticador
          </TabsTrigger>
          <TabsTrigger value="sms">
            <Mail className="mr-2 h-4 w-4" />
            SMS
          </TabsTrigger>
        </TabsList>

        {/* Authenticator App */}
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aplicativo Autenticador</CardTitle>
              <CardDescription>
                Use um aplicativo como Google Authenticator, Authy ou Microsoft Authenticator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!is2FAEnabled && !showQRCode && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-medium">Como configurar:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Instale um aplicativo autenticador no seu smartphone</li>
                      <li>Clique em "Ativar 2FA" para gerar um QR Code</li>
                      <li>Escaneie o QR Code com o aplicativo</li>
                      <li>Digite o código de 6 dígitos gerado</li>
                    </ol>
                  </div>
                  <Button onClick={handleEnable2FA} className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Ativar 2FA
                  </Button>
                </div>
              )}

              {showQRCode && !is2FAEnabled && (
                <div className="space-y-4">
                  <div className="flex justify-center p-8 bg-muted rounded-lg">
                    <div className="h-48 w-48 bg-white flex items-center justify-center border-4 border-primary rounded-lg">
                      <div className="text-center">
                        <Key className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">QR Code</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secret">Chave Manual (caso não consiga escanear)</Label>
                    <Input
                      id="secret"
                      value="JBSWY3DPEHPK3PXP"
                      readOnly
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Código de Verificação</Label>
                    <Input
                      id="code"
                      placeholder="000000"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleVerifyCode} className="flex-1">
                      Verificar e Ativar
                    </Button>
                    <Button variant="outline" onClick={() => setShowQRCode(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {is2FAEnabled && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="font-medium">2FA está ativo</p>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      Sua conta está protegida com autenticação de dois fatores
                    </p>
                  </div>

                  <Button variant="destructive" onClick={handleDisable2FA} className="w-full">
                    Desativar 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação via SMS</CardTitle>
              <CardDescription>
                Receba códigos de verificação por mensagem de texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+55 (11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <Button onClick={handleSendSMS} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Enviar Código de Verificação
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Podem ser aplicadas taxas de SMS pela sua operadora.
                  Recomendamos usar um aplicativo autenticador para maior segurança.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup Codes */}
      {is2FAEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Códigos de Backup</CardTitle>
            <CardDescription>
              Use estes códigos se você perder acesso ao seu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              <div>1234-5678</div>
              <div>2345-6789</div>
              <div>3456-7890</div>
              <div>4567-8901</div>
              <div>5678-9012</div>
              <div>6789-0123</div>
            </div>
            <Button variant="outline" className="w-full">
              Baixar Códigos de Backup
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
