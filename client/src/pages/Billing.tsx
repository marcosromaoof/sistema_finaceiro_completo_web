import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Download, 
  ExternalLink, 
  Calendar, 
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PRODUCTS } from "../../../shared/products";

export default function Billing() {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const { data: subscriptionStatus } = trpc.checkout.getSubscriptionStatus.useQuery();
  const { data: currentSubscription } = trpc.checkout.getCurrentSubscription.useQuery();
  const { data: invoices = [] } = trpc.checkout.getInvoices.useQuery();

  const createPortalSession = trpc.checkout.createCustomerPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Erro ao abrir portal", {
        description: error.message,
      });
      setIsLoadingPortal(false);
    },
  });

  const cancelSubscription = trpc.checkout.cancelSubscription.useMutation({
    onSuccess: (data) => {
      toast.success("Assinatura cancelada", {
        description: data.cancelAt 
          ? `Sua assinatura será cancelada em ${new Date(data.cancelAt).toLocaleDateString()}`
          : "Sua assinatura foi cancelada",
      });
      setIsCanceling(false);
      window.location.reload();
    },
    onError: (error) => {
      toast.error("Erro ao cancelar assinatura", {
        description: error.message,
      });
      setIsCanceling(false);
    },
  });

  const handleOpenPortal = () => {
    setIsLoadingPortal(true);
    createPortalSession.mutate();
  };

  const handleCancelSubscription = () => {
    if (confirm("Tem certeza que deseja cancelar sua assinatura? Você ainda terá acesso até o final do período pago.")) {
      setIsCanceling(true);
      cancelSubscription.mutate();
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Ativa", variant: "default" },
      trialing: { label: "Período de Teste", variant: "secondary" },
      canceled: { label: "Cancelada", variant: "destructive" },
      past_due: { label: "Pagamento Pendente", variant: "destructive" },
      incomplete: { label: "Incompleta", variant: "outline" },
    };

    const config = statusMap[status || ""] || { label: "Gratuito", variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInvoiceStatusIcon = (status: string | null) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "open":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "void":
      case "uncollectible":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const currentPlan = subscriptionStatus?.plan || "free";
  const planDetails = PRODUCTS[currentPlan.toUpperCase() as keyof typeof PRODUCTS];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cobrança e Assinatura</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie sua assinatura, métodos de pagamento e histórico de faturas
          </p>
        </div>

        {/* Current Subscription Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>Informações da sua assinatura</CardDescription>
              </div>
              {getStatusBadge(subscriptionStatus?.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plano</p>
                <p className="text-2xl font-bold">{planDetails?.name || "Free"}</p>
                {planDetails && planDetails.price > 0 && (
                  <p className="text-muted-foreground mt-1">
                    {formatCurrency(planDetails.price, "BRL")}/mês
                  </p>
                )}
              </div>

              {currentSubscription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Próxima Cobrança</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                      {formatDate(currentSubscription.currentPeriodEnd)}
                    </p>
                  </div>
                  {currentSubscription.cancelAtPeriodEnd && (
                    <p className="text-sm text-orange-600 mt-1">
                      Cancelamento agendado para esta data
                    </p>
                  )}
                </div>
              )}
            </div>

            {currentPlan !== "free" && planDetails && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Recursos Incluídos:</p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {planDetails.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-wrap gap-3">
              {subscriptionStatus?.stripeCustomerId && (
                <Button
                  onClick={handleOpenPortal}
                  disabled={isLoadingPortal}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {isLoadingPortal ? "Carregando..." : "Gerenciar Assinatura"}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}

              {currentPlan !== "free" && !currentSubscription?.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                >
                  {isCanceling ? "Cancelando..." : "Cancelar Assinatura"}
                </Button>
              )}

              {currentPlan === "free" && (
                <Button asChild>
                  <a href="/#pricing">Ver Planos Premium</a>
                </Button>
              )}
            </div>

            {currentSubscription?.cancelAtPeriodEnd && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sua assinatura será cancelada em{" "}
                  <strong>{formatDate(currentSubscription.currentPeriodEnd)}</strong>.
                  Você pode reativar a qualquer momento antes desta data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Invoices History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Faturas</CardTitle>
            <CardDescription>
              Visualize e baixe suas faturas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma fatura encontrada</p>
                <p className="text-sm mt-1">
                  Suas faturas aparecerão aqui após o primeiro pagamento
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getInvoiceStatusIcon(invoice.status)}
                      <div>
                        <p className="font-medium">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.created)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {invoice.status === "paid" ? "Pago" : invoice.status}
                      </Badge>
                      {invoice.invoicePdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            PDF
                          </a>
                        </Button>
                      )}
                      {invoice.hostedInvoiceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Precisa de Ajuda?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Se você tiver dúvidas sobre cobrança, pagamentos ou sua assinatura, nossa equipe está pronta para ajudar.
            </p>
            <Button variant="outline" asChild>
              <a href="/support">Contatar Suporte</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
