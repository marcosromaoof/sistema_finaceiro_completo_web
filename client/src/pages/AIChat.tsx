import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! 👋 Sou seu assistente financeiro com IA. Posso ajudá-lo com:\n\n- **Análise de gastos**: Veja onde seu dinheiro está indo\n- **Recomendações**: Dicas personalizadas para economizar\n- **Planejamento**: Ajude a atingir suas metas financeiras\n- **Educação**: Aprenda sobre finanças pessoais\n\nComo posso ajudá-lo hoje?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: userTransactions } = trpc.transactions.list.useQuery({} as any);
  const { data: userAccounts } = trpc.accounts.list.useQuery({} as any);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Simulate AI response with financial context
      const context = {
        totalAccounts: userAccounts?.length || 0,
        totalTransactions: userTransactions?.length || 0,
        recentTransactions: userTransactions?.slice(0, 5) || [],
      };

      // Generate AI response based on user input
      const aiResponse = generateAIResponse(input, context);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Erro ao processar sua mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (input: string, context: any): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("saldo") || lowerInput.includes("quanto tenho")) {
      return `Com base em seus dados:\n\n- **Contas ativas**: ${context.totalAccounts}\n- **Transações registradas**: ${context.totalTransactions}\n\nPara ver seu saldo detalhado, acesse a página de Contas ou Dashboard.`;
    }

    if (lowerInput.includes("gasto") || lowerInput.includes("despesa")) {
      return `Analisando seus gastos:\n\n📊 Você tem ${context.totalTransactions} transações registradas.\n\n**Dicas para reduzir gastos:**\n1. Revise assinaturas recorrentes\n2. Defina orçamentos por categoria\n3. Acompanhe gastos diários\n4. Use a análise de recorrentes para encontrar oportunidades de economia`;
    }

    if (lowerInput.includes("meta") || lowerInput.includes("objetivo")) {
      return `Ótimo! Definir metas é fundamental para o sucesso financeiro.\n\n**Como criar uma meta eficaz:**\n1. Seja específico (ex: "Economizar R$ 5.000")\n2. Defina um prazo realista\n3. Calcule quanto precisa poupar por mês\n4. Acompanhe o progresso regularmente\n\nAcesse a página de Metas para criar sua primeira meta!`;
    }

    if (lowerInput.includes("investimento") || lowerInput.includes("investir")) {
      return `Investir é uma ótima forma de fazer seu dinheiro crescer!\n\n**Tipos de investimentos:**\n- **Renda Fixa**: CDB, Tesouro Direto (mais seguro)\n- **Renda Variável**: Ações, Fundos (maior potencial)\n- **Diversificação**: Combine diferentes tipos\n\nComece pequeno e vá aumentando conforme aprende. Acesse a seção de Investimentos para registrar seus aportes!`;
    }

    if (lowerInput.includes("dívida") || lowerInput.includes("empréstimo")) {
      return `Gerenciar dívidas é importante para sua saúde financeira.\n\n**Estratégias para quitar dívidas:**\n1. **Método Snowball**: Pague as menores primeiro (psicológico)\n2. **Método Avalanche**: Pague as com maior juros (financeiro)\n3. **Consolidação**: Negocie uma única dívida menor\n\nRegistre suas dívidas na seção de Dívidas e escolha a estratégia ideal!`;
    }

    if (lowerInput.includes("relatório") || lowerInput.includes("exportar")) {
      return `Você pode gerar relatórios completos de suas finanças!\n\n**Tipos de relatórios disponíveis:**\n- Resumo mensal\n- Análise por categoria\n- Relatório anual\n- Exportação em CSV, Excel ou PDF\n\nAcesse a página de Relatórios para gerar seus documentos.`;
    }

    return `Entendi sua pergunta sobre "${input}".\n\n**Recursos disponíveis:**\n- 📊 Dashboard para visão geral\n- 💰 Gestão de contas e transações\n- 📈 Análise de investimentos\n- 🎯 Planejamento de metas\n- 📋 Relatórios detalhados\n\nComo posso ajudá-lo com mais detalhes?`;
  };

  const suggestedQuestions = [
    "Qual é meu saldo total?",
    "Como reduzir meus gastos?",
    "Como criar uma meta financeira?",
    "Como investir melhor?",
    "Como gerenciar minhas dívidas?",
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            Assistente Financeiro com IA
          </h1>
          <p className="text-muted-foreground">
            Faça perguntas sobre suas finanças e receba recomendações personalizadas
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-96 md:h-[500px] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Streamdown>{message.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-muted px-4 py-2 rounded-lg rounded-bl-none">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Faça uma pergunta sobre suas finanças..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Perguntas sugeridas:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput(question);
                      }}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💡 Dica</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              O assistente pode ajudá-lo com análise de gastos, recomendações de economia e planejamento financeiro.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔒 Privacidade</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Seus dados financeiros são criptografados e nunca são compartilhados com terceiros.
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
