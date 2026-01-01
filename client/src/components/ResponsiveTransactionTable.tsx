import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpRight, ArrowDownRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string | null;
  date: Date | string;
  isPending: boolean;
  category?: {
    name: string;
    color: string;
  } | null;
  account?: {
    name: string;
  } | null;
}

interface ResponsiveTransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export function ResponsiveTransactionTable({
  transactions,
  onEdit,
  onDelete,
}: ResponsiveTransactionTableProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <>
      {/* Desktop View - Tabela tradicional */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                Tipo
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                Descrição
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                Categoria
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                Conta
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                Data
              </th>
              <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                Valor
              </th>
              <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-prosperity" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm">
                      {transaction.type === "income" ? "Receita" : "Despesa"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.description || "Sem descrição"}
                    </p>
                    {transaction.isPending && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Pendente
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {transaction.category && (
                    <Badge
                      variant="outline"
                      style={{ borderColor: transaction.category.color }}
                      className="text-xs"
                    >
                      {transaction.category.name}
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {transaction.account?.name || "-"}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-prosperity"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(transaction.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {transaction.type === "income" ? (
                    <div className="p-2 rounded-lg bg-prosperity/10">
                      <ArrowUpRight className="w-4 h-4 text-prosperity" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description || "Sem descrição"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(transaction.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {transaction.category && (
                    <Badge
                      variant="outline"
                      style={{ borderColor: transaction.category.color }}
                      className="text-xs"
                    >
                      {transaction.category.name}
                    </Badge>
                  )}
                  {transaction.isPending && (
                    <Badge variant="outline" className="text-xs">
                      Pendente
                    </Badge>
                  )}
                  {transaction.account && (
                    <Badge variant="secondary" className="text-xs">
                      {transaction.account.name}
                    </Badge>
                  )}
                </div>
                <span
                  className={`font-bold text-lg ${
                    transaction.type === "income"
                      ? "text-prosperity"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
