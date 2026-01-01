# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [3.0.0] - 2026-01-01

### 🎉 Redesign Completo e Atualização Major

Esta versão traz uma transformação visual completa, novos screenshots e limpeza do repositório.

### 🎨 Redesign Visual Completo

#### Landing Page Renovada
- **Nova identidade visual** com gradiente azul-verde moderno e animações suaves
- **Hero section redesenhada** com título impactante "Gerencie suas finanças com inteligência artificial"
- **Seção de recursos** com 8 cards apresentando funcionalidades principais (Dashboard Inteligente, Segurança Total, Relatórios Detalhados, etc.)
- **Estatísticas sociais** destacadas: 10k+ usuários, R$ 50M+ patrimônio gerenciado, 4.9/5 avaliação média
- **Planos de preços** reformulados com destaque visual para o plano Premium
- **Seção de depoimentos** com avaliações de Maria Silva, João Santos e Ana Costa
- **FAQ expandido** com 5 perguntas frequentes e respostas detalhadas
- **Footer completo** com links organizados por categorias

#### Dashboard do Usuário Modernizado
- **Layout atualizado** com cards de métricas mais visuais e coloridos
- **Gráfico de evolução patrimonial** interativo com seleção de período (7D, 30D, 90D, 1A)
- **Gráfico de pizza** aprimorado para distribuição de despesas por categoria
- **Seção de Insights da IA** redesenhada com cards coloridos e ícones temáticos
- **Sistema de gamificação** visual com barra de progresso de XP e níveis
- **Seção de progresso** com conquistas, melhor sequência e dias de sequência
- **Transações recentes** com melhor visualização
- **Próximas contas** com estado vazio amigável

#### Painel Administrativo Aprimorado
- **Dashboard admin** com métricas em cards coloridos e ícones distintivos
- **Abas organizadas** (Visão Geral, Usuários, Pagamentos, Inteligência Artificial, Integrações)
- **Tabela de usuários** com badges coloridos para planos e status
- **Métricas de login** com cards de estatísticas e sistema de rate limiting
- **Design consistente** com o restante da aplicação

#### Chat com IA Renovado
- **Interface moderna** estilo ChatGPT com mensagens em bolhas
- **Avatar do assistente** com ícone de robô
- **Mensagem de boas-vindas** explicando capacidades da IA
- **Lista de funcionalidades** destacada visualmente
- **Input aprimorado** com placeholder sugestivo

### 📸 Screenshots Completamente Renovados

Todos os 9 screenshots foram atualizados para refletir o novo design:

1. **landing-page-hero.webp** - Hero section com gradiente moderno
2. **landing-page-features.webp** - Recursos e estatísticas sociais
3. **landing-page-pricing.webp** - Planos e depoimentos
4. **dashboard-main.webp** - Dashboard principal com novo layout
5. **dashboard-insights.webp** - Insights da IA e sistema de gamificação
6. **ai-chat.webp** - Interface do chat renovada
7. **admin-dashboard.webp** - Painel administrativo modernizado
8. **admin-users.webp** - Gestão de usuários com nova tabela
9. **admin-login-metrics.webp** - Métricas de segurança e rate limiting

**Formato:** Todos os screenshots foram convertidos para WebP para melhor compressão e qualidade.

### 🗑️ Limpeza do Repositório

#### Arquivos Removidos

Para manter o repositório limpo e focado no código de produção, os seguintes arquivos foram removidos:

**Análises de IA:**
- `ANALISE_GEMINI_COMPLETA.md`
- `ANALISE_GPT4_COMPLEMENTAR.txt`
- `ANALISE_IMPLEMENTACAO.md`
- `ANALISE_SISTEMA_COMPLETA.md`

**Documentos de Planejamento:**
- `GAMIFICACAO_GPT_GEMINI.md`
- `GUIA_REDESIGN.md`
- `INSIGHTS_IA_UX.md`
- `PLANO_ACAO_PRIORIZADO.md`
- `PLANO_ESTRATEGICO_IA.md`
- `PLANO_IMPLEMENTACAO_PENDENTES.md`
- `PLANO_MELHORIAS_14_DIAS.md`

**Relatórios Técnicos:**
- `RELATORIO_TECNICO_COMPLETO.md`

