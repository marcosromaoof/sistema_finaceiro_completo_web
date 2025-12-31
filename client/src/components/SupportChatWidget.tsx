import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou o assistente do Organizai. Como posso ajudar você hoje?"
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = trpc.aiChat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message
      }]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, {
      role: "user",
      content: userMessage
    }]);

    // Context sobre o sistema para a IA
    const systemContext = `
Você é o assistente de suporte do Organizai, uma plataforma completa de gestão financeira pessoal.

FUNCIONALIDADES PRINCIPAIS DO ORGANIZAI:

1. DASHBOARD INTELIGENTE
   - Visão consolidada do patrimônio líquido
   - Gráficos de receitas vs despesas
   - Saldo total e por conta
   - Próximas contas a vencer
   - Metas em andamento
   - Alertas e notificações

2. CONTAS FINANCEIRAS
   - Múltiplos tipos: corrente, poupança, cartão de crédito, investimentos
   - Sincronização manual de saldo
   - Suporte a múltiplas moedas (BRL, USD, EUR)
   - Histórico completo

3. TRANSAÇÕES
   - CRUD completo de receitas e despesas
   - Importação de CSV/OFX
   - Categorização automática com IA
   - Filtros por período, conta e categoria
   - Histórico detalhado

4. ORÇAMENTOS
   - Orçamentos mensais por categoria
   - Alertas quando ultrapassar limites
   - Acompanhamento em tempo real
   - Visualização de progresso

5. METAS FINANCEIRAS
   - Metas de curto, médio e longo prazo
   - Calculadora de contribuição mensal
   - Acompanhamento visual do progresso
   - Notificações de marcos atingidos

6. GESTÃO DE DÍVIDAS
   - Registro de dívidas com detalhes
   - Planos de pagamento (snowball/avalanche)
   - Projeção de quitação
   - Acompanhamento de juros

7. INVESTIMENTOS
   - Cadastro por tipo (ações, fundos, renda fixa)
   - Performance de carteiras
   - Alocação de ativos
   - Cálculo de rentabilidade
   - Comparação com benchmarks

8. APOSENTADORIA
   - Calculadora de aposentadoria
   - Simulações de cenários
   - Projeção de renda futura
   - Recomendações personalizadas

9. RELATÓRIOS
   - Relatórios detalhados por categoria e período
   - Exportação para PDF/Excel/CSV
   - Análise de gastos recorrentes
   - Identificação de assinaturas

10. ASSISTENTE COM IA
    - Chat inteligente com contexto financeiro
    - Análises personalizadas
    - Recomendações baseadas em dados
    - Busca na web para informações atualizadas

11. COLABORAÇÃO FAMILIAR
    - Compartilhamento de orçamentos e metas
    - Controle de permissões
    - Dashboard familiar consolidado

12. SEGURANÇA
    - Autenticação 2FA
    - Login social (Google, Apple, Facebook)
    - Criptografia de dados
    - Backup automático

PLANOS:
- FREE: R$ 0/mês - Até 3 contas, recursos básicos
- PREMIUM: R$ 99/mês - Contas ilimitadas, IA, investimentos, relatórios avançados
- FAMILY: R$ 199/mês - Tudo do Premium + 5 membros, orçamento familiar

DIFERENCIAIS:
- Integração com IA (Groq, Gemini, OpenAI)
- Busca na web em tempo real (Tavily)
- Automações via n8n e WhatsApp
- Interface moderna e intuitiva
- Suporte 24/7

Responda de forma clara, objetiva e amigável. Se não souber algo específico, seja honesto e ofereça alternativas.
`;

    sendMessage.mutate({
      message: `${systemContext}\n\nUsuário: ${userMessage}`,
      model: "llama-3.3-70b-versatile"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <div className="font-semibold">Assistente Organizai</div>
                <div className="text-xs opacity-90">Online • Responde em segundos</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-4 w-4" />
                      <span className="text-xs font-semibold">Assistente</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessage.isPending}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by IA • Respostas instantâneas
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
