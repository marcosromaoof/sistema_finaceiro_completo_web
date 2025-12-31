import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Send, Bot, User, Loader2, Sparkles, Check, X } from "lucide-react";
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
  action?: ActionData;
}

interface ActionData {
  type: "create_transaction" | "create_goal" | "create_budget";
  data: any;
  confirmed?: boolean;
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
  const selectedModel = "llama-3.3-70b-versatile";
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessageMutation = trpc.aiChat.sendMessage.useMutation();
  const createTransactionMutation = trpc.transactions.create.useMutation();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const utils = trpc.useUtils();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

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

        // Check if response contains action intent
        const actionData = parseActionIntent(input, response.message);
        if (actionData) {
          assistantMessage.action = actionData;
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Erro ao processar sua mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const parseActionIntent = (userInput: string, aiResponse: string): ActionData | undefined => {
    const lowerInput = userInput.toLowerCase();
    
    // Detect transaction creation intent
    const transactionKeywords = ["gastei", "comprei", "paguei", "despesa", "gasto"];
    const hasTransactionIntent = transactionKeywords.some(keyword => lowerInput.includes(keyword));
    
    if (hasTransactionIntent) {
      // Extract amount
      const amountMatch = userInput.match(/r\$?\s*(\d+(?:[.,]\d{2})?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
      
      // Extract description
      const descriptionMatch = userInput.match(/(?:gastei|comprei|paguei)\s+(?:r\$?\s*\d+(?:[.,]\d{2})?\s+)?(?:no|na|em|com|para)?\s+(.+)/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : "Despesa";
      
      if (amount > 0) {
        return {
          type: "create_transaction",
          data: {
            amount: -amount, // Negative for expense
            description: description,
            date: new Date(),
          },
          confirmed: false,
        };
      }
    }
    
    return undefined;
  };

  const handleConfirmAction = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.action) return;

    try {
      if (message.action.type === "create_transaction") {
        // Get user's first active account
        const defaultAccount = accounts?.find(acc => acc.isActive);
        if (!defaultAccount) {
          toast.error("Você precisa criar uma conta primeiro");
          return;
        }

        await createTransactionMutation.mutateAsync({
          accountId: defaultAccount.id,
          amount: message.action.data.amount.toString(),
          description: message.action.data.description,
          date: message.action.data.date,
          type: message.action.data.amount < 0 ? "expense" : "income",
        });

        // Invalidate queries to refresh data
        utils.transactions.list.invalidate();
        utils.accounts.list.invalidate();

        // Update message to show confirmed
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { ...m, action: { ...m.action!, confirmed: true } }
            : m
        ));

        toast.success("Transação criada com sucesso!");
      }
    } catch (error: any) {
      console.error("Error confirming action:", error);
      toast.error("Erro ao criar transação");
    }
  };

  const handleCancelAction = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, action: undefined }
        : m
    ));
    toast.info("Ação cancelada");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getModelBadge = (model?: string) => {
    if (!model) return null;
    return <Badge variant="default" className="ml-2">Finança A.I</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            Finança A.I
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Seu assistente financeiro inteligente
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-lg">
          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Assistant Avatar */}
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col gap-2 ${message.role === "user" ? "items-end" : "items-start"} max-w-[75%]`}>
                    <div
                      className={`rounded-2xl px-5 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-800 shadow-sm"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* Action Card */}
                    {message.action && !message.action.confirmed && (
                      <Card className="w-full border-2 border-blue-200 dark:border-blue-800 shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-sm mb-1">💰 Criar Transação</p>
                              <p className="text-xs text-muted-foreground">Confirme os dados abaixo:</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Valor:</span>
                              <span className="font-semibold text-red-600">
                                R$ {Math.abs(message.action.data.amount).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Descrição:</span>
                              <span className="font-medium">{message.action.data.description}</span>
                            </div>

                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleConfirmAction(message.id)}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelAction(message.id)}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {message.action && message.action.confirmed && (
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <Check className="h-3 w-3" />
                        <span>Transação criada com sucesso</span>
                      </div>
                    )}

                    {/* Timestamp and Badge */}
                    <div className="flex items-center gap-2 px-2">
                      <p className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {message.role === "assistant" && getModelBadge(message.model)}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-md">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-4 justify-start animate-in fade-in duration-300">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t bg-gray-50 dark:bg-gray-900 p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Digite sua mensagem... (ex: gastei R$ 50 no mercado)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 h-12 rounded-full px-6 border-2 focus:border-blue-500 transition-colors"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              💡 Experimente: "gastei R$ 50 no mercado" • "quero economizar R$ 5000" • "analise meus gastos"
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
