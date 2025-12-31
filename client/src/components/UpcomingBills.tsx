import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function UpcomingBills() {
  const { data: upcomingBills = [], isLoading, refetch } = trpc.transactions.getUpcomingBills.useQuery({
    days: 30,
    limit: 7,
  });

  const updateTransaction = trpc.transactions.update.useMutation({
    onSuccess: () => {
      toast.success("Conta marcada como paga");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conta", {
        description: error.message,
      });
    },
  });

  const markAsPaid = (transactionId: number) => {
    updateTransaction.mutate({
      id: transactionId,
      isPending: false,
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(amount));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (date: Date) => {
    const daysUntil = getDaysUntil(date);
    
    if (daysUntil < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Atrasado
        </Badge>
      );
    } else if (daysUntil === 0) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-orange-600">
          <Clock className="h-3 w-3" />
          Hoje
        </Badge>
      );
    } else if (daysUntil <= 3) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {daysUntil}d
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {daysUntil}d
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Contas</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingBills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Contas</CardTitle>
          <CardDescription>Próximos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma conta a vencer</p>
            <p className="text-sm mt-1">
              Você está em dia com suas contas!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Próximas Contas</CardTitle>
            <CardDescription>Próximos 30 dias</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/transactions">Ver todas</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingBills.map((bill) => {
            const transaction = bill.transaction;
            const category = bill.category;
            const account = bill.account;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: category?.color || "#6b7280" }}
                  >
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {transaction.description || category?.name || "Sem descrição"}
                      </p>
                      {getStatusBadge(transaction.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(transaction.date)}</span>
                      {account && (
                        <>
                          <span>•</span>
                          <span>{account.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-lg">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsPaid(transaction.id)}
                    disabled={updateTransaction.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Pagar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
