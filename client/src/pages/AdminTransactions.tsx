import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  MoreVertical,
  ArrowUpDown,
  Undo2,
  Eye,
  Receipt
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  // Queries
  const { data: allTransactions, isLoading, refetch } = trpc.transactions.getAll.useQuery();
  
  // Mutations
  const refundMutation = trpc.transactions.refund.useMutation({
    onSuccess: () => {
      toast.success("Estorno realizado com sucesso!");
      setRefundDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao realizar estorno");
    },
  });

  // Filtrar transações
  const filteredTransactions = allTransactions?.filter((transaction: any) => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toString().includes(searchQuery);
    
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    return matchesSearch && matchesType;
  }) || [];

  // Calcular estatísticas
  const totalIncome = filteredTransactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const handleRefund = (transaction: any) => {
    setSelectedTransaction(transaction);
    setRefundDialogOpen(true);
  };

  const confirmRefund = () => {
    if (selectedTransaction) {
      refundMutation.mutate({ transactionId: selectedTransaction.id });
    }
  };

  const handleExport = () => {
    // Criar CSV
    const headers = ["ID", "Data", "Descrição", "Tipo", "Valor", "Usuário"];
    const rows = filteredTransactions.map((t: any) => [
      t.id,
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description || "",
      t.type === "income" ? "Receita" : "Despesa",
      `R$ ${Number(t.amount).toFixed(2)}`,
      t.userId
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success("Transações exportadas com sucesso!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="h-8 w-8" />
            Gerenciamento de Transações
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize, filtre e gerencie todas as transações do sistema
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpense.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ID ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>

                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        #{transaction.id}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{transaction.description || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                          {transaction.type === "income" ? "+" : "-"} R$ {Number(transaction.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        ID: {transaction.userId}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRefund(transaction)}>
                              <Undo2 className="h-4 w-4 mr-2" />
                              Estornar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Estorno */}
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Estorno</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja estornar esta transação? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            {selectedTransaction && (
              <div className="space-y-2 py-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">#{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Descrição:</span>
                  <span>{selectedTransaction.description || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-semibold">
                    R$ {Number(selectedTransaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmRefund}
                disabled={refundMutation.isPending}
              >
                {refundMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Confirmar Estorno
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
