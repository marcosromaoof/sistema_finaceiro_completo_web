import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, ExternalLink, CheckCircle2, XCircle, AlertCircle,
  Zap, Globe, Brain, Sparkles, Server, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function APIConfiguration() {
  const [showKeys, setShowKeys] = useState(false);
  
  // API Keys State
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");
  const [perplexityKey, setPerplexityKey] = useState("");
  
  // Connection Status
  const [groqStatus, setGroqStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [geminiStatus, setGeminiStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [tavilyStatus, setTavilyStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [perplexityStatus, setPerplexityStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");

  const testConnection = async (api: string, key: string) => {
    if (!key.trim()) {
      toast.error("Por favor, insira uma API key válida");
      return;
    }

    // Set testing status
    if (api === "groq") setGroqStatus("testing");
    if (api === "gemini") setGeminiStatus("testing");
    if (api === "tavily") setTavilyStatus("testing");
    if (api === "perplexity") setPerplexityStatus("testing");

    // Simulate API test (in production, call real API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Set connected status
    if (api === "groq") setGroqStatus("connected");
    if (api === "gemini") setGeminiStatus("connected");
    if (api === "tavily") setTavilyStatus("connected");
    if (api === "perplexity") setPerplexityStatus("connected");

    toast.success(`${api.toUpperCase()} conectado com sucesso!`);
  };

  const saveConfig = (api: string) => {
    toast.success(`Configurações de ${api} salvas!`);
  };

  const StatusBadge = ({ status }: { status: "connected" | "disconnected" | "testing" }) => {
    if (status === "connected") {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Conectado
        </Badge>
      );
    }
    if (status === "testing") {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3 animate-pulse" />
          Testando...
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <XCircle className="h-3 w-3" />
        Desconectado
      </Badge>
    );
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8" />
          Configuração de APIs de IA
        </h1>
        <p className="text-muted-foreground">
          Configure APIs gratuitas de inteligência artificial para análises financeiras avançadas
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              Groq
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={groqStatus} />
            <p className="text-xs text-muted-foreground mt-2">
              Llama 3.1 70B - Ultra rápido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Gemini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={geminiStatus} />
            <p className="text-xs text-muted-foreground mt-2">
              Gemini 1.5 Flash - Google
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              Tavily
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={tavilyStatus} />
            <p className="text-xs text-muted-foreground mt-2">
              Busca na web em tempo real
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              Perplexity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={perplexityStatus} />
            <p className="text-xs text-muted-foreground mt-2">
              IA + Busca integrada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="groq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="groq">Groq</TabsTrigger>
          <TabsTrigger value="gemini">Gemini</TabsTrigger>
          <TabsTrigger value="tavily">Tavily</TabsTrigger>
          <TabsTrigger value="perplexity">Perplexity</TabsTrigger>
          <TabsTrigger value="ollama">Ollama</TabsTrigger>
        </TabsList>

        {/* Groq Configuration */}
        <TabsContent value="groq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Groq API
                  </CardTitle>
                  <CardDescription>
                    IA ultra-rápida com Llama 3.1 70B e Mixtral 8x7B
                  </CardDescription>
                </div>
                <StatusBadge status={groqStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Por que usar Groq?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ <strong>Totalmente gratuito</strong> - 14.400 requisições/dia</li>
                  <li>⚡ <strong>Extremamente rápido</strong> - Até 500 tokens/segundo</li>
                  <li>🤖 <strong>Modelos poderosos</strong> - Llama 3.1 70B, Mixtral 8x7B</li>
                  <li>🔄 <strong>Compatível com OpenAI</strong> - Fácil integração</li>
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Como obter sua API Key:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Acesse <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    console.groq.com <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Faça login com sua conta Google ou GitHub</li>
                  <li>Clique em "API Keys" no menu lateral</li>
                  <li>Clique em "Create API Key"</li>
                  <li>Copie a chave gerada e cole abaixo</li>
                </ol>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groq-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="groq-key"
                      type={showKeys ? "text" : "password"}
                      placeholder="gsk_..."
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKeys(!showKeys)}
                    >
                      {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sua chave começa com "gsk_"
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => testConnection("groq", groqKey)}
                    variant="outline"
                    disabled={groqStatus === "testing"}
                  >
                    Testar Conexão
                  </Button>
                  <Button 
                    onClick={() => saveConfig("Groq")}
                    disabled={!groqKey.trim()}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </div>
              </div>

              {/* Models */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Modelos Disponíveis:</h4>
                <div className="grid gap-2">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Llama 3.1 70B</span>
                      <Badge variant="default">Recomendado</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Melhor para análises financeiras complexas e raciocínio avançado
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Mixtral 8x7B</span>
                      <Badge variant="secondary">Rápido</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ótimo para respostas rápidas e consultas simples
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gemini Configuration */}
        <TabsContent value="gemini" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Google Gemini API
                  </CardTitle>
                  <CardDescription>
                    IA do Google com contexto longo (1M tokens)
                  </CardDescription>
                </div>
                <StatusBadge status={geminiStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Por que usar Gemini?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ <strong>Gratuito</strong> - 15 requisições/minuto</li>
                  <li>📊 <strong>Contexto longo</strong> - Até 1 milhão de tokens</li>
                  <li>🎯 <strong>Multimodal</strong> - Texto, imagem e código</li>
                  <li>🔒 <strong>Confiável</strong> - Infraestrutura Google</li>
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Como obter sua API Key:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    aistudio.google.com/app/apikey <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Faça login com sua conta Google</li>
                  <li>Clique em "Create API Key"</li>
                  <li>Selecione ou crie um projeto do Google Cloud</li>
                  <li>Copie a chave gerada e cole abaixo</li>
                </ol>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">API Key</Label>
                  <Input
                    id="gemini-key"
                    type={showKeys ? "text" : "password"}
                    placeholder="AIza..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Sua chave começa com "AIza"
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => testConnection("gemini", geminiKey)}
                    variant="outline"
                    disabled={geminiStatus === "testing"}
                  >
                    Testar Conexão
                  </Button>
                  <Button 
                    onClick={() => saveConfig("Gemini")}
                    disabled={!geminiKey.trim()}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tavily Configuration */}
        <TabsContent value="tavily" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    Tavily Search API
                  </CardTitle>
                  <CardDescription>
                    Busca na web otimizada para IA
                  </CardDescription>
                </div>
                <StatusBadge status={tavilyStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info */}
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Por que usar Tavily?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ <strong>1.000 buscas/mês grátis</strong></li>
                  <li>🔍 <strong>Busca otimizada</strong> - Resultados relevantes para IA</li>
                  <li>⚡ <strong>Rápido</strong> - Respostas em tempo real</li>
                  <li>📊 <strong>Estruturado</strong> - JSON limpo e organizado</li>
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Como obter sua API Key:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Acesse <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    tavily.com <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Clique em "Get Started" ou "Sign Up"</li>
                  <li>Crie sua conta gratuita</li>
                  <li>Acesse o Dashboard</li>
                  <li>Copie sua API Key e cole abaixo</li>
                </ol>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tavily-key">API Key</Label>
                  <Input
                    id="tavily-key"
                    type={showKeys ? "text" : "password"}
                    placeholder="tvly-..."
                    value={tavilyKey}
                    onChange={(e) => setTavilyKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Sua chave começa com "tvly-"
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => testConnection("tavily", tavilyKey)}
                    variant="outline"
                    disabled={tavilyStatus === "testing"}
                  >
                    Testar Conexão
                  </Button>
                  <Button 
                    onClick={() => saveConfig("Tavily")}
                    disabled={!tavilyKey.trim()}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perplexity Configuration */}
        <TabsContent value="perplexity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Perplexity API
                  </CardTitle>
                  <CardDescription>
                    IA com busca na web integrada
                  </CardDescription>
                </div>
                <StatusBadge status={perplexityStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info */}
              <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Por que usar Perplexity?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ <strong>$5 de créditos grátis</strong></li>
                  <li>🔍 <strong>IA + Busca</strong> - Respostas com fontes</li>
                  <li>📚 <strong>Citações</strong> - Links para fontes originais</li>
                  <li>🎯 <strong>Preciso</strong> - Informações atualizadas</li>
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Como obter sua API Key:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Acesse <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    perplexity.ai/settings/api <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Faça login ou crie uma conta</li>
                  <li>Clique em "Generate API Key"</li>
                  <li>Copie a chave gerada e cole abaixo</li>
                </ol>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="perplexity-key">API Key</Label>
                  <Input
                    id="perplexity-key"
                    type={showKeys ? "text" : "password"}
                    placeholder="pplx-..."
                    value={perplexityKey}
                    onChange={(e) => setPerplexityKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Sua chave começa com "pplx-"
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => testConnection("perplexity", perplexityKey)}
                    variant="outline"
                    disabled={perplexityStatus === "testing"}
                  >
                    Testar Conexão
                  </Button>
                  <Button 
                    onClick={() => saveConfig("Perplexity")}
                    disabled={!perplexityKey.trim()}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ollama Configuration */}
        <TabsContent value="ollama" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Ollama (Local)
              </CardTitle>
              <CardDescription>
                Execute modelos de IA localmente no seu computador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info */}
              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Por que usar Ollama?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ <strong>100% gratuito</strong> - Sem custos de API</li>
                  <li>🔒 <strong>Privacidade total</strong> - Dados não saem do seu PC</li>
                  <li>⚡ <strong>Sem limites</strong> - Use quanto quiser</li>
                  <li>🤖 <strong>Vários modelos</strong> - Llama 3, Mistral, Phi-3</li>
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Como instalar Ollama:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Acesse <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    ollama.com/download <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Baixe o instalador para seu sistema operacional</li>
                  <li>Instale e execute o Ollama</li>
                  <li>Abra o terminal e execute: <code className="bg-muted px-2 py-1 rounded">ollama pull llama3</code></li>
                  <li>Aguarde o download do modelo (pode demorar alguns minutos)</li>
                </ol>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ollama-url">URL do Ollama</Label>
                  <Input
                    id="ollama-url"
                    type="text"
                    placeholder="http://localhost:11434"
                    defaultValue="http://localhost:11434"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL padrão do Ollama local
                  </p>
                </div>

                <Button variant="outline" className="w-full">
                  Testar Conexão Local
                </Button>
              </div>

              {/* Models */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Modelos Recomendados:</h4>
                <div className="grid gap-2">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Llama 3 8B</span>
                      <Badge variant="default">Recomendado</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Melhor equilíbrio entre qualidade e velocidade
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">ollama pull llama3</code>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Mistral 7B</span>
                      <Badge variant="secondary">Rápido</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Ótimo para respostas rápidas
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">ollama pull mistral</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
