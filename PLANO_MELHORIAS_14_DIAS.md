# Plano de Melhorias - 14 Dias
## Organizai - Análise Completa do Sistema
**Data:** 31 de Dezembro de 2025  
**Baseado em:** Análise Gemini 2.0 Flash + Análise Manual do Código  
**Foco:** Bugs críticos, UX/UI, Performance - SEM CUSTOS ADICIONAIS

---

## 🎯 Objetivo

Preparar o Organizai para lançamento beta público em 14 dias, corrigindo bugs críticos, melhorando UX mobile e otimizando performance, **sem adicionar custos operacionais**.

---

## 📊 Situação Atual

### ✅ Pontos Fortes
- 79 funcionalidades implementadas
- Design premium com glassmorphism
- Sistema de gamificação funcional
- Integração com IAs (Groq, Gemini, Tavily)
- 15 testes unitários passando
- TypeScript sem erros

### ⚠️ Problemas Críticos
1. **Segurança:** XSS, falta de rate limiting
2. **UX Mobile:** Tabelas não responsivas, sidebar fixa
3. **Performance:** Queries N+1, bundle não otimizado
4. **Onboarding:** Categorias não criadas automaticamente

---

## 🚀 Plano de 14 Dias (4 Sprints)

### Sprint 1 (Dias 1-3): 🔒 Segurança e Bugs Críticos
**Objetivo:** Sistema seguro e estável

#### Dia 1 (6h)
- [ ] **Corrigir erro de compilação** (routers.ts:1271) - 2h
  - Investigar linha 1271
  - Provavelmente problema de destructuring
  - Testar compilação

- [ ] **Implementar rate limiting básico** - 3h
  ```javascript
  // server/_core/rateLimit.ts
  const requestCounts = {};
  const WINDOW_SIZE_MS = 60000; // 1 minuto
  const MAX_REQUESTS_PER_WINDOW = 100;

  export function rateLimit(req, res, next) {
    const ip = req.ip;
    if (!requestCounts[ip]) {
      requestCounts[ip] = [];
    }
    
    const now = Date.now();
    const requestsThisWindow = requestCounts[ip].filter(
      (time) => time > now - WINDOW_SIZE_MS
    );
    
    if (requestsThisWindow.length >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ 
        error: 'Muitas requisições. Tente novamente em 1 minuto.' 
      });
    }
    
    requestCounts[ip].push(now);
    next();
  }
  
  // Aplicar em rotas protegidas
  app.use('/api/trpc', rateLimit);
  ```

- [ ] **Testes de rate limiting** - 1h

#### Dia 2 (6h)
- [ ] **Implementar sanitização XSS** - 4h
  ```bash
  pnpm add dompurify isomorphic-dompurify
  ```
  
  ```typescript
  // server/_core/sanitize.ts
  import DOMPurify from 'isomorphic-dompurify';

  export function sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Remove todas as tags HTML
      ALLOWED_ATTR: []
    });
  }

  export function sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href']
    });
  }
  ```

- [ ] **Aplicar sanitização em todos os inputs** - 2h
  - Procedures de criação/edição de transações
  - Procedures de categorias
  - Procedures de metas
  - Chat IA