**Screenshots Antigos:**
- `screenshots/01-landing-page.webp`
- `screenshots/02-recursos-precos.webp`
- `screenshots/03-dashboard.webp`
- `screenshots/04-chat-ia.webp`
- `screenshots/05-painel-admin.webp`
- `screenshots/06-admin-integracoes.webp`
- `docs/screenshots/01-dashboard.png`

**Motivo da Remoção:** Estes arquivos eram úteis durante o desenvolvimento e planejamento, mas não agregam valor ao repositório de produção. Eles podem ser consultados no histórico do Git se necessário.

### 🎨 Melhorias de Design

- **Paleta de cores** atualizada com gradientes modernos (azul para verde)
- **Tipografia** aprimorada com hierarquia clara
- **Espaçamento** mais consistente entre elementos
- **Animações suaves** em transições e hover states
- **Ícones** mais expressivos e coloridos
- **Cards** com sombras sutis e bordas arredondadas
- **Badges** coloridos para status e categorias
- **Gráficos** com cores vibrantes e legendas claras

### 🔧 Melhorias Técnicas

- **Otimização de imagens** com formato WebP
- **Redução do tamanho do repositório** com remoção de arquivos desnecessários
- **Documentação atualizada** no README.md
- **CHANGELOG estruturado** com histórico completo

### 📝 Notas de Atualização

Esta é uma atualização visual major que não introduz breaking changes no código, mas renova completamente a aparência da aplicação.

**Recomendações:**
- Revisar os novos screenshots para entender as mudanças visuais
- Atualizar materiais de marketing com as novas imagens
- Comunicar as melhorias visuais aos usuários existentes

---

## [2.0.0] - 2025-12-31

### 🎉 Principais Destaques

Esta versão representa uma transformação completa do sistema, evoluindo de uma ferramenta de gestão financeira pessoal para uma **plataforma SaaS completa** com recursos empresariais, integrações avançadas e painel administrativo robusto.

### ✨ Novas Funcionalidades

#### 🏢 Transformação em SaaS Completo

- **Landing Page Profissional**
  - Hero section com proposta de valor clara
  - Seção de recursos com 8 funcionalidades destacadas
  - Planos e preços (Free, Premium, Family)
  - Depoimentos de clientes
  - FAQ completo
  - Footer com links importantes
  - Chat de suporte com IA integrado

- **Sistema de Cobrança Stripe**
  - Integração completa com Stripe Checkout
  - Suporte a assinaturas recorrentes (mensal)
  - Webhooks para eventos de pagamento
  - Página de gerenciamento de assinatura (/dashboard/billing)
  - Customer Portal para autoatendimento
  - Histórico de faturas com download
  - Suporte a 3 planos: Free (R$ 0), Premium (R$ 99), Family (R$ 199)

- **Sistema de Tickets de Suporte**
  - Criação de tickets com prioridades (baixa, média, alta, urgente)
  - Listagem de tickets do usuário
  - Sistema de status (aberto, em andamento, fechado)
  - Interface intuitiva para usuários

#### 🤖 Inteligência Artificial

- **Chat IA Profissional**
  - Interface moderna com histórico de conversas
  - Contexto financeiro completo do usuário
  - Análises inteligentes de gastos
  - Sugestões personalizadas baseadas em dados reais
  - Streaming de respostas em tempo real
  - Renderização de Markdown
  - Integração com Groq (Llama 3.1 70B, Mixtral 8x7B)

- **Integração Tavily Search**
  - Busca na web em tempo real
  - Cotações de ações atualizadas
  - Notícias econômicas
  - Dados de mercado em tempo real

- **Configuração de APIs de IA**
  - Interface para configurar múltiplas APIs (Groq, Gemini, Tavily, Perplexity, Ollama)
  - Validação de API keys
  - Status de conexão em tempo real
  - Instruções passo a passo para obter credenciais

#### 👨‍💼 Painel Administrativo Avançado

- **Dashboard Admin**
  - Métricas em tempo real (usuários, receita, conversão, churn)
  - Gráficos comparativos com período anterior
  - Usuários recentes
  - Alertas do sistema
  - Tabs organizadas (Visão Geral, Usuários, Pagamentos, IA, Integrações)

- **Gestão de Usuários**
  - Listagem completa com filtros
  - Informações detalhadas (plano, status, data de cadastro)
  - Sistema de banimentos
  - Controle de permissões por role (admin/user)

