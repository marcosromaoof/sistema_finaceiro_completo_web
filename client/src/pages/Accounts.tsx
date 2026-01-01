import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Wallet, CreditCard, PiggyBank, TrendingUp, AlertCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountListSkeleton } from "@/components/skeletons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const accountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["checking", "savings", "credit_card", "investment", "loan", "other"]),
  balance: z.string().min(1, "Saldo é obrigatório"),
  currency: z.string().default("BRL"),
  institution: z.string().optional(),
  accountNumber: z.string().optional(),
  creditLimit: z.string().optional(),
  color: z.string().default("#3b82f6"),
});

type AccountFormData = z.infer<typeof accountSchema>;

const accountTypeLabels: Record<string, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  credit_card: "Cartão de Crédito",
  investment: "Investimento",
  loan: "Empréstimo",
  other: "Outro",
};

const accountTypeIcons: Record<string, any> = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: AlertCircle,
  other: Wallet,
};

const accountColors = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
];

export default function Accounts() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<number | null>(null);
  
  const { data: accounts, isLoading } = trpc.accounts.list.useQuery();
  const utils = trpc.useUtils();
  
  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: () => {
      utils.accounts.list.invalidate();
      utils.dashboard.summary.invalidate();
      setIsCreateOpen(false);
      toast.success("Conta criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar conta: " + error.message);
    },
  });
  
  const updateMutation = trpc.accounts.update.useMutation({
    onSuccess: () => {
      utils.accounts.list.invalidate();
      utils.dashboard.summary.invalidate();
      setEditingAccount(null);
      toast.success("Conta atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conta: " + error.message);
    },
  });
  
  const deleteMutation = trpc.accounts.delete.useMutation({
    onSuccess: () => {
      utils.accounts.list.invalidate();
      utils.dashboard.summary.invalidate();
      setDeletingAccountId(null);
      toast.success("Conta excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir conta: " + error.message);
    },
  });

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: "",
      type: "checking",
      balance: "0.00",
      currency: "BRL",
      institution: "",
      accountNumber: "",
      creditLimit: "",
      color: "#3b82f6",
    },
  });

  const editForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
  });

  const onSubmit = (data: AccountFormData) => {
    if (editingAccount) {
      updateMutation.mutate({
        id: editingAccount.id,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    editForm.reset({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      institution: account.institution || "",
      accountNumber: account.accountNumber || "",
      creditLimit: account.creditLimit || "",
      color: account.color,
    });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Contas</h1>
            <p className="text-muted-foreground">
              Gerencie suas contas financeiras
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Conta</DialogTitle>
                <DialogDescription>
                  Adicione uma nova conta financeira ao seu portfólio
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Conta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Conta Corrente Banco X" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(accountTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="balance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saldo Atual</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="creditLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite de Crédito (opcional)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="institution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instituição (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Banco do Brasil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da Conta (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 12345-6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma cor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountColors.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Criando..." : "Criar Conta"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Accounts Grid */}
        {isLoading ? (
          <AccountListSkeleton count={6} />
        ) : accounts && accounts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const Icon = accountTypeIcons[account.type];
              return (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${account.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: account.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{account.name}</CardTitle>
                          <CardDescription>
                            {accountTypeLabels[account.type]}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(account)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingAccountId(account.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(account.balance)}
                        </p>
                        <p className="text-sm text-muted-foreground">Saldo atual</p>
                      </div>
                      {account.institution && (
                        <p className="text-sm text-muted-foreground">
                          {account.institution}
                        </p>
                      )}
                      {account.creditLimit && (
                        <p className="text-sm text-muted-foreground">
                          Limite: {formatCurrency(account.creditLimit)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Nenhuma conta cadastrada
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando sua primeira conta financeira
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Conta</DialogTitle>
              <DialogDescription>
                Atualize as informações da sua conta
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Conta</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Atual</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instituição</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountColors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingAccount(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deletingAccountId !== null}
          onOpenChange={() => setDeletingAccountId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita
                e todas as transações associadas serão mantidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingAccountId) {
                    deleteMutation.mutate({ id: deletingAccountId });
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
