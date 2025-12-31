import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Calendar, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AutoTransfers() {
  const [isCreating, setIsCreating] = useState(false);

  const autoTransfers = [
    {
      id: 1,
      name: "Poupança Mensal",
      fromAccount: "Conta Corrente",
      toAccount: "Poupança",
      amount: "R$ 500,00",
      frequency: "monthly",
      dayOfMonth: 5,
      isActive: true,
      nextExecution: "05/02/2025",
    },
    {
      id: 2,
      name: "Investimento Automático",
      fromAccount: "Conta Corrente",
      toAccount: "Investimentos",
      amount: "R$ 1.000,00",
      frequency: "monthly",
      dayOfMonth: 10,
      isActive: true,
      nextExecution: "10/02/2025",
    },
    {
      id: 3,
      name: "Reserva de Emergência",
      fromAccount: "Conta Corrente",
      toAccount: "Fundo de Emergência",
      amount: "R$ 300,00",
      frequency: "weekly",
      dayOfWeek: "friday",
      isActive: false,
      nextExecution: "-",
    },
  ];

  const handleToggleTransfer = (id: number) => {
    toast.success("Transferência automática atualizada");
  };

  const handleDeleteTransfer = (id: number) => {
    toast.success("Transferência automática removida");
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Diário",
      weekly: "Semanal",
      monthly: "Mensal",
      yearly: "Anual",
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transferências Automáticas</h1>
          <p className="text-muted-foreground">
            Configure transferências recorrentes entre suas contas
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transferência
        </Button>
      </div>

      {/* Formulário de Criação */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Transferência Automática</CardTitle>
            <CardDescription>
              Configure uma transferência recorrente entre suas contas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Ex: Poupança Mensal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input id="amount" type="number" placeholder="0,00" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">Conta de Origem</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Conta Corrente</SelectItem>
                    <SelectItem value="2">Poupança</SelectItem>
                    <SelectItem value="3">Investimentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Conta de Destino</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Conta Corrente</SelectItem>
                    <SelectItem value="2">Poupança</SelectItem>
                    <SelectItem value="3">Investimentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="day">Dia</Label>
                <Input id="day" type="number" min="1" max="31" placeholder="1-31" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => {
                toast.success("Transferência automática criada");
                setIsCreating(false);
              }}>
                Criar Transferência
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Transferências */}
      <div className="grid gap-4">
        {autoTransfers.map((transfer) => (
          <Card key={transfer.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{transfer.name}</h3>
                    <Badge variant={transfer.isActive ? "default" : "secondary"}>
                      {transfer.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium">{transfer.fromAccount}</span>
                    <ArrowRightLeft className="h-4 w-4" />
                    <span className="font-medium">{transfer.toAccount}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor: </span>
                      <span className="font-semibold">{transfer.amount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequência: </span>
                      <span className="font-medium">{getFrequencyLabel(transfer.frequency)}</span>
                    </div>
                    {transfer.dayOfMonth && (
                      <div>
                        <span className="text-muted-foreground">Dia: </span>
                        <span className="font-medium">{transfer.dayOfMonth}</span>
                      </div>
                    )}
                  </div>

                  {transfer.isActive && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Próxima execução: <span className="font-medium">{transfer.nextExecution}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={transfer.isActive}
                    onCheckedChange={() => handleToggleTransfer(transfer.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTransfer(transfer.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {autoTransfers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma transferência automática</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira transferência automática para economizar tempo
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Transferência
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
