import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function CheckoutCanceled() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-orange-700">
            Checkout Cancelado
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Você cancelou o processo de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700">
              Não se preocupe! Nenhuma cobrança foi realizada. Você pode tentar novamente a qualquer momento.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Por que assinar o Organizai?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>14 dias grátis</strong> para testar todas as funcionalidades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Cancele quando quiser</strong>, sem taxas ou multas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Dados seguros</strong> com criptografia de ponta a ponta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Suporte dedicado</strong> para ajudar você a organizar suas finanças</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Planos
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setLocation("/support")}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Preciso de Ajuda
            </Button>
          </div>

          <div className="border-t pt-4 mt-6">
            <p className="text-sm text-center text-muted-foreground">
              Tem dúvidas sobre os planos ou pagamento?{" "}
              <button 
                onClick={() => setLocation("/support")}
                className="text-primary hover:underline font-medium"
              >
                Fale com nosso suporte
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
