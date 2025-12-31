import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  Mail, 
  ExternalLink,
  Shield,
  Clock,
  XCircle
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

type ErrorType = "callback_failed" | "token_exchange" | "user_info" | "session_creation" | "unknown";

interface ErrorInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  suggestions: string[];
  technicalDetails?: string;
}

export default function AuthError() {
  const [location] = useLocation();
  const [errorType, setErrorType] = useState<ErrorType>("unknown");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as ErrorType || "unknown";
    const message = params.get("message") || "";
    setErrorType(type);
    setErrorMessage(message);
  }, [location]);

  const getErrorInfo = (type: ErrorType): ErrorInfo => {
    switch (type) {
      case "callback_failed":
        return {
          title: "Falha na Autenticação",
          description: "Não foi possível completar o processo de login. O servidor OAuth retornou um erro.",
          icon: <XCircle className="w-12 h-12 text-destructive" />,
          suggestions: [
            "Verifique sua conexão com a internet",
            "Tente fazer login novamente",
            "Limpe o cache e cookies do navegador",
            "Se o problema persistir, entre em contato com o suporte"
          ],
          technicalDetails: errorMessage || "OAuth callback failed"
        };
      
      case "token_exchange":
        return {
          title: "Erro na Troca de Token",
          description: "O código de autorização não pôde ser trocado por um token de acesso.",
          icon: <Shield className="w-12 h-12 text-destructive" />,
          suggestions: [
            "O código de autorização pode ter expirado",
            "Tente fazer login novamente",
            "Verifique se você está usando a versão mais recente do navegador",
            "Entre em contato com o suporte se o erro persistir"
          ],
          technicalDetails: errorMessage || "Token exchange failed"
        };
      
      case "user_info":
        return {
          title: "Erro ao Obter Informações do Usuário",
          description: "Não foi possível recuperar suas informações de perfil do provedor de autenticação.",
          icon: <AlertCircle className="w-12 h-12 text-destructive" />,
          suggestions: [
            "Verifique as permissões concedidas ao aplicativo",
            "Tente fazer login com outro método (Google, Microsoft, Apple)",
            "Revogue e reautorize o acesso ao aplicativo",
            "Entre em contato com o suporte"
          ],
          technicalDetails: errorMessage || "User info retrieval failed"
        };
      
      case "session_creation":
        return {
          title: "Erro ao Criar Sessão",
          description: "Não foi possível criar uma sessão de usuário no sistema.",
          icon: <Clock className="w-12 h-12 text-destructive" />,
          suggestions: [
            "Verifique se os cookies estão habilitados no navegador",
            "Tente usar o modo anônimo/privado",
            "Limpe os dados do site e tente novamente",
            "Entre em contato com o suporte técnico"
          ],
          technicalDetails: errorMessage || "Session creation failed"
        };
      
      default:
        return {
          title: "Erro Desconhecido",
          description: "Ocorreu um erro inesperado durante o processo de autenticação.",
          icon: <AlertCircle className="w-12 h-12 text-destructive" />,
          suggestions: [
            "Tente fazer login novamente",
            "Limpe o cache e cookies do navegador",
            "Tente usar outro navegador",
            "Entre em contato com o suporte com o código de erro abaixo"
          ],
          technicalDetails: errorMessage || "Unknown error"
        };
    }
  };

  const errorInfo = getErrorInfo(errorType);

  const handleRetry = () => {
    window.location.href = "/";
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Erro de Autenticação - ${errorType}`);
    const body = encodeURIComponent(
      `Olá,\n\nEncontrei um erro ao tentar fazer login no Organizai.\n\nTipo de erro: ${errorType}\nDetalhes técnicos: ${errorInfo.technicalDetails}\n\nPor favor, me ajude a resolver este problema.\n\nObrigado!`
    );
    window.location.href = `mailto:support@organizai.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FadeIn>
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {errorInfo.icon}
            </div>
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
            <CardDescription className="text-base">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sugestões */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                O que você pode fazer:
              </h3>
              <ul className="space-y-2">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detalhes Técnicos */}
            {errorInfo.technicalDetails && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-mono">
                  <strong>Detalhes técnicos:</strong> {errorInfo.technicalDetails}
                </AlertDescription>
              </Alert>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleRetry} 
                className="flex-1"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="flex-1 w-full"
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={handleContactSupport}
                className="text-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Entrar em contato com o suporte
              </Button>
            </div>

            {/* Link para documentação */}
            <div className="text-center pt-4 border-t">
              <a 
                href="https://help.manus.im" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Ver documentação de ajuda
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