#### Dia 3 (6h)
- [ ] **Automatizar criação de categorias padrão** - 4h
  ```typescript
  // server/db-categories.ts
  export async function createDefaultCategories(userId: number) {
    const defaultCategories = [
      // Despesas
      { name: 'Alimentação', type: 'expense', icon: '🍴', color: '#ef4444', userId, isSystem: true },
      { name: 'Transporte', type: 'expense', icon: '🚗', color: '#f59e0b', userId, isSystem: true },
      { name: 'Moradia', type: 'expense', icon: '🏠', color: '#8b5cf6', userId, isSystem: true },
      { name: 'Saúde', type: 'expense', icon: '❤️', color: '#10b981', userId, isSystem: true },
      { name: 'Educação', type: 'expense', icon: '📚', color: '#3b82f6', userId, isSystem: true },
      { name: 'Lazer', type: 'expense', icon: '😊', color: '#ec4899', userId, isSystem: true },
      { name: 'Vestuário', type: 'expense', icon: '👕', color: '#06b6d4', userId, isSystem: true },
      { name: 'Contas', type: 'expense', icon: '📄', color: '#f97316', userId, isSystem: true },
      { name: 'Outros', type: 'expense', icon: '⋯', color: '#6b7280', userId, isSystem: true },
      // Receitas
      { name: 'Salário', type: 'income', icon: '💵', color: '#10b981', userId, isSystem: true },
      { name: 'Investimentos', type: 'income', icon: '📈', color: '#3b82f6', userId, isSystem: true },
      { name: 'Freelance', type: 'income', icon: '💼', color: '#8b5cf6', userId, isSystem: true },
      { name: 'Outros', type: 'income', icon: '⋯', color: '#6b7280', userId, isSystem: true },
    ];

    for (const category of defaultCategories) {
      await db.createCategory(category);
    }
  }

  // Chamar no callback OAuth após criar usuário
  // server/_core/oauth.ts
  const user = await db.upsertUser({ ... });
  await createDefaultCategories(user.id);
  ```

- [ ] **Testes de segurança** - 2h
  - Testar XSS em formulários
  - Testar rate limiting
  - Testar criação de categorias

**Entregável Sprint 1:** Sistema seguro, sem bugs críticos

---

### Sprint 2 (Dias 4-7): 📱 UX Mobile e Performance
**Objetivo:** Experiência mobile excelente

#### Dia 4 (6h)
- [ ] **Tornar tabelas responsivas** - 6h
  ```tsx
  // Opção 1: Scroll horizontal
  <div className="overflow-x-auto -mx-4 px-4">
    <table className="min-w-full">
      {/* conteúdo */}
    </table>
  </div>

  // Opção 2: Cards em mobile
  <div className="hidden md:block">
    <table>{/* desktop */}</table>
  </div>
  <div className="md:hidden space-y-4">
    {items.map(item => (
      <Card key={item.id}>{/* mobile */}</Card>
    ))}
  </div>
  ```
  
  **Páginas a corrigir:**
  - Transações
  - Contas
  - Investimentos
  - Dívidas
  - Orçamentos

#### Dia 5 (6h)
- [ ] **Implementar skeleton loaders** - 6h
  ```tsx
  // components/skeletons/DashboardSkeleton.tsx
  export function DashboardSkeleton() {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded-lg" />
          <div className="h-80 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  // Usar em páginas
  {isLoading ? <DashboardSkeleton /> : <DashboardContent />}
  ```
  
  **Páginas a implementar:**
  - Dashboard (Home)
  - Transações
  - Investimentos
  - Relatórios
  - Conquistas

#### Dia 6 (5h)
- [ ] **Lazy loading de imagens** - 2h
  ```tsx
  // Adicionar loading="lazy" em todas as imagens
  <img src={url} loading="lazy" alt={alt} />
  
  // Ou criar componente LazyImage
  export function LazyImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} loading="lazy" {...props} />;
  }
  ```

- [ ] **Debounce em inputs de busca** - 2h
  ```tsx
  // hooks/useDebounce.ts
  export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }

  // Usar em componentes
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data } = trpc.transactions.list.useQuery({ search: debouncedSearch });
  ```

- [ ] **Corrigir sidebar em mobile** - 1h
  - Já implementado com SidebarProvider
  - Testar em diferentes tamanhos

#### Dia 7 (6h)
- [ ] **Corrigir gráficos Chart.js responsivos** - 3h
  ```tsx
  // Adicionar responsive: true em options
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    // ...
  };
  ```

- [ ] **Testes mobile completos** - 3h
  - Testar em Chrome DevTools (3+ tamanhos)
  - Testar em dispositivo real (Android/iOS)
  - Corrigir problemas encontrados

**Entregável Sprint 2:** Sistema 100% responsivo e rápido

---

### Sprint 3 (Dias 8-11): ⚡ Otimizações e Localização
**Objetivo:** Performance e localização Brasil

