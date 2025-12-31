# 🗺️ Plano de Implementação - Funcionalidades Pendentes

**Projeto:** Organizai v2.0.0 → v3.0.0  
**Total de Funcionalidades:** 29 pendentes  
**Prazo Estimado:** 60 dias (4 sprints de 15 dias)  
**Data de Criação:** 31 de Dezembro de 2025

---

## 📋 Índice

1. [Sprint 10 - Análises Avançadas e Investimentos](#sprint-10)
2. [Sprint 11 - Agregação Bancária e WhatsApp](#sprint-11)
3. [Sprint 12 - IA Avançada e Aprendizado](#sprint-12)
4. [Sprint 13 - Compliance e Auditoria](#sprint-13)
5. [Backlog - Baixa Prioridade](#backlog)
6. [Estimativas e Recursos](#estimativas)

---

## 🎯 Sprint 10 - Análises Avançadas e Investimentos
**Duração:** 15 dias  
**Prioridade:** 🔴 Alta  
**Funcionalidades:** 5

### 1. Benchmarks de Investimentos (5 dias)

**Objetivo:** Permitir comparação de performance de investimentos com índices de mercado

**Tarefas Backend:**
- [ ] Criar tabela `investment_benchmarks` no schema
  - Campos: id, name, symbol, type (CDI, IBOVESPA, SP500)
- [ ] Criar procedure `getBenchmarkData(symbol, startDate, endDate)`
- [ ] Integrar com API de cotações (Alpha Vantage ou Yahoo Finance)
- [ ] Criar procedure `compareInvestmentWithBenchmark(investmentId, benchmarkSymbol)`
- [ ] Implementar cálculo de performance relativa
- [ ] Criar testes unitários (5 testes)

**Tarefas Frontend:**
- [ ] Criar componente `BenchmarkComparison.tsx`
- [ ] Gráfico de linhas comparativo (Recharts)
- [ ] Seletor de benchmark (CDI, Ibovespa, S&P500)
- [ ] Tabela de performance relativa
- [ ] Indicadores visuais (melhor/pior que benchmark)
- [ ] Integrar na página de Investimentos

**APIs Necessárias:**
- Alpha Vantage (gratuita: 5 calls/min, 500/dia)
- Alternativa: Yahoo Finance (sem limite, menos confiável)

**Complexidade:** Média  
**Risco:** Baixo

---

### 2. Registro de Dividendos e Juros (3 dias)

**Objetivo:** Permitir registro e acompanhamento de proventos recebidos

**Tarefas Backend:**
- [ ] Criar tabela `dividends` no schema
  - Campos: id, investmentId, type (dividend/interest), amount, date, description
- [ ] Criar procedures CRUD: `createDividend`, `getDividends`, `updateDividend`, `deleteDividend`
- [ ] Criar procedure `getDividendHistory(investmentId, period)`
- [ ] Criar procedure `getPassiveIncomeProjection(investmentId)`
- [ ] Adicionar campo `totalDividends` em investments
- [ ] Criar testes unitários (6 testes)

**Tarefas Frontend:**
- [ ] Criar página `Dividends.tsx`
- [ ] Formulário de registro de dividendo
- [ ] Tabela de histórico de dividendos
- [ ] Gráfico de proventos ao longo do tempo
- [ ] Card de renda passiva total
- [ ] Projeção de renda passiva futura
- [ ] Adicionar link no menu de Investimentos

**Complexidade:** Baixa  
**Risco:** Baixo

---

### 3. Dashboard de Análise de Hábitos de Gastos (4 dias)

**Objetivo:** Fornecer insights comportamentais sobre padrões de consumo

**Tarefas Backend:**
- [ ] Criar procedure `analyzeSpendingHabits(userId, period)`
  - Identificar categorias com maior crescimento
  - Detectar gastos atípicos (>2x desvio padrão)
  - Identificar dias/horários de maior gasto
  - Calcular ticket médio por categoria
- [ ] Criar procedure `getSpendingPatterns(userId)`
  - Padrões semanais/mensais
  - Sazonalidade
- [ ] Criar procedure `getAnomalies(userId, period)`
- [ ] Criar testes unitários (5 testes)

**Tarefas Frontend:**
- [ ] Criar página `SpendingAnalysis.tsx`
- [ ] Card de categorias em crescimento
- [ ] Gráfico de gastos atípicos destacados
- [ ] Heatmap de gastos por dia da semana/hora
- [ ] Card de ticket médio por categoria
- [ ] Gráfico de sazonalidade
- [ ] Alertas de anomalias
- [ ] Adicionar link no menu Relatórios

**Complexidade:** Alta  
**Risco:** Médio (algoritmos de detecção)

---

### 4. Gráficos de Tendência Temporal (2 dias)

**Objetivo:** Visualizar evolução de gastos/receitas ao longo do tempo

**Tarefas Backend:**
- [ ] Criar procedure `getTrendData(userId, category, period)`
  - Retornar série temporal
  - Calcular média móvel
  - Calcular tendência (regressão linear simples)
- [ ] Criar testes unitários (3 testes)

**Tarefas Frontend:**
- [ ] Adicionar gráfico de tendência no Dashboard
- [ ] Linha de tendência (dotted)
- [ ] Média móvel (7 dias)
- [ ] Indicador de direção (subindo/descendo)
- [ ] Tooltip com detalhes
- [ ] Filtro de período (7d, 30d, 90d, 1y)

**Complexidade:** Baixa  
**Risco:** Baixo

---

### 5. Comparação com Mês Anterior (1 dia)

**Objetivo:** Mostrar variação percentual em relação ao período anterior

**Tarefas Backend:**
- [ ] Criar procedure `compareWithPreviousPeriod(userId, metric, period)`
  - Retornar valor atual, anterior e % de variação
- [ ] Criar testes unitários (2 testes)

**Tarefas Frontend:**
- [ ] Adicionar badges de comparação nos cards do Dashboard
- [ ] Ícone de seta (up/down)
- [ ] Cor verde/vermelho conforme contexto
- [ ] Tooltip com detalhes da comparação

**Complexidade:** Muito Baixa  
**Risco:** Baixo

---

## 🔗 Sprint 11 - Agregação Bancária e WhatsApp
**Duração:** 15 dias  
**Prioridade:** 🔴 Alta  
**Funcionalidades:** 6

### 6. Integração com Open Banking (8 dias)

**Objetivo:** Sincronização automática de transações bancárias

**Opções de API:**
1. **Pluggy** (Recomendado)
   - Suporte a 200+ instituições brasileiras
   - R$ 0,50 por conexão ativa/mês
   - Sandbox gratuito
   
2. **Belvo**
   - Cobertura América Latina
   - US$ 0,10 por item sincronizado
   
3. **Plaid** (Internacional)
   - Não cobre bancos brasileiros

**Decisão:** Usar Pluggy

**Tarefas Backend:**
- [ ] Criar conta no Pluggy e obter API keys
- [ ] Instalar SDK: `npm install pluggy-sdk`
- [ ] Criar tabela `bank_connections` no schema
  - Campos: id, userId, itemId (Pluggy), status, lastSync, institution
- [ ] Criar procedure `createBankConnection(userId, itemId)`
- [ ] Criar procedure `syncTransactions(connectionId)`
  - Buscar transações do Pluggy
  - Mapear para formato interno
  - Evitar duplicatas (comparar por hash)
  - Categorizar automaticamente com IA
- [ ] Criar procedure `getBankConnections(userId)`
- [ ] Criar procedure `deleteBankConnection(connectionId)`
- [ ] Criar webhook endpoint `/api/webhooks/pluggy`
  - Processar eventos: item.updated, transactions.created
- [ ] Criar job de sincronização diária (cron)
- [ ] Criar testes unitários (8 testes)

**Tarefas Frontend:**
- [ ] Criar página `BankConnections.tsx`
- [ ] Integrar Pluggy Connect Widget
- [ ] Listar conexões ativas
- [ ] Botão de sincronização manual
- [ ] Status de última sincronização
- [ ] Botão de desconectar
- [ ] Adicionar link no menu

**Complexidade:** Alta  
**Risco:** Alto (dependência externa crítica)  
**Custo:** ~R$ 50/mês para 100 usuários ativos

---

### 7. WhatsApp Business API (5 dias)

**Objetivo:** Enviar notificações e permitir consultas via WhatsApp

**Opções de API:**
1. **Twilio** (Recomendado)
   - US$ 0,005 por mensagem (Brasil)
   - Sandbox gratuito
   
2. **MessageBird**
   - Preço similar
   
3. **WhatsApp Business API Oficial**
   - Requer aprovação Meta
   - Mais complexo

**Decisão:** Usar Twilio

**Tarefas Backend:**
- [ ] Criar conta no Twilio
- [ ] Configurar WhatsApp Sandbox
- [ ] Instalar SDK: `npm install twilio`
- [ ] Criar helper `sendWhatsAppMessage(to, message)`
- [ ] Criar procedure `sendWhatsAppAlert(userId, type, data)`
- [ ] Criar webhook endpoint `/api/webhooks/whatsapp`
  - Processar mensagens recebidas
  - Comandos: "saldo", "gastos", "ajuda"
- [ ] Criar procedure `processWhatsAppCommand(userId, command)`
- [ ] Adicionar campo `whatsappNumber` em users
- [ ] Criar testes unitários (6 testes)

**Tarefas Frontend:**
- [ ] Criar página `WhatsAppSettings.tsx`
- [ ] Formulário para vincular número
- [ ] Instruções de ativação
- [ ] Configuração de alertas via WhatsApp
- [ ] Testar envio de mensagem
- [ ] Adicionar em Configurações

**Complexidade:** Média  
**Risco:** Médio (aprovação WhatsApp)  
**Custo:** ~US$ 5/mês para 1000 mensagens

---

### 8. Chatbot WhatsApp Básico (2 dias)

**Objetivo:** Responder comandos simples via WhatsApp

**Comandos Suportados:**
- `/saldo` - Retorna saldo total
- `/gastos [periodo]` - Retorna gastos do período
- `/orcamento` - Status dos orçamentos
- `/ajuda` - Lista de comandos

**Tarefas Backend:**
- [ ] Criar parser de comandos
- [ ] Implementar handlers para cada comando
- [ ] Formatar respostas em texto
- [ ] Rate limiting (max 10 comandos/min por usuário)
- [ ] Criar testes unitários (4 testes)

**Tarefas Frontend:**
- Não requer (apenas backend)

**Complexidade:** Baixa  
**Risco:** Baixo

---

## 🤖 Sprint 12 - IA Avançada e Aprendizado
**Duração:** 15 dias  
**Prioridade:** 🟡 Média  
**Funcionalidades:** 5

### 9. Sistema de Feedback para Categorização (3 dias)

**Objetivo:** Permitir usuário corrigir categorização e IA aprender

**Tarefas Backend:**
- [ ] Criar tabela `categorization_feedback` no schema
  - Campos: id, transactionId, originalCategory, correctedCategory, userId, timestamp
- [ ] Criar procedure `submitCategorizationFeedback(transactionId, newCategory)`
- [ ] Modificar procedure de categorização para considerar feedback
- [ ] Criar sistema de pesos (feedback > regras > IA)
- [ ] Criar testes unitários (4 testes)

**Tarefas Frontend:**
- [ ] Adicionar botão "Corrigir categoria" em transações
- [ ] Modal de seleção de categoria correta
- [ ] Feedback visual de aprendizado
- [ ] Toast de confirmação

**Complexidade:** Média  
**Risco:** Baixo

---

### 10. Aprendizado Contínuo da IA (5 dias)

**Objetivo:** IA melhora categorização com base em correções

**Abordagem:**
1. **Curto prazo:** Sistema de regras baseado em feedback
2. **Longo prazo:** Fine-tuning de modelo (quando houver volume)

**Tarefas Backend:**
- [ ] Criar procedure `learnFromFeedback(userId)`
  - Analisar padrões de correção
  - Criar regras personalizadas por usuário
- [ ] Criar tabela `user_categorization_rules`
  - Campos: userId, pattern, category, confidence
- [ ] Modificar categorização para priorizar regras aprendidas
- [ ] Criar procedure `getCategorySuggestions(description, userId)`
  - Retornar top 3 categorias com confiança
- [ ] Criar job de treinamento semanal
- [ ] Criar testes unitários (6 testes)

**Tarefas Frontend:**
- [ ] Indicador de confiança na categorização
- [ ] Badge "Aprendido" em categorias personalizadas
- [ ] Página de regras aprendidas (opcional)

**Complexidade:** Alta  
**Risco:** Médio

---

### 11. Análise Preditiva de Gastos (4 dias)

**Objetivo:** Prever gastos futuros baseado em histórico

**Abordagem:**
- Média móvel ponderada
- Considerar sazonalidade
- Alertar se projeção > orçamento

**Tarefas Backend:**
- [ ] Criar procedure `predictFutureSpending(userId, category, months)`
  - Calcular média dos últimos 3-6 meses
  - Aplicar peso maior aos meses recentes
  - Considerar sazonalidade (ex: dezembro > gastos)
- [ ] Criar procedure `getPredictedBudgetStatus(userId)`
  - Comparar previsão com orçamento
  - Gerar alertas proativos
- [ ] Criar testes unitários (5 testes)

**Tarefas Frontend:**
- [ ] Card de "Previsão de Gastos" no Dashboard
- [ ] Gráfico com projeção (linha tracejada)
- [ ] Alertas de estouro previsto
- [ ] Confiança da previsão

**Complexidade:** Alta  
**Risco:** Médio (precisão)

---

### 12. Recomendações Personalizadas de Economia (2 dias)

**Objetivo:** IA sugere onde economizar baseado em padrões

**Tarefas Backend:**
- [ ] Criar procedure `getEconomySuggestions(userId)`
  - Identificar categorias com gasto > média
  - Identificar gastos recorrentes desnecessários
  - Sugerir cortes baseado em prioridade
- [ ] Criar testes unitários (3 testes)

**Tarefas Frontend:**
- [ ] Card de "Sugestões de Economia" no Dashboard
- [ ] Lista de recomendações priorizadas
- [ ] Economia potencial estimada
- [ ] Botão "Aplicar sugestão"

**Complexidade:** Média  
**Risco:** Baixo

---

### 13. Alertas Inteligentes Proativos (1 dia)

**Objetivo:** IA envia alertas antes de problemas acontecerem

**Tipos de Alertas:**
- Orçamento vai estourar (previsão)
- Gasto atípico detectado
- Oportunidade de economia identificada
- Meta em risco de não ser atingida

**Tarefas Backend:**
- [ ] Criar procedure `generateProactiveAlerts(userId)`
- [ ] Integrar com sistema de notificações existente
- [ ] Criar testes unitários (2 testes)

**Tarefas Frontend:**
- Usar sistema de alertas existente

**Complexidade:** Baixa  
**Risco:** Baixo

---

## 📋 Sprint 13 - Compliance e Auditoria
**Duração:** 15 dias  
**Prioridade:** 🔴 Alta (Compliance)  
**Funcionalidades:** 4

### 14. Painel Admin de Tickets (5 dias)

**Objetivo:** Interface para admin gerenciar tickets de suporte

**Tarefas Backend:**
- [ ] Criar procedure `getAdminTickets(filters)`
  - Filtrar por status, prioridade, usuário
  - Ordenar por data/prioridade
- [ ] Criar procedure `assignTicket(ticketId, adminId)`
- [ ] Criar procedure `respondToTicket(ticketId, message)`
- [ ] Criar procedure `changeTicketStatus(ticketId, status)`
- [ ] Adicionar campo `assignedTo` em tickets
- [ ] Adicionar campo `sla` (tempo de resposta)
- [ ] Criar testes unitários (6 testes)

**Tarefas Frontend:**
- [ ] Criar página `AdminTickets.tsx`
- [ ] Tabela de tickets com filtros
- [ ] Modal de detalhes do ticket
- [ ] Editor de resposta (rich text)
- [ ] Sistema de atribuição
- [ ] Indicadores de SLA
- [ ] Estatísticas (tempo médio, taxa de resolução)
- [ ] Adicionar no menu Admin

**Complexidade:** Média  
**Risco:** Baixo

---

### 15. Emissão de Notas Fiscais (6 dias)

**Objetivo:** Gerar NF-e automaticamente para pagamentos

**Opções de API:**
1. **NFe.io** (Recomendado)
   - R$ 0,25 por nota
   - Sandbox gratuito
   
2. **Enotas**
   - Preço similar
   
3. **Focus NFe**
   - R$ 0,30 por nota

**Decisão:** Usar NFe.io

**Tarefas Backend:**
- [ ] Criar conta no NFe.io
- [ ] Instalar SDK: `npm install nfe-io`
- [ ] Criar tabela `invoices` no schema
  - Campos: id, userId, subscriptionId, nfeId, number, xml, pdf, status
- [ ] Criar procedure `generateInvoice(subscriptionId, paymentId)`
  - Chamar API NFe.io
  - Armazenar XML e PDF
  - Atualizar status
- [ ] Integrar com webhook Stripe (invoice.payment_succeeded)
- [ ] Criar procedure `getInvoices(userId)`
- [ ] Criar procedure `downloadInvoice(invoiceId, format)` (XML/PDF)
- [ ] Criar testes unitários (5 testes)

**Tarefas Frontend:**
- [ ] Adicionar seção de Notas Fiscais na página Billing
- [ ] Tabela de notas fiscais emitidas
- [ ] Botão de download (XML/PDF)
- [ ] Status da nota (emitida, cancelada)

**Complexidade:** Alta  
**Risco:** Alto (compliance fiscal)  
**Custo:** ~R$ 25/mês para 100 notas

---

### 16. Logs de Auditoria Completos (3 dias)

**Objetivo:** Rastrear todas as ações sensíveis no sistema

**Tarefas Backend:**
- [ ] Criar tabela `audit_logs` no schema
  - Campos: id, userId, action, resource, resourceId, oldValue, newValue, ip, userAgent, timestamp
- [ ] Criar middleware de auditoria
  - Interceptar procedures críticas
  - Registrar antes/depois
- [ ] Criar procedure `getAuditLogs(filters)`
- [ ] Criar procedure `exportAuditLogs(period, format)`
- [ ] Ações auditadas:
  - Login/logout
  - Mudança de senha
  - Operações admin (banimento, mudança de plano)
  - Transações > R$ 1000
  - Mudanças em configurações
- [ ] Criar testes unitários (4 testes)

**Tarefas Frontend:**
- [ ] Criar página `AuditLogs.tsx` (admin)
- [ ] Tabela de logs com filtros
- [ ] Busca por usuário/ação/recurso
- [ ] Exportação para CSV
- [ ] Adicionar no menu Admin

**Complexidade:** Média  
**Risco:** Baixo

---

### 17. Relatórios Financeiros da Plataforma (1 dia)

**Objetivo:** Relatórios de receita/despesa da própria plataforma

**Tarefas Backend:**
- [ ] Criar procedure `getPlatformFinancials(period)`
  - MRR (Monthly Recurring Revenue)
  - Churn rate
  - LTV (Lifetime Value)
  - CAC (Customer Acquisition Cost)
  - Receita por plano
- [ ] Criar testes unitários (2 testes)

**Tarefas Frontend:**
- [ ] Adicionar tab "Financeiro" no AdminDashboard
- [ ] Cards de métricas financeiras
- [ ] Gráfico de receita mensal
- [ ] Breakdown por plano

**Complexidade:** Baixa  
**Risco:** Baixo

---

## 📦 Backlog - Baixa Prioridade
**Funcionalidades:** 8  
**Implementar conforme demanda**

### 18. Sugestões de Como Atingir Meta Mais Rápido (2 dias)
- IA analisa meta e sugere ajustes de gastos
- Simulador de cenários

### 19. Recomendações Personalizadas de Aposentadoria (2 dias)
- IA sugere ajustes em aportes
- Simulador de diferentes estratégias

### 20. Integração Real com n8n API (3 dias)
- Conectar com instância n8n
- Criar/editar workflows via API
- Sincronizar automações

### 21. Biblioteca de Templates de Automação (2 dias)
- Templates pré-configurados
- Marketplace de automações
- One-click install

### 22. Servidor SMTP Personalizado (2 dias)
- Configuração de SMTP customizado
- Templates de email
- Tracking de abertura

### 23. Templates de Email Customizados (1 dia)
- Editor de templates
- Variáveis dinâmicas
- Preview

### 24. Newsletters para Usuários (2 dias)
- Editor de newsletter
- Segmentação de audiência
- Agendamento

### 25. Análise Preditiva Avançada (3 dias)
- Detecção de anomalias
- Previsão de churn
- Recomendações de investimentos

### 26. Detecção de Anomalias em Transações (2 dias)
- Algoritmo de detecção
- Alertas de fraude
- Bloqueio automático

### 27. Recomendações de Investimentos (3 dias)
- IA sugere alocação de ativos
- Perfil de risco
- Simulador

### 28. CDN para Assets Estáticos (1 dia)
- Configurar CloudFlare
- Otimizar imagens
- Cache agressivo

### 29. Service Workers para Modo Offline (2 dias)
- PWA completo
- Cache de dados
- Sincronização em background

---

## 📊 Estimativas e Recursos

### Tempo Total Estimado

| Sprint | Dias | Funcionalidades | Prioridade |
|--------|------|-----------------|------------|
| Sprint 10 | 15 | 5 | 🔴 Alta |
| Sprint 11 | 15 | 6 | 🔴 Alta |
| Sprint 12 | 15 | 5 | 🟡 Média |
| Sprint 13 | 15 | 4 | 🔴 Alta |
| Backlog | 25 | 9 | 🟢 Baixa |
| **TOTAL** | **85 dias** | **29** | - |

### Recursos Necessários

**Equipe Mínima:**
- 1 Desenvolvedor Full-Stack (você)
- 1 Designer UI/UX (opcional, para telas complexas)

**Ferramentas e Serviços:**

| Serviço | Finalidade | Custo Mensal |
|---------|-----------|--------------|
| Pluggy | Agregação bancária | R$ 50 (100 usuários) |
| Twilio | WhatsApp | US$ 5 (1000 msgs) |
| NFe.io | Notas fiscais | R$ 25 (100 notas) |
| Alpha Vantage | Cotações | Grátis (500/dia) |
| **TOTAL** | - | **~R$ 90/mês** |

### Complexidade por Sprint

| Sprint | Complexidade | Risco | Dependências Externas |
|--------|--------------|-------|----------------------|
| Sprint 10 | Média | Baixo | Alpha Vantage |
| Sprint 11 | Alta | Alto | Pluggy, Twilio |
| Sprint 12 | Alta | Médio | Nenhuma |
| Sprint 13 | Média | Alto | NFe.io |

---

## 🎯 Estratégia de Execução

### Fase 1: Validação (Sprint 10)
- Implementar análises avançadas
- Coletar feedback de usuários beta
- Validar se features agregam valor

### Fase 2: Automação (Sprint 11)
- Agregação bancária (maior impacto)
- WhatsApp (canal popular no Brasil)
- Reduzir fricção do usuário

### Fase 3: Inteligência (Sprint 12)
- IA com aprendizado contínuo
- Análise preditiva
- Diferencial competitivo

### Fase 4: Compliance (Sprint 13)
- Notas fiscais (obrigatório)
- Auditoria (segurança)
- Suporte profissional

### Fase 5: Polimento (Backlog)
- Features de baixa prioridade
- Implementar conforme demanda
- Otimizações de performance

---

## 📝 Notas Importantes

### Decisões Técnicas

1. **Agregação Bancária:** Pluggy escolhido por cobertura brasileira
2. **WhatsApp:** Twilio por facilidade de integração
3. **Notas Fiscais:** NFe.io por preço e confiabilidade
4. **Cotações:** Alpha Vantage (grátis) → migrar para pago se necessário

### Riscos Identificados

1. **Alto:** Agregação bancária (dependência crítica)
2. **Alto:** Emissão de NF-e (compliance fiscal)
3. **Médio:** Precisão da IA preditiva
4. **Médio:** Aprovação WhatsApp Business

### Mitigações

- Sandbox/testes extensivos antes de produção
- Fallbacks para APIs externas
- Monitoramento 24/7 de integrações críticas
- Suporte técnico prioritário para issues de compliance

---

## ✅ Checklist de Início de Sprint

Antes de começar cada sprint:

- [ ] Revisar este plano
- [ ] Confirmar prioridades com stakeholders
- [ ] Verificar disponibilidade de APIs externas
- [ ] Preparar ambiente de testes
- [ ] Criar branch no Git
- [ ] Atualizar todo.md com tarefas do sprint
- [ ] Configurar tracking de progresso

---

## 📞 Próximos Passos

1. **Revisar este plano** com stakeholders
2. **Priorizar sprints** conforme necessidade de negócio
3. **Configurar contas** nas APIs externas (Pluggy, Twilio, NFe.io)
4. **Preparar ambiente** de desenvolvimento
5. **Iniciar Sprint 10** quando aprovado

---

**Última Atualização:** 31 de Dezembro de 2025  
**Próxima Revisão:** Após conclusão de cada sprint
