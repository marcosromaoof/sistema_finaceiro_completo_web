import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ticketSchema = z.object({
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  category: z.enum(["technical", "billing", "feature", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const categoryLabels = {
  technical: "Técnico",
  billing: "Cobrança",
  feature: "Funcionalidade",
  other: "Outro"
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente"
};

const statusLabels = {
  open: "Aberto",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  closed: "Fechado"
};

const statusColors = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500"
};

const priorityColors = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500"
};

export default function Support() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: tickets, refetch } = trpc.support.listTickets.useQuery();
  const createTicket = trpc.support.createTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket criado com sucesso!");
      refetch();
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar ticket");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  const onSubmit = (data: TicketFormData) => {
    createTicket.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Suporte</h1>
            <p className="text-muted-foreground">
              Gerencie seus tickets de suporte e obtenha ajuda
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Ticket</DialogTitle>
                <DialogDescription>
                  Descreva seu problema ou solicitação. Nossa equipe responderá em breve.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Resumo do problema ou solicitação"
                    {...register("subject")}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select onValueChange={(value) => setValue("category", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="billing">Cobrança</SelectItem>
                        <SelectItem value="feature">Funcionalidade</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select onValueChange={(value) => setValue("priority", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-destructive">{errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente seu problema ou solicitação..."
                    rows={6}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createTicket.isPending}>
                    {createTicket.isPending ? "Criando..." : "Criar Ticket"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertos</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tickets?.filter((t: any) => t.status === "open").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tickets?.filter((t: any) => t.status === "in_progress").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tickets?.filter((t: any) => t.status === "resolved" || t.status === "closed").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Meus Tickets</h2>
          {tickets && tickets.length > 0 ? (
            <div className="grid gap-4">
              {tickets.map((ticket: any) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                          <Badge variant="outline" className={`${statusColors[ticket.status as keyof typeof statusColors]} text-white`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(ticket.status)}
                              {statusLabels[ticket.status as keyof typeof statusLabels]}
                            </span>
                          </Badge>
                        </div>
                        <CardDescription>
                          Ticket #{ticket.id} • {categoryLabels[ticket.category as keyof typeof categoryLabels]}
                        </CardDescription>
                      </div>
                      <Badge className={`${priorityColors[ticket.priority as keyof typeof priorityColors]} text-white`}>
                        {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Criado em {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</span>
                      {ticket.updatedAt && (
                        <span>Atualizado em {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nenhum ticket encontrado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie seu primeiro ticket de suporte clicando no botão acima
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
