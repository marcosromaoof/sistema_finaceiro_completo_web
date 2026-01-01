# 💰 Organizai - Plataforma Completa de Gestão Financeira

![Organizai](./screenshots/01-landing-page.webp)

**Organizai** é uma plataforma SaaS completa para gestão financeira pessoal e familiar, com inteligência artificial integrada, automações avançadas e painel administrativo robusto.

Gerencie contas, orçamentos, metas, investimentos e dívidas em uma única plataforma moderna e intuitiva. Tome decisões financeiras mais inteligentes com análises baseadas em IA e dados em tempo real.

---

## 🌟 Principais Funcionalidades

### 💼 Gestão Financeira Completa

- **Dashboard Inteligente** - Visualize todo seu patrimônio em um só lugar com gráficos interativos e métricas em tempo real
- **Contas Financeiras** - Gerencie contas correntes, poupança, cartões de crédito, investimentos e empréstimos
- **Transações** - Registre receitas e despesas com categorização automática por IA
- **Orçamentos** - Crie orçamentos mensais por categoria com acompanhamento em tempo real
- **Metas Financeiras** - Defina e acompanhe metas de curto, médio e longo prazo
- **Gestão de Dívidas** - Planeje pagamentos com estratégias snowball e avalanche
- **Investimentos** - Acompanhe performance de carteira e compare com benchmarks (CDI, Ibovespa, S&P500)
- **Aposentadoria** - Calculadora com projeções e simulações de diferentes cenários

### 🤖 Inteligência Artificial

- **Assistente Financeiro IA** - Chat inteligente com contexto completo de suas finanças
- **Categorização Automática** - IA aprende com suas correções para melhorar continuamente
- **Análises Personalizadas** - Insights sobre hábitos de gastos e sugestões de economia
- **Busca na Web** - Cotações de ações, notícias econômicas e dados de mercado em tempo real
- **Múltiplas APIs** - Suporte a Groq, Gemini, Perplexity, Tavily e Ollama

### 📊 Relatórios e Análises

- **Relatórios Detalhados** - Análises profundas por categoria, período e conta
- **Exportação PDF/Excel** - Relatórios profissionais com resumo financeiro
- **Gastos Recorrentes** - Identificação automática de assinaturas e despesas fixas
- **Próximas Contas** - Widget com contas a vencer nos próximos 30 dias
- **Benchmarks** - Compare investimentos com índices de mercado

### 👨‍👩‍👧‍👦 Colaboração Familiar

- **Compartilhamento** - Compartilhe orçamentos e metas com sua família
- **Controle de Permissões** - Defina quem pode visualizar ou editar
- **Dashboard Consolidado** - Visão unificada das finanças familiares
- **Convites** - Adicione até 5 membros da família (plano Family)

### 🔄 Automações e Integrações

- **n8n Workflows** - Crie automações personalizadas sem código
- **Transferências Automáticas** - Configure transferências recorrentes entre contas
- **Webhooks** - Receba eventos em tempo real
- **WhatsApp Business** - Notificações via WhatsApp
- **Email SMTP** - Servidor de email personalizado
- **Notificações Push** - Alertas em tempo real no navegador

### 🔐 Segurança e Autenticação

- **2FA** - Autenticação de dois fatores via SMS ou Authenticator App
- **Login Social** - Entre com Google, Apple ou Facebook
- **Criptografia** - Dados protegidos com criptografia de ponta a ponta
- **LGPD** - Em conformidade com a Lei Geral de Proteção de Dados

### 💳 Sistema de Cobrança

- **Stripe Integrado** - Checkout seguro e confiável
- **Assinaturas Recorrentes** - Cobrança automática mensal
- **Customer Portal** - Autoatendimento para gerenciar assinatura
- **Histórico de Faturas** - Download de todas as faturas
- **3 Planos** - Free (R$ 0), Premium (R$ 99), Family (R$ 199)

### 👨‍💼 Painel Administrativo

- **Dashboard Admin** - Métricas de usuários, receita, conversão e churn
- **Gestão de Usuários** - Listar, filtrar, bloquear e gerenciar usuários
- **Gestão de Transações** - Aprovar/rejeitar transações pendentes
- **Configuração de APIs** - Gerenciar chaves de IA, Stripe, n8n e WhatsApp
- **Integrações** - Configurar e monitorar integrações ativas
- **Controle de Acesso** - Sistema de roles (admin/user)

---

## 📸 Screenshots

### Landing Page
![Landing Page](./screenshots/01-landing-page.webp)

