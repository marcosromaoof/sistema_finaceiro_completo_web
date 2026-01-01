# 🎯 Plano de Ação Priorizado - Organizai
**Data:** 31 de Dezembro de 2025  
**Objetivo:** Implementar correções críticas e melhorias de alto impacto  
**Estratégia:** Segurança PRIMEIRO → UX Mobile → Performance → Features

---

## 📊 Visão Geral do Plano

| Fase | Foco | Duração | Prioridade |
|------|------|---------|------------|
| **Fase 1** | 🔒 Segurança Crítica | 2 dias | P0 - CRÍTICO |
| **Fase 2** | 📱 UX Mobile Essencial | 3 dias | P1 - ALTO |
| **Fase 3** | ⚡ Performance Core | 2 dias | P1 - ALTO |
| **Fase 4** | 🎯 Features Prioritárias | 3 dias | P2 - MÉDIO |

**Total:** 10 dias de trabalho focado

---

# 🔴 FASE 1: Segurança Crítica (2 dias)
**Objetivo:** Eliminar vulnerabilidades de segurança ANTES de qualquer outra coisa

## Dia 1 - Manhã (4h): Integrar Rate Limiting

### Tarefa 1.1: Aplicar Rate Limiting no Servidor Express
**Tempo:** 2h | **Prioridade:** P0 - CRÍTICO

```typescript
// server/_core/index.ts
import { defaultRateLimiter, authRateLimiter } from './rateLimit';

// Aplicar rate limiting global
app.use(defaultRateLimiter);

// Rate limiting específico para autenticação
app.use('/api/oauth', authRateLimiter);

// Rate limiting para tRPC
app.use('/api/trpc', defaultRateLimiter);
```

**Checklist:**
- [ ] Importar rate limiters em `server/_core/index.ts`
- [ ] Aplicar `defaultRateLimiter` globalmente
- [ ] Aplicar `authRateLimiter` em `/api/oauth`
- [ ] Testar com 100+ requisições em 1 minuto
- [ ] Verificar resposta 429 (Too Many Requests)
- [ ] Verificar headers `X-RateLimit-*`

---

### Tarefa 1.2: Criar Endpoint de Métricas (Admin)
**Tempo:** 1h | **Prioridade:** P1

```typescript
// server/routers.ts - adicionar no router system
metrics: adminProcedure.query(async () => {
  const { getRateLimitStats } = await import('./_core/rateLimit');
  return getRateLimitStats();
}),
```

**Checklist:**
- [ ] Criar procedure `system.metrics`
- [ ] Restringir acesso apenas admin
- [ ] Testar endpoint
- [ ] Criar página admin de métricas (opcional)

---

### Tarefa 1.3: Testar Rate Limiting
**Tempo:** 1h | **Prioridade:** P0

**Checklist:**
- [ ] Testar 100 requisições em 1 minuto (deve bloquear)
- [ ] Testar 5 logins em 15 minutos (deve bloquear)
- [ ] Verificar que requisições normais passam
- [ ] Verificar logs de rate limiting
- [ ] Documentar comportamento

---

## Dia 1 - Tarde (4h): Integrar Sanitização XSS

### Tarefa 1.4: Sanitizar Procedures de Transações
**Tempo:** 2h | **Prioridade:** P0 - CRÍTICO

```typescript
// server/routers.ts
import { sanitizeText, sanitizeNumber } from './_core/sanitize';

// No procedure transactions.create
create: protectedProcedure
  .input(z.object({
    description: z.string(),
    amount: z.number(),
    categoryId: z.number(),
    // ...
  }))
  .mutation(async ({ ctx, input }) => {
    // Sanitizar ANTES de salvar
    const sanitizedInput = {
      ...input,
      description: sanitizeText(input.description),
      amount: sanitizeNumber(input.amount),
      notes: input.notes ? sanitizeText(input.notes) : null
    };
    
    return await db.createTransaction({
      ...sanitizedInput,
      userId: ctx.user.id
    });
  }),
```

