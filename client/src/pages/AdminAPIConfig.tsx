import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Key, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface APIConfig {
  key: string;
  value: string;
  description: string;
  placeholder: string;
  docsUrl: string;
  testAvailable: boolean;
}

const API_CONFIGS: APIConfig[] = [
  {
    key: "groq_api_key",
    value: "",
    description: "API Key do Groq para Chat IA com Llama 3.1",
    placeholder: "gsk_...",
    docsUrl: "https://console.groq.com",
    testAvailable: true,
  },
  {
    key: "gemini_api_key",
    value: "",
    description: "API Key do Google Gemini para análises avançadas",
    placeholder: "AIza...",
    docsUrl: "https://makersuite.google.com/app/apikey",
    testAvailable: false,
  },
  {
    key: "tavily_api_key",
    value: "",
    description: "API Key do Tavily para busca web inteligente",
    placeholder: "tvly-...",
    docsUrl: "https://tavily.com",
    testAvailable: true,
  },
];

export default function AdminAPIConfig() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  const { data: apiSettings, isLoading: isLoadingSettings } = trpc.apiSettings.getAll.useQuery();
  const upsertMutation = trpc.apiSettings.upsert.useMutation();
  const testGroqMutation = trpc.aiChat.testConnection.useMutation();
  const testTavilyMutation = trpc.tavilySearch.testConnection.useMutation();

  useEffect(() => {
    if (apiSettings) {
      const configMap: Record<string, string> = {};
      apiSettings.forEach((setting) => {
        configMap[setting.key] = setting.value;
      });
      setConfigs(configMap);
    }
  }, [apiSettings]);

  const handleSave = async (apiKey: string, description: string) => {
    const value = configs[apiKey];
    
    if (!value || value.trim() === "") {
      toast.error("Por favor, insira uma API Key válida");
      return;
    }

    setLoading((prev) => ({ ...prev, [apiKey]: true }));

    try {
      await upsertMutation.mutateAsync({
        key: apiKey,
        value: value.trim(),
        description,
      });

      toast.success("API Key salva com sucesso!");
      setTestResults((prev) => ({ ...prev, [apiKey]: null }));
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar API Key");
    } finally {
      setLoading((prev) => ({ ...prev, [apiKey]: false }));
    }
  };

  const handleTest = async (apiKey: string) => {
    const value = configs[apiKey];
    
    if (!value || value.trim() === "") {
      toast.error("Por favor, insira uma API Key para testar");
      return;
    }

    setLoading((prev) => ({ ...prev, [`test_${apiKey}`]: true }));
    setTestResults((prev) => ({ ...prev, [apiKey]: null }));

    try {
      let result;
      
      if (apiKey === "groq_api_key") {
        result = await testGroqMutation.mutateAsync({ apiKey: value.trim() });
      } else if (apiKey === "tavily_api_key") {
        result = await testTavilyMutation.mutateAsync({ apiKey: value.trim() });
      } else {
        toast.error("Teste não disponível para esta API");
        return;
      }

      if (result.success) {
        setTestResults((prev) => ({ ...prev, [apiKey]: true }));
        toast.success("Conex\u00e3o testada com sucesso!");
      } else {
        setTestResults((prev) => ({ ...prev, [apiKey]: false }));
        toast.error("Falha no teste de conex\u00e3o");
      }
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, [apiKey]: false }));
      toast.error(error.message || "Erro ao testar conexão");
    } finally {
      setLoading((prev) => ({ ...prev, [`test_${apiKey}`]: false }));
    }
  };

  const handleInputChange = (apiKey: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [apiKey]: value }));
    setTestResults((prev) => ({ ...prev, [apiKey]: null }));
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações de API</h1>
        <p className="text-muted-foreground">
          Configure as chaves de API para integrar serviços de IA e busca web ao Organizai
        </p>
      </div>

      <div className="space-y-6">
        {API_CONFIGS.map((config) => {
          const currentValue = configs[config.key] || "";
          const isLoading = loading[config.key];
          const isTestLoading = loading[`test_${config.key}`];
          const testResult = testResults[config.key];
          const hasValue = currentValue && currentValue !== "CONFIGURE_NO_PAINEL_ADMIN";

          return (
            <Card key={config.key}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {config.key.replace(/_/g, " ").toUpperCase()}
                      {hasValue && (
                        <Badge variant="outline" className="ml-2">
                          Configurada
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {config.description}
                    </CardDescription>
                  </div>
                  <a
                    href={config.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    Obter chave
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={config.key}>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id={config.key}
                      type="password"
                      placeholder={config.placeholder}
                      value={currentValue}
                      onChange={(e) => handleInputChange(config.key, e.target.value)}
                      className="flex-1"
                    />
                    {testResult === true && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                    {testResult === false && (
                      <div className="flex items-center text-red-600">
                        <XCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(config.key, config.description)}
                    disabled={isLoading || !currentValue}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>

                  {config.testAvailable && (
                    <Button
                      variant="outline"
                      onClick={() => handleTest(config.key)}
                      disabled={isTestLoading || !currentValue}
                    >
                      {isTestLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Testar Conexão
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Nunca compartilhe suas API Keys publicamente</p>
          <p>• Revogue e regenere chaves se suspeitar de comprometimento</p>
          <p>• Monitore o uso das APIs nos respectivos dashboards</p>
          <p>• Configure limites de uso para evitar cobranças inesperadas</p>
        </CardContent>
      </Card>
    </div>
  );
}