### Recursos e Preços
![Recursos e Preços](./screenshots/02-recursos-precos.webp)

### Dashboard Principal
![Dashboard](./screenshots/03-dashboard.webp)

### Chat com IA
![Chat IA](./screenshots/04-chat-ia.webp)

### Painel Administrativo
![Painel Admin](./screenshots/05-painel-admin.webp)

### Integrações
![Integrações](./screenshots/06-admin-integracoes.webp)

---

## 🚀 Tecnologias Utilizadas

### Frontend

- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS 4** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos e acessíveis
- **Wouter** - Roteamento leve para React
- **tRPC** - Type-safe API calls
- **Recharts** - Gráficos interativos
- **Streamdown** - Renderização de Markdown com streaming

### Backend

- **Node.js 22** - Runtime JavaScript
- **Express 4** - Framework web minimalista
- **tRPC 11** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM para SQL
- **MySQL/TiDB** - Banco de dados relacional
- **Superjson** - Serialização avançada de dados

### Integrações

- **Stripe** - Pagamentos e assinaturas
- **Groq** - IA com Llama 3.1 70B e Mixtral 8x7B
- **Tavily** - Busca na web em tempo real
- **n8n** - Automações e workflows
- **WhatsApp Business** - Notificações via WhatsApp
- **Google OAuth** - Autenticação social

### Ferramentas

- **Vite** - Build tool e dev server
- **Vitest** - Framework de testes
- **pnpm** - Gerenciador de pacotes
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formatador de código

---

## 📋 Pré-requisitos

- **Node.js** 22.x ou superior
- **pnpm** 9.x ou superior
- **MySQL** 8.x ou TiDB
- **Conta Stripe** (para pagamentos)
- **API Keys** (Groq, Tavily, etc.) - opcional

---

## 🛠️ Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/marcosromaoof/sistema_finaceiro_completo_web.git
cd sistema_finaceiro_completo_web
```

### 2. Instale as Dependências

```bash
pnpm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Variáveis principais:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/organizai