#### Dia 8 (6h)
- [ ] **Corrigir queries N+1 mais críticas** - 6h
  ```typescript
  // Antes (N+1)
  const transactions = await db.getTransactions(userId);
  for (const t of transactions) {
    t.category = await db.getCategory(t.categoryId); // N queries
  }

  // Depois (1 query com join)
  const transactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: {
      category: true,
      account: true
    }
  });
  ```
  
  **Queries a otimizar:**
  - getTransactions (com category e account)
  - getInvestments (com transactions)
  - getGoals (com progress)
  - getBudgets (com spent)

#### Dia 9 (6h)
- [ ] **Adicionar 50+ bancos brasileiros** - 6h
  ```typescript
  // shared/banks.ts
  export const BRAZILIAN_BANKS = [
    // Grandes Bancos
    { id: 'itau', name: 'Itaú Unibanco', logo: '/banks/itau.png' },
    { id: 'bradesco', name: 'Bradesco', logo: '/banks/bradesco.png' },
    { id: 'santander', name: 'Santander', logo: '/banks/santander.png' },
    { id: 'caixa', name: 'Caixa Econômica Federal', logo: '/banks/caixa.png' },
    { id: 'bb', name: 'Banco do Brasil', logo: '/banks/bb.png' },
    
    // Bancos Digitais
    { id: 'nubank', name: 'Nubank', logo: '/banks/nubank.png' },
    { id: 'inter', name: 'Banco Inter', logo: '/banks/inter.png' },
    { id: 'c6', name: 'C6 Bank', logo: '/banks/c6.png' },
    { id: 'pagbank', name: 'PagBank', logo: '/banks/pagbank.png' },
    { id: 'picpay', name: 'PicPay', logo: '/banks/picpay.png' },
    { id: 'neon', name: 'Neon', logo: '/banks/neon.png' },
    { id: 'next', name: 'Next', logo: '/banks/next.png' },
    { id: 'digio', name: 'Digio', logo: '/banks/digio.png' },
    
    // Bancos Regionais
    { id: 'banrisul', name: 'Banrisul', logo: '/banks/banrisul.png' },
    { id: 'brb', name: 'BRB', logo: '/banks/brb.png' },
    { id: 'sicoob', name: 'Sicoob', logo: '/banks/sicoob.png' },
    { id: 'sicredi', name: 'Sicredi', logo: '/banks/sicredi.png' },
    
    // Corretoras
    { id: 'xp', name: 'XP Investimentos', logo: '/banks/xp.png' },
    { id: 'rico', name: 'Rico Investimentos', logo: '/banks/rico.png' },
    { id: 'clear', name: 'Clear Corretora', logo: '/banks/clear.png' },
    { id: 'btg', name: 'BTG Pactual', logo: '/banks/btg.png' },
    
    // ... adicionar mais 30 bancos
  ];
  ```
  
  - Atualizar dropdown de criação de conta
  - Adicionar logos dos bancos (baixar de sites oficiais)
  - Remover contas de teste estrangeiras

#### Dia 10 (6h)
- [ ] **Otimizar bundle size** - 6h
  ```bash
  # Analisar bundle
  pnpm add -D @rollup/plugin-visualizer
  
  # vite.config.ts
  import { visualizer } from '@rollup/plugin-visualizer';
  
  export default defineConfig({
    plugins: [
      visualizer({ open: true, gzipSize: true })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'chart-vendor': ['chart.js', 'react-chartjs-2'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
          }
        }
      }
    }
  });
  ```
  
  **Ações:**
  - Analisar bundle atual
  - Identificar dependências grandes
  - Code splitting por rota
  - Lazy load de componentes pesados
  - Remover dependências não usadas