**Procedures a sanitizar:**
- [ ] `transactions.create`
- [ ] `transactions.update`
- [ ] `transactions.import` (CSV)

---

### Tarefa 1.5: Sanitizar Procedures de Categorias, Metas e Contas
**Tempo:** 1.5h | **Prioridade:** P0

**Categorias:**
- [ ] `categories.create` - sanitizar `name`
- [ ] `categories.update` - sanitizar `name`

**Metas:**
- [ ] `goals.create` - sanitizar `name`, `description`
- [ ] `goals.update` - sanitizar `name`, `description`

**Contas:**
- [ ] `accounts.create` - sanitizar `name`
- [ ] `accounts.update` - sanitizar `name`

---

### Tarefa 1.6: Sanitizar Chat IA
**Tempo:** 0.5h | **Prioridade:** P1

```typescript
// No procedure aiChat.sendMessage
sendMessage: protectedProcedure
  .input(z.object({
    message: z.string(),
    conversationId: z.number().optional()
  }))
  .mutation(async ({ ctx, input }) => {
    const sanitizedMessage = sanitizeText(input.message);
    // ... resto do código
  }),
```

**Checklist:**
- [ ] Sanitizar input do usuário
- [ ] Sanitizar resposta da IA (se necessário)
- [ ] Testar com inputs maliciosos

---

## Dia 2 (8h): Integrar Categorias Automáticas + Testes

### Tarefa 1.7: Integrar Criação de Categorias no OAuth
**Tempo:** 3h | **Prioridade:** P0 - CRÍTICO

```typescript
// server/_core/oauth.ts
import { createDefaultCategories } from '../db-default-categories';

// No callback OAuth, após criar/atualizar usuário
const user = await db.upsertUser({
  openId: payload.openId,
  name: payload.name
});

// Criar categorias padrão para novos usuários
try {
  await createDefaultCategories(user.id);
  console.log(`[OAuth] Categorias padrão criadas para usuário ${user.id}`);
} catch (error) {
  console.error(`[OAuth] Erro ao criar categorias padrão:`, error);
  // Não bloqueia o login se falhar
}
```

**Checklist:**
- [ ] Importar `createDefaultCategories` em `oauth.ts`
- [ ] Chamar após `upsertUser`
- [ ] Adicionar try/catch para não bloquear login
- [ ] Testar com novo usuário (criar conta teste)
- [ ] Verificar que 13 categorias foram criadas
- [ ] Verificar que não cria duplicatas

---

### Tarefa 1.8: Criar Procedure para Migração de Usuários Existentes
**Tempo:** 2h | **Prioridade:** P1

```typescript
// server/routers.ts - adicionar no router system
createDefaultCategoriesForAll: adminProcedure
  .mutation(async () => {
    const { createDefaultCategoriesForUsers } = await import('./db-default-categories');
    
    // Buscar todos os usuários
    const users = await db.getAllUsers();
    const userIds = users.map(u => u.id);
    
    // Criar categorias para todos
    const stats = await createDefaultCategoriesForUsers(userIds);
    
    return {
      message: `Categorias criadas para ${stats.success} usuários`,
      stats
    };
  }),
```

**Checklist:**
- [ ] Criar procedure admin
- [ ] Criar função `getAllUsers()` em `db.ts`
- [ ] Testar com usuários existentes
- [ ] Executar migração para usuários 1, 2, 3
- [ ] Verificar logs de sucesso

---

### Tarefa 1.9: Testes de Segurança Completos
**Tempo:** 3h | **Prioridade:** P0

**Testes XSS:**
- [ ] Testar `<script>alert('xss')</script>` em descrição de transação
- [ ] Testar `<img src=x onerror=alert(1)>` em nome de categoria
- [ ] Testar `javascript:alert(1)` em notas
- [ ] Verificar que nenhum script é executado
- [ ] Verificar que dados são salvos sanitizados

**Testes Rate Limiting:**
- [ ] Script para 100 requisições em 1 minuto
- [ ] Verificar bloqueio após limite
- [ ] Verificar reset após janela
- [ ] Testar diferentes IPs