- **Gestão de Transações Admin**
  - Aprovar/rejeitar transações pendentes
  - Visualização de todas as transações do sistema
  - Filtros avançados

- **Configurações de Integrações**
  - Página dedicada para gerenciar integrações
  - Cards para n8n, WhatsApp, Email SMTP, Webhooks
  - Status visual (ativa/inativa)
  - Documentação inline de cada integração

- **Configuração de APIs**
  - Gerenciamento de chaves de IA (OpenAI, Claude, Gemini)
  - Configuração de Stripe
  - Configuração de n8n
  - Configuração de WhatsApp Business

#### 🔐 Autenticação Avançada

- **2FA (Autenticação de Dois Fatores)**
  - Suporte a SMS
  - Suporte a Authenticator Apps (Google Authenticator, Authy)
  - Interface de configuração intuitiva

- **Login Social**
  - Login com Google
  - Login com Apple
  - Login com Facebook
  - Linking de contas

#### 👨‍👩‍👧‍👦 Colaboração Familiar

- **Compartilhamento de Orçamentos e Metas**
  - Convites para familiares
  - Controle de permissões (leitura/edição)
  - Dashboard familiar consolidado
  - Gestão de membros

#### 🔄 Automações e Integrações

- **Transferências Automáticas**
  - Configuração de transferências recorrentes
  - Regras de transferência automática
  - Histórico completo
  - Notificações de execução

- **Integração n8n**
  - Webhooks personalizados
  - Criação de automações via interface
  - Gestão de workflows
  - Triggers e ações configuráveis
  - **Modal de criação de automações** (NOVO!)
    - Formulário completo com validação
    - 6 triggers disponíveis
    - 6 ações disponíveis
    - Criação instantânea

- **Notificações Push**
  - Sistema de notificações em massa
  - Segmentação de usuários
  - Histórico de envios
  - Agendamento de notificações

#### 📊 Análises e Relatórios

- **Próximas Contas a Vencer**
  - Widget no dashboard
  - Próximos 30 dias
  - Badge de status (vence hoje, atrasado, futuro)
  - Botão para marcar como pago

- **Exportação de Relatórios**
  - Exportação para PDF com formatação profissional
  - Exportação para Excel com múltiplas abas
  - Resumo financeiro incluído
  - Timestamps nos arquivos

- **Análise de Gastos Recorrentes**
  - Identificação automática de assinaturas
  - Detecção de gastos repetidos
  - Sugestões de economia

- **Benchmarks de Investimentos**
  - Comparação com CDI, Ibovesap, S&P500
  - Gráficos comparativos
  - Análise de performance

### 🐛 Correções de Bugs

#### Críticos

- **Erro 404 na Página de Integrações Admin**
  - Problema: Rota /admin/integrations retornava 404
  - Causa: Página AdminIntegrations.tsx não existia
  - Solução: Criada página completa com 4 cards de integração

- **Botão "Criar Nova Automação" Não Funcionava**
  - Problema: Botão na página n8n não tinha funcionalidade
  - Causa: Faltava evento onClick e modal de criação
  - Solução: Implementado dialog completo com formulário, validação e criação instantânea

- **Erro "process is not defined" no Frontend**
  - Problema: Código compartilhado usava process.env
  - Causa: Arquivo products.ts com dependências server-side
  - Solução: Movido para pasta shared e removido process.env

#### Menores

- Correção de layout em páginas sem DashboardLayout
- Ajustes de responsividade em componentes
- Correção de estados de loading
- Melhorias em mensagens de erro
- Ajustes de validação de formulários

### 🎨 Melhorias de Interface

- **Renomeação da Aplicação**
  - Nome atualizado de "FinMaster Pro" para "Organizai"
  - Atualização em todos os componentes e páginas
  - Logo e branding atualizados

- **Menu Administrativo Melhorado**
  - Botão "Painel Admin" destacado em verde
  - Separação clara entre área de usuário e admin
  - Ícones intuitivos
  - Organização por categorias (Principal, Financeiro, Configurações)

- **Dashboard Aprimorado**
  - Cards de métricas com ícones coloridos
  - Gráficos interativos
  - Widget de próximas contas
  - Transações recentes
  - Alertas destacados

