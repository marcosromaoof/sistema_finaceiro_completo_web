import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Track successful checkout
    console.log("[Checkout] Success page loaded");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-700">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Bem-vindo ao Organizai Premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              ✨ Sua assinatura está ativa!
            </h3>
            <p className="text-sm text-green-700">
              Você tem <strong>14 dias de teste grátis</strong>. Após este período, sua assinatura será renovada automaticamente.
              Você pode cancelar a qualquer momento sem custos.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg">O que você ganhou:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Acesso completo a todas as funcionalidades premium</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Contas e transações ilimitadas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Relatórios avançados em PDF e Excel</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Assistente financeiro com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={() => setLocation("/dashboard")}
            >
              Ir para o Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setLocation("/settings")}
            >
              Gerenciar Assinatura
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4">
            Um email de confirmação foi enviado para você com todos os detalhes da sua assinatura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