# JWT
JWT_SECRET=seu-secret-aqui

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OAuth (Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu-app-id

# APIs de IA (opcional)
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly-...
```

### 4. Execute as Migrações do Banco

```bash
pnpm db:push
```

### 5. Inicie o Servidor de Desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build            # Build para produção
pnpm preview          # Preview do build de produção

# Banco de Dados
pnpm db:push          # Aplica mudanças do schema ao banco
pnpm db:studio        # Abre Drizzle Studio (GUI do banco)

# Testes
pnpm test             # Executa todos os testes
pnpm test:watch       # Executa testes em modo watch

# Qualidade de Código
pnpm lint             # Verifica problemas de linting
pnpm format           # Formata código com Prettier
```

---

## 🏗️ Estrutura do Projeto

```
.
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Utilitários e configurações
│       ├── pages/         # Páginas da aplicação
│       ├── App.tsx        # Rotas e layout
│       └── main.tsx       # Entry point
│
├── server/                # Backend Express + tRPC
│   ├── _core/            # Infraestrutura (auth, LLM, etc)
│   ├── db.ts             # Query helpers
│   ├── routers.ts        # tRPC procedures
│   └── *.test.ts         # Testes unitários
│
├── drizzle/              # Schema e migrações
│   └── schema.ts         # Definição das tabelas
│
├── shared/               # Código compartilhado
│   ├── constants.ts      # Constantes
│   └── types.ts          # Tipos TypeScript
│
├── storage/              # Helpers S3
│
└── screenshots/          # Screenshots do sistema
```

---

## 🧪 Testes

O projeto possui **35+ testes unitários** cobrindo:

- Procedures de autenticação
- Checkout e billing Stripe
- Gestão de transações
- Próximas contas a vencer
- Autorização baseada em roles

Execute os testes:

```bash
pnpm test
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Diretrizes

- Escreva testes para novas funcionalidades
- Mantenha o código formatado com Prettier
- Siga os padrões de commit convencionais
- Atualize a documentação quando necessário

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Marcos Romano** - [GitHub](https://github.com/marcosromaoof)

---

## 🙏 Agradecimentos

- [Manus](https://manus.im) - Plataforma de desenvolvimento
- [Stripe](https://stripe.com) - Infraestrutura de pagamentos
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Groq](https://groq.com) - Inferência de IA ultrarrápida
- [Tavily](https://tavily.com) - API de busca na web

---

## 📞 Suporte

- **Email**: suporte@organizai.com.br
- **GitHub Issues**: [Reportar Bug](https://github.com/marcosromaoof/sistema_finaceiro_completo_web/issues)
- **Chat**: Disponível na landing page

---

## 🎆 Últimas Atualizações (Dezembro 2025)

### Redesign Dark/Green Moderno ✅
- ✅ Tema dark navy profundo com acentos verde vibrante
- ✅ Paleta de cores OKLCH para melhor contraste e acessibilidade
- ✅ Todas as funcionalidades mantidas intactas
- ✅ Responsividade e acessibilidade (WCAG AA)

### Notificações de Dividendos 💰
- ✅ Alertas automáticos ao owner quando dividendo é registrado
- ✅ Toast aprimorado no frontend com emoji 💰
- ✅ Integração com sistema notifyOwner
- ✅ Formato: "Novo Dividendo Registrado - Usuário X registrou R$ Y"
- ✅ Falha silenciosa - não bloqueia criação do dividendo

### Análise de Carteira de Investimentos 📊
- ✅ Página /portfolio-analysis completa e funcional
- ✅ Gráfico de pizza: Diversificação por tipo de ativo
- ✅ Gráfico de barras: Performance top 10 investimentos
- ✅ Sistema de pontuação de diversificação (Excelente/Boa/Moderada/Baixa)
- ✅ Botão "Gerar Recomendações IA" com análises inteligentes
- ✅ 4 cards de métricas principais (Total Investido, Valor Atual, Retorno, Diversificação)
- ✅ Empty state com CTA para adicionar investimentos

### Metas de Renda Passiva 🎯
- ✅ Página /passive-income-goals completa e funcional
- ✅ CRUD de metas com formulário completo
- ✅ Progresso visual e comparação com dividendos reais do mês
- ✅ Calculadora de independência financeira com projeções
- ✅ Projeções de tempo para atingir metas
- ✅ 4 cards de resumo (Metas Ativas, Meta Total, Recebido, Projeção)
- ✅ Lista de metas com badges de status (Ativa/Inativa/Atrasada)

### Sistema de Gamificação Aprimorado 🎮
- ✅ Botões "Ver Perfil" no Leaderboard e Conquistas
- ✅ Sistema de badges visuais premium (10 tipos, 3 níveis)
- ✅ Página de Estatísticas (/stats) com 3 gráficos interativos
- ✅ Card de Insights com análises automáticas
- ✅ Navegação fluida entre perfis públicos

---

## 🔮 Próximas Implementações (Em Desenvolvimento)

### 1. Dashboard de Insights Financeiros com IA 🧠
- Análises preditivas de gastos futuros baseadas em histórico
- Identificação automática de padrões de consumo
- Sugestões de otimização de orçamento personalizadas
- Detecção de anomalias em transações em tempo real
- Recomendações personalizadas baseadas em comportamento

### 2. Sistema de Alertas Inteligentes 🔔
- Detecção de gastos incomuns em tempo real
- Alertas de oportunidades de economia automáticos
- Notificações de momentos ideais para aportes em investimentos
- Avisos de vencimento de contas com antecedência inteligente
- Sugestões proativas de ações financeiras

### 3. Comparação com Benchmarks de Mercado 📈
- Comparação de investimentos com CDI em tempo real
- Performance vs Ibovespa com gráficos históricos
- Comparação com S&P500 para investimentos internacionais
- Gráficos de rentabilidade relativa
- Análise de rentabilidade ajustada ao risco (Sharpe Ratio)

---

## 🗺️ Roadmap Futuro

### Funcionalidades Planejadas

- [ ] Aplicativo mobile (React Native)
- [ ] Importação automática de extratos bancários (Open Banking)
- [ ] Modo offline com sincronização
- [ ] Integração com mais bancos brasileiros
- [ ] Relatórios de imposto de renda
- [ ] Planejamento sucessório
- [ ] Consultoria financeira com IA
- [ ] Marketplace de integrações

---

## 📊 Status do Projeto

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Versão Atual**: 2.0.0  
**Última Atualização**: 31 de Dezembro de 2025  
**Status**: Em Desenvolvimento Ativo

---

<div align="center">
  <p>Feito com ❤️ por <a href="https://github.com/marcosromaoof">Marcos Romano</a></p>
  <p>
    <a href="https://organizai.com.br">Website</a> •
    <a href="https://github.com/marcosromaoof/sistema_finaceiro_completo_web/issues">Reportar Bug</a> •
    <a href="https://github.com/marcosromaoof/sistema_finaceiro_completo_web/issues">Solicitar Feature</a>
  </p>
</div>