**Testes Categorias:**
- [ ] Criar novo usuário via OAuth
- [ ] Verificar 13 categorias criadas
- [ ] Tentar criar transação (deve funcionar)
- [ ] Fazer login novamente (não deve duplicar categorias)

---

## 📊 Entregáveis Fase 1

- ✅ Rate limiting protegendo todas as rotas
- ✅ Todos os inputs sanitizados (XSS bloqueado)
- ✅ Categorias automáticas para novos usuários
- ✅ Testes de segurança passando
- ✅ Sistema 100% seguro para beta público

---

# 📱 FASE 2: UX Mobile Essencial (3 dias)
**Objetivo:** Sistema 100% responsivo e rápido em dispositivos móveis

## Dia 3 (8h): Skeleton Loaders

### Tarefa 2.1: Criar Componentes Skeleton
**Tempo:** 2h | **Prioridade:** P1 - ALTO

```tsx
// client/src/components/skeletons/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-lg" />
        <div className="h-80 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

// TransactionsSkeleton.tsx
export function TransactionsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="w-12 h-12 bg-muted-foreground/20 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
            <div className="h-3 bg-muted-foreground/20 rounded w-1/4" />
          </div>
          <div className="h-6 bg-muted-foreground/20 rounded w-20" />
        </div>
      ))}
    </div>
  );
}
```

**Skeletons a criar:**
- [ ] `DashboardSkeleton.tsx`
- [ ] `TransactionsSkeleton.tsx`
- [ ] `InvestmentsSkeleton.tsx`
- [ ] `ReportsSkeleton.tsx`
- [ ] `AchievementsSkeleton.tsx`

---

### Tarefa 2.2: Integrar Skeletons nas Páginas
**Tempo:** 3h | **Prioridade:** P1

```tsx
// client/src/pages/Home.tsx
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

export function Home() {
  const { data, isLoading } = trpc.dashboard.getSummary.useQuery();
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div>
      {/* conteúdo real */}
    </div>
  );
}
```

**Páginas a integrar:**
- [ ] `Home.tsx` (Dashboard)
- [ ] `Transactions.tsx`
- [ ] `Investments.tsx`
- [ ] `Reports.tsx`
- [ ] `Achievements.tsx`

---

### Tarefa 2.3: Testar Skeletons
**Tempo:** 1h | **Prioridade:** P1

**Checklist:**
- [ ] Testar em conexão lenta (Chrome DevTools → Network → Slow 3G)
- [ ] Verificar animação suave
- [ ] Verificar que skeleton desaparece quando dados carregam
- [ ] Testar em mobile (3+ tamanhos)
- [ ] Ajustar tamanhos se necessário

---

### Tarefa 2.4: Lazy Loading de Imagens
**Tempo:** 2h | **Prioridade:** P1

```tsx
// Opção 1: Nativo
<img src={url} loading="lazy" alt={alt} />

// Opção 2: Componente reutilizável
// components/LazyImage.tsx
export function LazyImage({ src, alt, ...props }: ImageProps) {
  return (
    <img 
      src={src} 
      alt={alt} 
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
```

**Checklist:**
- [ ] Adicionar `loading="lazy"` em todas as imagens
- [ ] Criar componente `LazyImage` (opcional)
- [ ] Substituir `<img>` por `<LazyImage>` (se criado)
- [ ] Testar carregamento progressivo
- [ ] Verificar bundle size (deve reduzir)

---

## Dia 4 (8h): Tabelas Responsivas

### Tarefa 2.5: Tornar Tabela de Transações Responsiva
**Tempo:** 3h | **Prioridade:** P1 - ALTO