#### Dia 11 (6h)
- [ ] **Implementar monitoramento básico** - 4h
  ```typescript
  // server/_core/metrics.ts
  export const metrics = {
    requests: 0,
    errors: 0,
    responseTime: [] as number[],
    
    recordRequest(duration: number) {
      this.requests++;
      this.responseTime.push(duration);
      if (this.responseTime.length > 1000) {
        this.responseTime.shift();
      }
    },
    
    recordError() {
      this.errors++;
    },
    
    getStats() {
      const avg = this.responseTime.reduce((a, b) => a + b, 0) / this.responseTime.length;
      const sorted = [...this.responseTime].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      
      return {
        requests: this.requests,
        errors: this.errors,
        errorRate: this.errors / this.requests,
        avgResponseTime: avg,
        p95ResponseTime: p95
      };
    }
  };
  
  // Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      metrics.recordRequest(duration);
      if (res.statusCode >= 500) {
        metrics.recordError();
      }
    });
    next();
  });
  
  // Endpoint de métricas (apenas admin)
  app.get('/api/metrics', (req, res) => {
    res.json(metrics.getStats());
  });
  ```

- [ ] **Testes de performance** - 2h
  - Lighthouse em 3 páginas principais
  - Medir tempo de resposta de APIs
  - Verificar bundle size final

**Entregável Sprint 3:** Sistema otimizado e 100% localizado

---

### Sprint 4 (Dias 12-14): 🎮 Funcionalidades e Testes
**Objetivo:** Completar features e preparar lançamento

#### Dia 12 (6h)
- [ ] **Página completa de conquistas** - 6h
  ```tsx
  // pages/Achievements.tsx
  export function Achievements() {
    const { data: achievements } = trpc.gamification.getAchievements.useQuery();
    const { data: userAchievements } = trpc.gamification.getUserAchievements.useQuery();
    
    const unlocked = userAchievements?.map(ua => ua.achievementId) || [];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>Conquistas</h1>
          <div className="text-sm text-muted-foreground">
            {unlocked.length} / {achievements?.length} desbloqueadas
          </div>
        </div>
        
        {/* Filtros */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unlocked">Desbloqueadas</TabsTrigger>
            <TabsTrigger value="locked">Bloqueadas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Grid de badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements?.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={unlocked.includes(achievement.id)}
            />
          ))}
        </div>
        
        {/* Histórico */}
        <div className="mt-8">
          <h2>Histórico</h2>
          <div className="space-y-2">
            {userAchievements?.map(ua => (
              <div key={ua.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <span>{ua.achievement.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{ua.achievement.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ua.unlockedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  ```

#### Dia 13 (6h)
- [ ] **Testes unitários essenciais** - 6h
  ```typescript
  // server/sanitize.test.ts
  describe('Sanitização de Inputs', () => {
    it('deve remover tags HTML', () => {
      const input = '<script>alert("xss")</script>Hello';
      expect(sanitizeInput(input)).toBe('Hello');
    });
  });
  
  // server/rateLimit.test.ts
  describe('Rate Limiting', () => {
    it('deve bloquear após 100 requisições', async () => {
      // ...
    });
  });
  
  // server/categories.test.ts
  describe('Categorias Padrão', () => {
    it('deve criar 13 categorias para novo usuário', async () => {
      const userId = 999;
      await createDefaultCategories(userId);
      const categories = await db.getCategoriesByUser(userId);
      expect(categories).toHaveLength(13);
    });
  });
  ```
  
  **Testes a criar:**
  - Sanitização XSS (5 testes)
  - Rate limiting (3 testes)
  - Criação de categorias (3 testes)
  - Queries otimizadas (5 testes)
  - Responsividade (manual)

#### Dia 14 (6h)
- [ ] **Testes de integração** - 3h
  - Fluxo completo de registro
  - Fluxo de criação de transação
  - Fluxo de criação de meta
  - Fluxo de gamificação

- [ ] **Checklist de lançamento** - 3h
  - Revisar todos os itens do checklist (ver abaixo)
  - Corrigir problemas encontrados
  - Preparar documentação

**Entregável Sprint 4:** Sistema pronto para beta público

---

## ✅ Checklist de Lançamento (Beta Público)

### Segurança ✅
- [ ] Rate limiting implementado e testado
- [ ] Todos os inputs sanitizados (XSS)
- [ ] HTTPS obrigatório (Manus já fornece)
- [ ] Logs de auditoria básicos
- [ ] Testes de segurança realizados

