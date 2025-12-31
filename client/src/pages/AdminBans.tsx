import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Ban, 
  RefreshCw, 
  Plus,
  Undo2,
  AlertTriangle,
  Clock,
  Infinity
} from "lucide-react";

export default function AdminBans() {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [banType, setBanType] = useState<"temporary" | "permanent">("temporary");
  const [expiresInDays, setExpiresInDays] = useState("7");

  // Queries
  const { data: bans, isLoading, refetch } = trpc.admin.getAllBans.useQuery();
  
  // Mutations
  const banUserMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário banido com sucesso!");
      setBanDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao banir usuário");
    },
  });

  const unbanUserMutation = trpc.admin.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("Banimento revertido com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao reverter banimento");
    },
  });

  const resetForm = () => {
    setUserId("");
    setReason("");
    setBanType("temporary");
    setExpiresInDays("7");
  };

  const handleBanUser = () => {
    if (!userId || !reason) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const expiresAt = banType === "temporary" 
      ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000)
      : undefined;

    banUserMutation.mutate({
      userId: parseInt(userId),
      reason,
      type: banType,
      expiresAt: expiresAt?.toISOString(),
    });
  };

  const handleUnban = (banId: number) => {
    if (confirm("Tem certeza que deseja reverter este banimento?")) {
      unbanUserMutation.mutate({ banId });
    }
  };

  // Calcular estatísticas
  const activeBans = bans?.filter((b: any) => b.isActive).length || 0;
  const temporaryBans = bans?.filter((b: any) => b.isActive && b.type === "temporary").length || 0;
  const permanentBans = bans?.filter((b: any) => b.isActive && b.type === "permanent").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ban className="h-8 w-8" />
              Sistema de Banimentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie banimentos de usuários da plataforma
            </p>
          </div>
          <Button onClick={() => setBanDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Banir Usuário
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Banimentos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{activeBans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Temporários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {temporaryBans}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Permanentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {permanentBans}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Banimentos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Banimentos</CardTitle>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !bans || bans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum banimento registrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Usuário</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Banido por</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bans.map((ban: any) => (
                    <TableRow key={ban.id}>
                      <TableCell className="font-mono text-xs">
                        #{ban.userId}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {ban.reason}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ban.type === "permanent" ? "destructive" : "secondary"}>
                          {ban.type === "permanent" ? (
                            <>
                              <Infinity className="h-3 w-3 mr-1" />
                              Permanente
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Temporário
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {ban.expiresAt 
                          ? new Date(ban.expiresAt).toLocaleDateString('pt-BR')
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        #{ban.bannedBy}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ban.isActive ? "destructive" : "secondary"}>
                          {ban.isActive ? "Ativo" : "Revertido"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {ban.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnban(ban.id)}
                            disabled={unbanUserMutation.isPending}
                          >
                            <Undo2 className="h-4 w-4 mr-2" />
                            Reverter
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Banir Usuário */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Banir Usuário
              </DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para banir um usuário da plataforma
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">ID do Usuário *</Label>
                <Input
                  id="userId"
                  type="number"
                  placeholder="Ex: 123"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banType">Tipo de Banimento *</Label>
                <Select value={banType} onValueChange={(value: any) => setBanType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Temporário
                      </div>
                    </SelectItem>
                    <SelectItem value="permanent">
                      <div className="flex items-center gap-2">
                        <Infinity className="h-4 w-4" />
                        Permanente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {banType === "temporary" && (
                <div className="space-y-2">
                  <Label htmlFor="expiresInDays">Duração (dias)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    min="1"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo do Banimento *</Label>
                <Textarea
                  id="reason"
                  placeholder="Descreva o motivo do banimento..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleBanUser}
                disabled={banUserMutation.isPending}
              >
                {banUserMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Banir Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