```tsx
// client/src/pages/Transactions.tsx

// Desktop: Tabela normal
<div className="hidden md:block overflow-x-auto">
  <table className="min-w-full">
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Categoria</th>
        <th>Valor</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {transactions.map(t => (
        <tr key={t.id}>
          <td>{formatDate(t.date)}</td>
          <td>{t.description}</td>
          <td>{t.category.name}</td>
          <td>{formatCurrency(t.amount)}</td>
          <td>...</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

// Mobile: Cards
<div className="md:hidden space-y-4">
  {transactions.map(t => (
    <Card key={t.id} className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{t.category.icon}</span>
          <div>
            <p className="font-medium">{t.description}</p>
            <p className="text-sm text-muted-foreground">
              {t.category.name}
            </p>
          </div>
        </div>
        <p className={cn(
          "font-semibold",
          t.type === 'income' ? "text-green-500" : "text-red-500"
        )}>
          {formatCurrency(t.amount)}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatDate(t.date)}</span>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  ))}
</div>
```

**Checklist:**
- [ ] Criar versão desktop (tabela)
- [ ] Criar versão mobile (cards)
- [ ] Usar classes `hidden md:block` e `md:hidden`
- [ ] Testar em 3+ tamanhos de tela
- [ ] Ajustar espaçamentos

---

### Tarefa 2.6: Tornar Outras Tabelas Responsivas
**Tempo:** 4h | **Prioridade:** P1

**Tabelas a converter:**
- [ ] Contas (`Accounts.tsx`)
- [ ] Investimentos (`Investments.tsx`)
- [ ] Dívidas (`Debts.tsx`)
- [ ] Orçamentos (`Budgets.tsx`)

**Padrão:**
1. Desktop: Tabela com scroll horizontal
2. Mobile: Cards com informações principais
3. Ações: Menu dropdown em mobile

---

### Tarefa 2.7: Testar Responsividade
**Tempo:** 1h | **Prioridade:** P1

**Checklist:**
- [ ] Testar em Chrome DevTools (5+ tamanhos)
- [ ] Testar em dispositivo Android real
- [ ] Testar em dispositivo iOS real (se possível)
- [ ] Verificar touch targets (mínimo 44x44px)
- [ ] Verificar scroll suave

---

## Dia 5 (8h): Debounce + Gráficos Responsivos

### Tarefa 2.8: Implementar Hook useDebounce
**Tempo:** 1h | **Prioridade:** P1

```typescript
// client/src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

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
```

**Checklist:**
- [ ] Criar hook `useDebounce`
- [ ] Adicionar testes (opcional)
- [ ] Documentar uso

---

### Tarefa 2.9: Aplicar Debounce em Buscas
**Tempo:** 2h | **Prioridade:** P1

```tsx
// Exemplo: Busca de transações
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const { data } = trpc.transactions.list.useQuery({
  search: debouncedSearch, // Usa valor debounced
  // ...
});

return (
  <Input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Buscar transações..."
  />
);
```

**Páginas a aplicar:**
- [ ] Transações
- [ ] Contas
- [ ] Categorias
- [ ] Investimentos
- [ ] Busca global (se existir)

---

### Tarefa 2.10: Tornar Gráficos Responsivos
**Tempo:** 3h | **Prioridade:** P1

```tsx
// Adicionar responsive: true em options
const options = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: window.innerWidth < 768 ? 1 : 2, // 1:1 mobile, 2:1 desktop
  plugins: {
    legend: {
      position: window.innerWidth < 768 ? 'bottom' : 'top',
    }
  }
};
```

**Gráficos a ajustar:**
- [ ] Gráfico de receitas vs despesas (Dashboard)
- [ ] Gráfico donut de categorias (Dashboard)
- [ ] Gráfico de evolução patrimonial
- [ ] Gráfico de investimentos
- [ ] Gráfico de orçamentos

**Checklist:**
- [ ] Adicionar `responsive: true`
- [ ] Ajustar `aspectRatio` por breakpoint
- [ ] Mover legenda para baixo em mobile
- [ ] Reduzir font size em mobile
- [ ] Testar em 3+ tamanhos

---

### Tarefa 2.11: Testar UX Mobile Completa
**Tempo:** 2h | **Prioridade:** P1

**Checklist:**
- [ ] Testar fluxo completo em mobile
- [ ] Criar transação em mobile
- [ ] Visualizar dashboard em mobile
- [ ] Buscar transações (verificar debounce)
- [ ] Verificar gráficos adaptam
- [ ] Verificar tabelas viram cards
- [ ] Verificar skeleton loaders
- [ ] Verificar lazy loading de imagens