### Performance ⚡
- [ ] Lighthouse score >80 em 3 páginas
- [ ] Bundle size <1MB
- [ ] API response time <500ms (p95)
- [ ] Lazy loading de imagens implementado
- [ ] Queries N+1 mais críticas corrigidas

### UX/UI 📱
- [ ] 100% responsivo em mobile (testado em 3+ dispositivos)
- [ ] Skeleton loaders em 5 páginas principais
- [ ] Loading states consistentes
- [ ] Tabelas responsivas ou em cards
- [ ] Gráficos adaptam tamanho
- [ ] Sidebar colapsa em mobile

### Funcionalidades 🎯
- [ ] Categorias criadas automaticamente para novos usuários
- [ ] Página de conquistas completa
- [ ] 50+ bancos brasileiros no dropdown
- [ ] Sistema de gamificação funcional
- [ ] Exportação de relatórios funcionando

### Monitoramento 📊
- [ ] Métricas básicas configuradas
- [ ] Endpoint /api/metrics funcionando
- [ ] Logs centralizados (console.log estruturado)

### Testes 🧪
- [ ] 30+ testes unitários passando (cobertura >40%)
- [ ] Testes de integração dos fluxos principais
- [ ] Testes manuais em 3+ navegadores
- [ ] Testes mobile em iOS e Android

### Documentação 📚
- [ ] README atualizado
- [ ] FAQ para usuários
- [ ] Política de privacidade
- [ ] Termos de uso

---

## 📊 Métricas de Sucesso

### Após 7 Dias
- [ ] 0 bugs críticos reportados
- [ ] Taxa de erro <1%
- [ ] Lighthouse score >80
- [ ] Bundle size <1MB
- [ ] API response time <500ms (p95)

### Após 14 Dias
- [ ] 100 usuários beta testando
- [ ] Taxa de ativação >60%
- [ ] Retenção D7 >40%
- [ ] NPS >50
- [ ] 0 vulnerabilidades de segurança

---

## 🎯 Próximos Passos (Pós-Lançamento)

### Semana 3-4
1. Completar sistema de dividendos (frontend)
2. Análise de hábitos de gastos
3. Exportação PDF com gráficos
4. Onboarding interativo (react-joyride)
5. Atalhos de teclado (Ctrl+K)

### Mês 2
1. Modo escuro/claro toggle
2. PWA (Progressive Web App)
3. Notificações push
4. Testes E2E com Playwright
5. CI/CD automatizado

---

## 💡 Quick Wins Adicionais (Se Sobrar Tempo)

### 1. Helpers de Formatação (2h)
```typescript
// lib/format.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: format === 'short' ? 'short' : 'long'
  }).format(date);
}
```

### 2. Toast Hooks (1h)
```typescript
// hooks/useToast.ts
export function useSuccessToast() {
  const { toast } = useToast();
  return (message: string) => toast({ title: message, variant: 'success' });
}

export function useErrorToast() {
  const { toast } = useToast();
  return (message: string) => toast({ title: message, variant: 'destructive' });
}
```

### 3. Empty States (2h)
```tsx
// components/EmptyState.tsx
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
```

---

## 🚨 Riscos e Mitigações

### Risco 1: Não terminar em 14 dias
**Mitigação:** Priorizar P0 e P1, deixar P2 para depois

### Risco 2: Bugs em produção
**Mitigação:** Testes extensivos, lançamento beta fechado primeiro

### Risco 3: Performance ruim em mobile
**Mitigação:** Testar em dispositivos reais desde o início

### Risco 4: Usuários não ativam
**Mitigação:** Categorias automáticas, onboarding simplificado

---

## 📞 Suporte Durante Implementação

### Dúvidas Técnicas
- Consultar documentação do Manus
- Revisar código existente
- Testar incrementalmente

### Bloqueios
- Priorizar desbloqueio
- Buscar alternativas
- Pedir ajuda se necessário

---

**Conclusão:** Este plano é ambicioso mas realista. Foca no essencial para lançamento beta, deixando melhorias incrementais para depois. A chave é executar com disciplina e testar continuamente.

---

*Plano criado em 31/12/2025 baseado em análise Gemini 2.0 Flash*
