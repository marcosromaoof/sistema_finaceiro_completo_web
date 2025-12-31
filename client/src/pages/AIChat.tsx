import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Send, Bot, User, Loader2, Settings, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Eu sou o **Finança A.I**, seu assistente financeiro.\n\nEstou aqui para ajudar você a controlar seu dinheiro, gastar melhor e investir com inteligência.\n\n**Eu posso:**\n\n• Analisar seus hábitos financeiros\n• Criar recomendações personalizadas\n• Ajudar no planejamento e nas metas\n• Dar insights sobre dívidas e investimentos\n• Ensinar finanças de forma clara e prática\n\n**Como deseja começar?**",
      timestamp: new Date(),
      model: "llama-3.3-70b-versatile",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "mixtral-8x7b-32768">("llama-3.3-70b-versatile");
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessageMutation = trpc.aiChat.sendMessage.useMutation();
  const { data: models } = trpc.aiChat.getModels.useQuery();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: input,
        model: selectedModel,
      });

      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
          model: response.model,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error(response.message || "Erro ao processar mensagem");
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Erro ao enviar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getModelBadge = (model?: string) => {
    if (!model) return null;
    
    if (model.includes("3.3")) {
      return <Badge variant="default" className="ml-2">Llama 3.3 70B</Badge>;
    }
    if (model.includes("70b")) {
      return <Badge variant="default" className="ml-2">Llama 3.1 70B</Badge>;
    }
    if (model.includes("8b")) {
      return <Badge variant="secondary" className="ml-2">Llama 3.1 8B</Badge>;
    }
    if (model.includes("mixtral")) {
      return <Badge variant="outline" className="ml-2">Mixtral 8x7B</Badge>;
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="container py-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              Finança A.I
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Seu assistente financeiro inteligente
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Configurações do Chat</CardTitle>
              <CardDescription>
                Escolha o modelo de IA. A API Key é configurada pelo administrador no Painel Admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo de IA</Label>
                <Select
                  value={selectedModel}
                  onValueChange={(value: any) => setSelectedModel(value)}
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama-3.3-70b-versatile">
                      Llama 3.3 70B (Recomendado)
                    </SelectItem>
                    <SelectItem value="llama-3.1-8b-instant">
                      Llama 3.1 8B (Rápido)
                    </SelectItem>
                    <SelectItem value="mixtral-8x7b-32768">
                      Mixtral 8x7B (Balanceado)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedModel === "llama-3.3-70b-versatile" &&
                    "Modelo mais avançado - Melhor para análises complexas e raciocínio"}
                  {selectedModel === "llama-3.1-8b-instant" &&
                    "Respostas mais rápidas para consultas simples"}
                  {selectedModel === "mixtral-8x7b-32768" &&
                    "Bom equilíbrio entre velocidade e qualidade"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Streamdown>{message.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {message.role === "assistant" && getModelBadge(message.model)}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta sobre finanças..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Dica: Pergunte sobre seus gastos, metas, investimentos ou peça análises personalizadas
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