---

## 📊 Entregáveis Fase 2

- ✅ Skeleton loaders em 5 páginas principais
- ✅ Todas as tabelas responsivas (desktop + mobile)
- ✅ Debounce em todas as buscas
- ✅ Gráficos adaptam tamanho
- ✅ Lazy loading de imagens
- ✅ Sistema 100% responsivo mobile

---

# ⚡ FASE 3: Performance Core (2 dias)
**Objetivo:** Sistema rápido e otimizado

## Dia 6 (8h): Otimizar Queries N+1

### Tarefa 3.1: Otimizar getTransactions
**Tempo:** 2h | **Prioridade:** P1

```typescript
// server/db.ts - ANTES (N+1)
export async function getTransactions(userId: number) {
  const transactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId)
  });
  
  // N queries adicionais
  for (const t of transactions) {
    t.category = await db.query.categories.findFirst({
      where: eq(categories.id, t.categoryId)
    });
    t.account = await db.query.accounts.findFirst({
      where: eq(accounts.id, t.accountId)
    });
  }
  
  return transactions;
}

// DEPOIS (1 query com joins)
export async function getTransactions(userId: number) {
  return await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: {
      category: true,
      account: true
    },
    orderBy: desc(transactions.date)
  });
}
```

**Checklist:**
- [ ] Identificar queries N+1 em `getTransactions`
- [ ] Adicionar `with` para joins
- [ ] Testar que dados retornam corretamente
- [ ] Medir tempo de resposta (antes vs depois)
- [ ] Verificar que frontend continua funcionando

---

### Tarefa 3.2: Otimizar Outras Queries
**Tempo:** 4h | **Prioridade:** P1

**Queries a otimizar:**
- [ ] `getInvestments` (incluir transactions)
- [ ] `getGoals` (incluir progress)
- [ ] `getBudgets` (incluir spent calculation)
- [ ] `getDebts` (incluir payments)
- [ ] `getAccounts` (incluir balance)

**Padrão:**
1. Identificar N+1
2. Adicionar `with` ou joins
3. Testar
4. Medir performance

---

### Tarefa 3.3: Criar Índices no Banco
**Tempo:** 2h | **Prioridade:** P1

```typescript
// drizzle/schema.ts
export const transactions = sqliteTable('transactions', {
  // ... campos
}, (table) => ({
  userIdIdx: index('transactions_user_id_idx').on(table.userId),
  dateIdx: index('transactions_date_idx').on(table.date),
  categoryIdIdx: index('transactions_category_id_idx').on(table.categoryId),
}));
```

**Índices a criar:**
- [ ] `transactions.userId`
- [ ] `transactions.date`
- [ ] `transactions.categoryId`
- [ ] `accounts.userId`
- [ ] `goals.userId`
- [ ] `budgets.userId`

**Checklist:**
- [ ] Adicionar índices no schema
- [ ] Rodar `pnpm db:push`
- [ ] Verificar índices criados
- [ ] Medir performance (queries devem ser mais rápidas)

---

## Dia 7 (8h): Localização Brasil + Bundle

### Tarefa 3.4: Adicionar 50+ Bancos Brasileiros
**Tempo:** 4h | **Prioridade:** P1

