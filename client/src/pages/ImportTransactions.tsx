import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

const importSchema = z.object({
  accountId: z.coerce.number().min(1, "Selecione uma conta"),
  fileFormat: z.enum(["csv", "ofx"]),
});

type ImportFormData = z.infer<typeof importSchema>;

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export default function ImportTransactions() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const utils = trpc.useUtils();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: accounts } = trpc.accounts.list.useQuery();
  const importMutation = trpc.transactions.create.useMutation({
    onSuccess: (result: any) => {
      setImportResult(result);
      setSelectedFile(null);
      toast.success(`${result.imported} transações importadas com sucesso!`);
    },
    onError: (error: any) => {
      // toast.error("Erro ao importar: " + error.message);
    },
  });

  const form = useForm<ImportFormData>({
    resolver: zodResolver(importSchema) as any,
    defaultValues: {
      accountId: 0,
      fileFormat: "csv",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máximo 10MB)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = (data: ImportFormData) => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Parse CSV and create transactions
      // Parse CSV and create transactions
      const lines = content.split('\n').slice(1); // Skip header
      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const [dateStr, description, category, valueStr, type] = line.split(',').map(s => s.trim());
          const amount = parseFloat(valueStr);
          
          if (!dateStr || !description || isNaN(amount)) {
            failed++;
            errors.push(`Linha inválida: ${line}`);
            continue;
          }

          try {
            importMutation.mutate({
              accountId: data.accountId,
              type: type === 'receita' ? 'income' : 'expense',
              amount: Math.abs(amount).toString(),
              description,
              date: new Date(dateStr),
            });
            imported++;
          } catch (mutateError) {
            failed++;
            errors.push(`Erro ao criar transação: ${description}`);
          }
        } catch (e) {
          failed++;
          errors.push(`Erro ao processar linha: ${line}`);
        }
      }

      setImportResult({ success: imported > 0, imported, failed, errors });
      utils.transactions.list.invalidate();
      if (imported > 0) {
        toast.success(`${imported} transações importadas!`);
      }
      if (failed > 0) {
        toast.error(`${failed} transações falharam`);
      }
      setIsImporting(false);
    };
    reader.readAsText(selectedFile);
  };

  const downloadTemplate = (format: "csv" | "ofx") => {
    let content = "";
    let filename = "";

    if (format === "csv") {
      content = `data,descricao,categoria,valor,tipo
2025-01-15,Supermercado,Alimentação,-150.00,despesa
2025-01-14,Salário,Renda,3000.00,receita
2025-01-13,Conta de Luz,Utilidades,-120.00,despesa`;
      filename = "template_transacoes.csv";
    } else {
      content = `OFXHEADER:100
OFXVERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEFORMAT:NO
NEWFILEFORMAT:YES
<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>20250115
<LANGUAGE>ENG
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20250115
<TRNAMT>-150.00
<FITID>001
<NAME>Supermercado
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
      filename = "template_transacoes.ofx";
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Importar Transações</h1>
          <p className="text-muted-foreground">
            Importe transações de seus bancos em formato CSV ou OFX
          </p>
        </div>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle>Novo Arquivo de Importação</CardTitle>
            <CardDescription>
              Selecione um arquivo CSV ou OFX para importar transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta Destino</FormLabel>
                      <Select value={field.value.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma conta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.name} ({account.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato do Arquivo</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="ofx">OFX</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Input */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.ofx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      {selectedFile ? selectedFile.name : "Clique ou arraste um arquivo"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CSV ou OFX • Máximo 10MB
                    </p>
                  </label>
                </div>

                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-3">
                    Não tem um arquivo? Baixe um template:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate("csv")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Template CSV
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate("ofx")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Template OFX
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={!selectedFile || importMutation.isPending} className="w-full">
                  {importMutation.isPending ? "Importando..." : "Importar Transações"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Import Result */}
        {importResult && (
          <Card className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <CardTitle className={importResult.success ? "text-green-900" : "text-red-900"}>
                  {importResult.success ? "Importação Concluída" : "Importação com Erros"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transações Importadas</p>
                  <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Erros</p>
                  <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-white rounded p-3 border border-red-200">
                  <p className="text-sm font-medium text-red-900 mb-2">Erros encontrados:</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    {importResult.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>• ... e mais {importResult.errors.length - 5} erros</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instruções de Importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">📋 Formato CSV:</p>
              <p>Deve conter as colunas: data, descricao, categoria, valor, tipo</p>
              <p className="text-xs mt-1">Exemplo: 2025-01-15,Supermercado,Alimentação,-150.00,despesa</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">🏦 Formato OFX:</p>
              <p>Formato padrão de bancos. Exporte diretamente do seu banco.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">✅ Dicas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use valores negativos para despesas e positivos para receitas</li>
                <li>Datas devem estar no formato YYYY-MM-DD</li>
                <li>Categorias serão categorizadas automaticamente se não informadas</li>
                <li>Transações duplicadas serão automaticamente detectadas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
