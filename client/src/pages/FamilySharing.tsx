import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function FamilySharing() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<"read" | "write">("read");

  const familyMembers = [
    { id: 1, name: "João Silva", email: "joao@example.com", permission: "write", status: "active" },
    { id: 2, name: "Maria Silva", email: "maria@example.com", permission: "read", status: "pending" },
  ];

  const sharedBudgets = [
    { id: 1, name: "Orçamento Familiar", category: "Geral", amount: "R$ 5.000,00", members: 3 },
    { id: 2, name: "Educação", category: "Educação", amount: "R$ 1.500,00", members: 2 },
  ];

  const sharedGoals = [
    { id: 1, name: "Viagem em Família", target: "R$ 15.000,00", current: "R$ 8.500,00", members: 4 },
    { id: 2, name: "Fundo de Emergência", target: "R$ 30.000,00", current: "R$ 12.000,00", members: 2 },
  ];

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast.error("Digite um email válido");
      return;
    }
    
    toast.success(`Convite enviado para ${inviteEmail}`);
    setInviteEmail("");
  };

  const handleRemoveMember = (memberId: number) => {
    toast.success("Membro removido com sucesso");
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Colaboração Familiar</h1>
        <p className="text-muted-foreground">
          Compartilhe orçamentos e metas com sua família
        </p>
      </div>

      {/* Convidar Membros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Membro da Família
          </CardTitle>
          <CardDescription>
            Envie um convite por email para adicionar um novo membro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission">Permissão</Label>
              <Select value={invitePermission} onValueChange={(v: "read" | "write") => setInvitePermission(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Somente Leitura</SelectItem>
                  <SelectItem value="write">Leitura e Edição</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSendInvite} className="w-full md:w-auto">
            <Mail className="mr-2 h-4 w-4" />
            Enviar Convite
          </Button>
        </CardContent>
      </Card>

      {/* Membros da Família */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Família
          </CardTitle>
          <CardDescription>
            Gerencie os membros e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status === "active" ? "Ativo" : "Pendente"}
                  </Badge>
                  <Badge variant="outline">
                    <Shield className="mr-1 h-3 w-3" />
                    {member.permission === "write" ? "Edição" : "Leitura"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orçamentos Compartilhados */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Compartilhados</CardTitle>
          <CardDescription>
            Orçamentos que você está compartilhando com sua família
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedBudgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{budget.name}</p>
                  <p className="text-sm text-muted-foreground">{budget.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{budget.amount}</p>
                  <p className="text-sm text-muted-foreground">
                    {budget.members} membros
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metas Compartilhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Metas Compartilhadas</CardTitle>
          <CardDescription>
            Metas que você está compartilhando com sua família
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{goal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {goal.members} membros
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(parseFloat(goal.current.replace(/[^\d,]/g, "").replace(",", ".")) / parseFloat(goal.target.replace(/[^\d,]/g, "").replace(",", "."))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