- **Chat IA Redesenhado**
  - Interface moderna estilo ChatGPT
  - Mensagens com avatares
  - Suporte a Markdown
  - Exemplos de uso
  - Badge "Finança A.I"

### 🔧 Melhorias Técnicas

#### Backend

- **Procedures tRPC Adicionados**
  - `createCheckoutSession` - Criar sessão de checkout Stripe
  - `getSubscriptionStatus` - Obter status de assinatura
  - `cancelSubscription` - Cancelar assinatura
  - `createCustomerPortalSession` - Criar sessão do Customer Portal
  - `getInvoices` - Obter histórico de faturas
  - `getCurrentSubscription` - Obter assinatura atual
  - `getUpcomingBills` - Obter próximas contas a vencer
  - `markBillAsPaid` - Marcar conta como paga
  - `chat` - Enviar mensagem para IA
  - `searchWeb` - Buscar informações na web

- **Webhooks Stripe**
  - Endpoint `/api/webhooks/stripe` implementado
  - Processamento de 6 eventos principais
  - Atualização automática de status de assinatura
  - Logs de eventos

- **Schema do Banco Atualizado**
  - Campos de assinatura Stripe na tabela users
  - Campo `role` para controle de acesso (admin/user)
  - Campo `isPending` em transactions
  - Tabelas de tickets, automations, etc.

#### Frontend

- **Componentes Reutilizáveis**
  - DashboardLayout - Layout padrão com sidebar
  - AdminLayout - Layout do painel admin
  - AIChatBox - Chat com IA reutilizável
  - UpcomingBills - Widget de próximas contas
  - SupportChatWidget - Chat de suporte flutuante

- **Otimizações**
  - Lazy loading de componentes
  - Memoização de cálculos pesados
  - Otimização de queries tRPC
  - Cache de respostas da IA

#### Testes

- **Cobertura de Testes Expandida**
  - 35+ testes unitários passando
  - Testes de procedures de checkout
  - Testes de billing
  - Testes de próximas contas
  - Testes de autenticação e autorização

### 📚 Documentação

- **README.md Atualizado**
  - Seção de funcionalidades completa
  - Screenshots do sistema
  - Instruções de instalação
  - Guia de contribuição
  - Tecnologias utilizadas

- **CHANGELOG.md Criado**
  - Histórico detalhado de mudanças
  - Organização por versões
  - Categorização de mudanças

### 🚀 Melhorias de Performance

- Otimização de queries do banco de dados
- Redução de re-renders desnecessários
- Lazy loading de rotas
- Compressão de assets
- Cache de API calls

### 🔒 Segurança

- Implementação de RBAC (Role-Based Access Control)
- Validação de inputs em todos os formulários
- Sanitização de dados do usuário
- Proteção contra CSRF em webhooks
- Criptografia de dados sensíveis

### 📦 Dependências Atualizadas

- `@stripe/stripe-js` - Integração com Stripe
- `jspdf` e `jspdf-autotable` - Exportação PDF
- `xlsx` - Exportação Excel
- `recharts` - Gráficos interativos
- `streamdown` - Renderização de Markdown com streaming

---

## [1.0.0] - 2025-12-15

### ✨ Lançamento Inicial

- Sistema básico de gestão financeira pessoal
- CRUD de contas, transações, orçamentos
- Dashboard com métricas principais
- Gestão de metas e dívidas
- Acompanhamento de investimentos
- Calculadora de aposentadoria
- Sistema de alertas
- Relatórios básicos
- Autenticação com Manus OAuth

---

## Tipos de Mudanças

- `✨ Novas Funcionalidades` - Novos recursos adicionados
- `🐛 Correções de Bugs` - Bugs corrigidos
- `🎨 Melhorias de Interface` - Mudanças visuais e de UX
- `🔧 Melhorias Técnicas` - Refatorações e otimizações
- `📚 Documentação` - Atualizações na documentação
- `🚀 Performance` - Melhorias de desempenho
- `🔒 Segurança` - Correções de segurança
- `📦 Dependências` - Atualizações de bibliotecas

---

**Legenda de Versões:**
- **Major (X.0.0)** - Mudanças incompatíveis com versões anteriores
- **Minor (0.X.0)** - Novas funcionalidades compatíveis
- **Patch (0.0.X)** - Correções de bugs e pequenas melhorias
