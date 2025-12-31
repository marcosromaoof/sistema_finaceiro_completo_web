import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Stripe subscription fields
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "past_due", "trialing", "incomplete"]),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "premium", "family"]).default("free").notNull(),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contas financeiras (corrente, poupança, cartão de crédito, investimentos, empréstimos)
 */
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["checking", "savings", "credit_card", "investment", "loan", "other"]).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditLimit: decimal("creditLimit", { precision: 15, scale: 2 }),
  institution: varchar("institution", { length: 255 }),
  accountNumber: varchar("accountNumber", { length: 100 }),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("accounts_userId_idx").on(table.userId),
}));

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

/**
 * Categorias de transações
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  color: varchar("color", { length: 7 }).default("#6b7280"),
  icon: varchar("icon", { length: 50 }),
  parentId: int("parentId"),
  isSystem: boolean("isSystem").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("categories_userId_idx").on(table.userId),
}));

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Transações financeiras
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId").notNull(),
  categoryId: int("categoryId"),
  type: mysqlEnum("type", ["income", "expense", "transfer"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  isPending: boolean("isPending").default(false).notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurringFrequency: mysqlEnum("recurringFrequency", ["daily", "weekly", "monthly", "yearly"]),
  tags: text("tags"),
  notes: text("notes"),
  attachmentUrl: text("attachmentUrl"),
  transferAccountId: int("transferAccountId"),
  aiCategorized: boolean("aiCategorized").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("transactions_userId_idx").on(table.userId),
  accountIdIdx: index("transactions_accountId_idx").on(table.accountId),
  dateIdx: index("transactions_date_idx").on(table.date),
}));

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Orçamentos mensais por categoria
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM format
  spent: decimal("spent", { precision: 15, scale: 2 }).default("0.00").notNull(),
  rollover: boolean("rollover").default(false).notNull(),
  alertThreshold: int("alertThreshold").default(80).notNull(), // Percentage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("budgets_userId_idx").on(table.userId),
  periodIdx: index("budgets_period_idx").on(table.period),
}));

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Metas financeiras
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("currentAmount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  targetDate: timestamp("targetDate"),
  category: mysqlEnum("category", ["short_term", "medium_term", "long_term"]).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#10b981"),
  icon: varchar("icon", { length: 50 }),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("goals_userId_idx").on(table.userId),
}));

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * Contribuições para metas
 */
export const goalContributions = mysqlTable("goalContributions", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  goalIdIdx: index("goalContributions_goalId_idx").on(table.goalId),
}));

export type GoalContribution = typeof goalContributions.$inferSelect;
export type InsertGoalContribution = typeof goalContributions.$inferInsert;

/**
 * Dívidas e empréstimos
 */
export const debts = mysqlTable("debts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
  remainingAmount: decimal("remainingAmount", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).notNull(), // Annual percentage
  minimumPayment: decimal("minimumPayment", { precision: 15, scale: 2 }),
  dueDay: int("dueDay"), // Day of month
  startDate: timestamp("startDate").notNull(),
  payoffStrategy: mysqlEnum("payoffStrategy", ["snowball", "avalanche", "custom"]).default("avalanche"),
  creditor: varchar("creditor", { length: 255 }),
  isPaidOff: boolean("isPaidOff").default(false).notNull(),
  paidOffAt: timestamp("paidOffAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("debts_userId_idx").on(table.userId),
}));

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

/**
 * Pagamentos de dívidas
 */
export const debtPayments = mysqlTable("debtPayments", {
  id: int("id").autoincrement().primaryKey(),
  debtId: int("debtId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  principalAmount: decimal("principalAmount", { precision: 15, scale: 2 }).notNull(),
  interestAmount: decimal("interestAmount", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  debtIdIdx: index("debtPayments_debtId_idx").on(table.debtId),
}));

export type DebtPayment = typeof debtPayments.$inferSelect;
export type InsertDebtPayment = typeof debtPayments.$inferInsert;

/**
 * Investimentos
 */
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["stocks", "bonds", "funds", "real_estate", "crypto", "other"]).notNull(),
  ticker: varchar("ticker", { length: 20 }),
  quantity: decimal("quantity", { precision: 15, scale: 4 }),
  purchasePrice: decimal("purchasePrice", { precision: 15, scale: 2 }).notNull(),
  currentPrice: decimal("currentPrice", { precision: 15, scale: 2 }),
  totalInvested: decimal("totalInvested", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("currentValue", { precision: 15, scale: 2 }),
  purchaseDate: timestamp("purchaseDate").notNull(),
  lastUpdated: timestamp("lastUpdated"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("investments_userId_idx").on(table.userId),
}));

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