```typescript
// shared/banks.ts
export const BRAZILIAN_BANKS = [
  // Grandes Bancos
  { id: 'itau', name: 'Itaú Unibanco', code: '341' },
  { id: 'bradesco', name: 'Bradesco', code: '237' },
  { id: 'santander', name: 'Santander', code: '033' },
  { id: 'caixa', name: 'Caixa Econômica Federal', code: '104' },
  { id: 'bb', name: 'Banco do Brasil', code: '001' },
  
  // Bancos Digitais
  { id: 'nubank', name: 'Nubank', code: '260' },
  { id: 'inter', name: 'Banco Inter', code: '077' },
  { id: 'c6', name: 'C6 Bank', code: '336' },
  { id: 'pagbank', name: 'PagBank', code: '290' },
  { id: 'picpay', name: 'PicPay', code: '380' },
  { id: 'neon', name: 'Neon', code: '735' },
  { id: 'next', name: 'Next', code: '237' },
  { id: 'digio', name: 'Digio', code: '335' },
  { id: 'original', name: 'Banco Original', code: '212' },
  { id: 'safra', name: 'Banco Safra', code: '422' },
  
  // Bancos Regionais
  { id: 'banrisul', name: 'Banrisul', code: '041' },
  { id: 'brb', name: 'BRB', code: '070' },
  { id: 'sicoob', name: 'Sicoob', code: '756' },
  { id: 'sicredi', name: 'Sicredi', code: '748' },
  { id: 'banpara', name: 'Banpará', code: '037' },
  
  // Corretoras
  { id: 'xp', name: 'XP Investimentos', code: '102' },
  { id: 'rico', name: 'Rico Investimentos', code: '352' },
  { id: 'clear', name: 'Clear Corretora', code: '352' },
  { id: 'btg', name: 'BTG Pactual', code: '208' },
  { id: 'modal', name: 'Modal', code: '746' },
  
  // Fintechs
  { id: 'mercadopago', name: 'Mercado Pago', code: '323' },
  { id: 'pagseguro', name: 'PagSeguro', code: '290' },
  { id: 'stone', name: 'Stone Pagamentos', code: '197' },
  { id: 'will', name: 'Will Bank', code: '280' },
  
  // Adicionar mais 20+ bancos...
];
```

**Checklist:**
- [ ] Criar arquivo `shared/banks.ts`
- [ ] Adicionar 50+ bancos com nome e código
- [ ] Atualizar dropdown de criação de conta
- [ ] Adicionar busca de banco
- [ ] Remover bancos estrangeiros de teste
- [ ] Testar criação de conta com banco BR

---

### Tarefa 3.5: Otimizar Bundle Size
**Tempo:** 4h | **Prioridade:** P2

```bash
# Instalar analisador
pnpm add -D @rollup/plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from '@rollup/plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... outros plugins
    visualizer({ 
      open: true, 
      gzipSize: true,
      filename: 'dist/stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs'
          ],
          'trpc-vendor': ['@trpc/client', '@trpc/react-query', '@tanstack/react-query']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // 1MB
  }
});
```

**Checklist:**
- [ ] Instalar visualizer
- [ ] Rodar build e analisar bundle
- [ ] Identificar dependências grandes (>100KB)
- [ ] Implementar code splitting
- [ ] Lazy load rotas pesadas
- [ ] Verificar tree shaking funcionando
- [ ] Remover dependências não usadas
- [ ] Meta: Bundle <1MB

---

## 📊 Entregáveis Fase 3

- ✅ Queries N+1 otimizadas (5+ queries)
- ✅ Índices no banco criados
- ✅ 50+ bancos brasileiros adicionados
- ✅ Bundle size otimizado (<1MB)
- ✅ Sistema 200% mais rápido

---

# 🎯 FASE 4: Features Prioritárias (3 dias)
**Objetivo:** Completar funcionalidades de alto impacto

## Dia 8 (8h): Página de Conquistas

### Tarefa 4.1: Criar Página de Conquistas
**Tempo:** 6h | **Prioridade:** P2