/**
 * Dividendos e rendimentos de investimentos
 */
export const investmentReturns = mysqlTable("investmentReturns", {
  id: int("id").autoincrement().primaryKey(),
  investmentId: int("investmentId").notNull(),
  type: mysqlEnum("type", ["dividend", "interest", "capital_gain"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  investmentIdIdx: index("investmentReturns_investmentId_idx").on(table.investmentId),
}));

export type InvestmentReturn = typeof investmentReturns.$inferSelect;
export type InsertInvestmentReturn = typeof investmentReturns.$inferInsert;

/**
 * Planejamento de aposentadoria
 */
export const retirementPlans = mysqlTable("retirementPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  currentAge: int("currentAge").notNull(),
  retirementAge: int("retirementAge").notNull(),
  currentSavings: decimal("currentSavings", { precision: 15, scale: 2 }).default("0.00").notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }),
  monthlyContribution: decimal("monthlyContribution", { precision: 15, scale: 2 }).notNull(),
  expectedReturn: decimal("expectedReturn", { precision: 5, scale: 2 }).notNull(), // Annual percentage
  inflationRate: decimal("inflationRate", { precision: 5, scale: 2 }).default("3.50").notNull(),
  desiredMonthlyIncome: decimal("desiredMonthlyIncome", { precision: 15, scale: 2 }),
  projectedValue: decimal("projectedValue", { precision: 15, scale: 2 }),
  lastCalculated: timestamp("lastCalculated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("retirementPlans_userId_idx").on(table.userId),
}));

export type RetirementPlan = typeof retirementPlans.$inferSelect;
export type InsertRetirementPlan = typeof retirementPlans.$inferInsert;

/**
 * Regras de categorização automática
 */
export const categorizationRules = mysqlTable("categorizationRules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  pattern: varchar("pattern", { length: 255 }).notNull(),
  matchType: mysqlEnum("matchType", ["contains", "starts_with", "ends_with", "exact"]).default("contains").notNull(),
  priority: int("priority").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("categorizationRules_userId_idx").on(table.userId),
}));

export type CategorizationRule = typeof categorizationRules.$inferSelect;
export type InsertCategorizationRule = typeof categorizationRules.$inferInsert;

/**
 * Alertas e notificações
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["budget_warning", "bill_due", "goal_milestone", "low_balance", "unusual_spending", "custom"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("alerts_userId_idx").on(table.userId),
  isReadIdx: index("alerts_isRead_idx").on(table.isRead),
}));

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;


/**
 * Tickets de suporte
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["technical", "billing", "feature", "other"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index("supportTickets_userId_idx").on(table.userId),
  statusIdx: index("supportTickets_status_idx").on(table.status),
}));

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Dividendos e Juros recebidos de investimentos
 */
export const dividends = mysqlTable("dividends", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  investmentId: int("investmentId").notNull(),
  type: mysqlEnum("type", ["dividend", "jcp", "interest", "bonus"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: timestamp("paymentDate").notNull(),
  referenceDate: timestamp("referenceDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("dividends_userId_idx").on(table.userId),
  investmentIdIdx: index("dividends_investmentId_idx").on(table.investmentId),
  paymentDateIdx: index("dividends_paymentDate_idx").on(table.paymentDate),
}));

export type Dividend = typeof dividends.$inferSelect;
export type InsertDividend = typeof dividends.$inferInsert;

/**
 * Configurações de APIs (Groq, Gemini, Tavily, etc)
 * Armazena API keys e configurações globais do sistema
 */
export const apiSettings = mysqlTable("apiSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // groq_api_key, gemini_api_key, tavily_api_key, etc
  value: text("value").notNull(), // API key ou valor da configuração
  description: text("description"), // Descrição da configuração
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyIdx: index("apiSettings_key_idx").on(table.key),
}));

export type ApiSetting = typeof apiSettings.$inferSelect;
export type InsertApiSetting = typeof apiSettings.$inferInsert;


/**
 * Banimentos de usuários
 */
export const bans = mysqlTable("bans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bannedBy: int("bannedBy").notNull(), // ID do admin que baniu
  reason: text("reason").notNull(),
  type: mysqlEnum("type", ["temporary", "permanent"]).notNull(),
  expiresAt: timestamp("expiresAt"), // Null para banimentos permanentes
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("bans_userId_idx").on(table.userId),
  bannedByIdx: index("bans_bannedBy_idx").on(table.bannedBy),
}));

export type Ban = typeof bans.$inferSelect;
export type InsertBan = typeof bans.$inferInsert;