```tsx
// client/src/pages/Achievements.tsx
export function Achievements() {
  const { data: achievements, isLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: userAchievements } = trpc.gamification.getUserAchievements.useQuery();
  
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const unlocked = userAchievements?.map(ua => ua.achievementId) || [];
  
  const filteredAchievements = achievements?.filter(a => {
    if (filter === 'unlocked') return unlocked.includes(a.id);
    if (filter === 'locked') return !unlocked.includes(a.id);
    return true;
  });
  
  if (isLoading) return <AchievementsSkeleton />;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conquistas</h1>
          <p className="text-muted-foreground">
            {unlocked.length} de {achievements?.length} desbloqueadas
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {userAchievements?.reduce((sum, ua) => sum + ua.achievement.points, 0)} XP
          </p>
          <p className="text-sm text-muted-foreground">Pontos totais</p>
        </div>
      </div>
      
      {/* Filtros */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({achievements?.length})
          </TabsTrigger>
          <TabsTrigger value="unlocked">
            Desbloqueadas ({unlocked.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Bloqueadas ({(achievements?.length || 0) - unlocked.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Grid de Conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements?.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={unlocked.includes(achievement.id)}
            unlockedAt={userAchievements?.find(ua => ua.achievementId === achievement.id)?.unlockedAt}
          />
        ))}
      </div>
      
      {/* Histórico */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Histórico</h2>
        <div className="space-y-2">
          {userAchievements
            ?.sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
            .map(ua => (
              <div key={ua.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <span className="text-4xl">{ua.achievement.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{ua.achievement.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ua.achievement.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(ua.unlockedAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    +{ua.achievement.points} XP
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

**Checklist:**
- [ ] Criar página `Achievements.tsx`
- [ ] Criar componente `AchievementCard`
- [ ] Criar skeleton `AchievementsSkeleton`
- [ ] Adicionar filtros (todas/desbloqueadas/bloqueadas)
- [ ] Adicionar grid responsivo
- [ ] Adicionar histórico cronológico
- [ ] Adicionar rota em `App.tsx`
- [ ] Adicionar link no menu

---

### Tarefa 4.2: Melhorar AchievementCard
**Tempo:** 2h | **Prioridade:** P2

```tsx
// components/AchievementCard.tsx
export function AchievementCard({ achievement, unlocked, unlockedAt }) {
  return (
    <Card className={cn(
      "p-6 transition-all hover:scale-105",
      unlocked ? "bg-gradient-to-br from-primary/10 to-primary/5" : "opacity-60"
    )}>
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Ícone */}
        <div className={cn(
          "text-6xl",
          !unlocked && "grayscale"
        )}>
          {achievement.icon}
        </div>
        
        {/* Nome */}
        <h3 className="font-bold text-lg">{achievement.name}</h3>
        
        {/* Descrição */}
        <p className="text-sm text-muted-foreground">
          {achievement.description}
        </p>
        
        {/* Pontos */}
        <div className="flex items-center gap-2">
          <Badge variant={unlocked ? "default" : "secondary"}>
            {achievement.points} XP
          </Badge>
          {unlocked && unlockedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(unlockedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
        
        {/* Status */}
        {unlocked ? (
          <Badge variant="success" className="w-full">
            ✓ Desbloqueada
          </Badge>
        ) : (
          <Badge variant="outline" className="w-full">
            🔒 Bloqueada
          </Badge>
        )}
      </div>
    </Card>
  );
}
```

**Checklist:**
- [ ] Criar componente `AchievementCard`
- [ ] Adicionar efeito hover
- [ ] Adicionar gradiente para desbloqueadas
- [ ] Adicionar grayscale para bloqueadas
- [ ] Adicionar badges de status
- [ ] Testar em mobile

---

## Dia 9-10 (16h): Testes Completos

### Tarefa 4.3: Testes Unitários Adicionais
**Tempo:** 6h | **Prioridade:** P1

**Testes a criar:**
- [ ] Testes de queries otimizadas (verificar joins)
- [ ] Testes de debounce (verificar delay)
- [ ] Testes de lazy loading (verificar atributo)
- [ ] Testes de responsividade (verificar classes)
- [ ] Testes de bancos brasileiros (verificar lista)

**Meta:** 50+ testes passando

---

### Tarefa 4.4: Testes de Integração
**Tempo:** 6h | **Prioridade:** P1

**Fluxos a testar:**
1. **Registro completo:**
   - [ ] Criar conta via OAuth
   - [ ] Verificar 13 categorias criadas
   - [ ] Criar primeira transação
   - [ ] Verificar dashboard atualiza

2. **Fluxo de transação:**
   - [ ] Criar transação
   - [ ] Editar transação
   - [ ] Deletar transação
   - [ ] Importar CSV
   - [ ] Verificar sanitização

3. **Fluxo de gamificação:**
   - [ ] Desbloquear conquista
   - [ ] Verificar notificação
   - [ ] Verificar XP atualiza
   - [ ] Verificar página de conquistas

4. **Fluxo mobile:**
   - [ ] Navegar em mobile
   - [ ] Criar transação em mobile
   - [ ] Verificar tabelas viram cards
   - [ ] Verificar gráficos adaptam

---

### Tarefa 4.5: Testes de Performance
**Tempo:** 4h | **Prioridade:** P1

**Lighthouse Audits:**
- [ ] Dashboard (meta: >80)
- [ ] Transações (meta: >80)
- [ ] Landing Page (meta: >90)

**Métricas a medir:**
- [ ] First Contentful Paint (meta: <2s)
- [ ] Largest Contentful Paint (meta: <2.5s)
- [ ] Time to Interactive (meta: <3.8s)
- [ ] Total Blocking Time (meta: <300ms)
- [ ] Cumulative Layout Shift (meta: <0.1)

**API Performance:**
- [ ] Tempo de resposta médio (meta: <200ms)
- [ ] Tempo de resposta p95 (meta: <500ms)
- [ ] Taxa de erro (meta: <1%)

---

## 📊 Entregáveis Fase 4

- ✅ Página de conquistas completa
- ✅ 50+ testes unitários passando
- ✅ Testes de integração dos fluxos principais
- ✅ Lighthouse score >80 em 3 páginas
- ✅ Sistema pronto para beta público

---

# ✅ Checklist Final de Lançamento

## Segurança
- [ ] Rate limiting implementado e testado
- [ ] Todos os inputs sanitizados (XSS)
- [ ] HTTPS obrigatório ✅
- [ ] Logs de auditoria básicos
- [ ] Testes de segurança passando

## Performance
- [ ] Lighthouse score >80 em 3 páginas
- [ ] Bundle size <1MB
- [ ] API response time <500ms (p95)
- [ ] Lazy loading de imagens ✅
- [ ] Queries N+1 otimizadas
- [ ] Índices no banco criados

## UX/UI
- [ ] 100% responsivo mobile
- [ ] Skeleton loaders em 5 páginas
- [ ] Loading states consistentes
- [ ] Tabelas responsivas (desktop + mobile)
- [ ] Gráficos adaptam tamanho
- [ ] Debounce em buscas

## Funcionalidades
- [ ] Categorias automáticas para novos usuários
- [ ] Página de conquistas completa
- [ ] 50+ bancos brasileiros
- [ ] Sistema de gamificação ✅
- [ ] Exportação de relatórios ✅

## Testes
- [ ] 50+ testes unitários passando
- [ ] Testes de integração dos fluxos principais
- [ ] Testes manuais em 3+ navegadores
- [ ] Testes mobile em iOS e Android

## Monitoramento
- [ ] Métricas básicas configuradas
- [ ] Endpoint /api/metrics funcionando
- [ ] Logs estruturados

---

# 📊 Resumo de Tempo

| Fase | Duração | Prioridade |
|------|---------|------------|
| Fase 1: Segurança | 2 dias (16h) | P0 - CRÍTICO |
| Fase 2: UX Mobile | 3 dias (24h) | P1 - ALTO |
| Fase 3: Performance | 2 dias (16h) | P1 - ALTO |
| Fase 4: Features + Testes | 3 dias (24h) | P2 - MÉDIO |
| **TOTAL** | **10 dias (80h)** | |

---

# 🎯 Próximos Passos Após Plano

1. **Começar IMEDIATAMENTE pela Fase 1** (Segurança é CRÍTICO)
2. **Não pular fases** - cada uma depende da anterior
3. **Testar continuamente** - não deixar testes para o final
4. **Documentar problemas** - criar issues para bugs encontrados
5. **Comunicar progresso** - atualizar todo.md diariamente

---

**🚀 Vamos começar? Recomendo iniciar pela Tarefa 1.1 (Rate Limiting) AGORA!**
