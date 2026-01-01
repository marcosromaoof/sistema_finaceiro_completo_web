import { eq, and, desc, gte, lte, sql, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  User, InsertUser, users, 
  accounts, Account, InsertAccount,
  categories, Category, InsertCategory,
  transactions, Transaction, InsertTransaction,
  budgets, Budget, InsertBudget,
  goals, Goal, InsertGoal,
  goalContributions, GoalContribution, InsertGoalContribution,
  debts, Debt, InsertDebt,
  debtPayments, DebtPayment, InsertDebtPayment,
  investments, Investment, InsertInvestment,
  investmentReturns, InvestmentReturn, InsertInvestmentReturn,
  retirementPlans, RetirementPlan, InsertRetirementPlan,
  categorizationRules, CategorizationRule, InsertCategorizationRule,
  alerts, Alert, InsertAlert,
  supportTickets, SupportTicket, InsertSupportTicket,
  apiSettings, ApiSetting, InsertApiSetting,
  bans
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER OPERATIONS ====================

export async function upsertUser(user: InsertUser): Promise<User> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    throw new Error("Database not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
    
    // Buscar e retornar o usuário criado/atualizado
    const result = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (result.length === 0) {
      throw new Error(`User with openId ${user.openId} not found after upsert`);
    }
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== ACCOUNT OPERATIONS ====================

export async function createAccount(account: InsertAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(accounts).values(account);
  return result;
}

export async function getUserAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(accounts).where(eq(accounts.userId, userId)).orderBy(desc(accounts.createdAt));
}

export async function getAccountById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).limit(1);
  return result[0];
}

export async function updateAccount(id: number, userId: number, data: Partial<InsertAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(accounts).set(data).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
}

export async function deleteAccount(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
}

// ==================== CATEGORY OPERATIONS ====================

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categories).values(category);
  return result;
}

export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categories).where(eq(categories.userId, userId)).orderBy(categories.name);
}

export async function getCategoryById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, userId))).limit(1);
  return result[0];
}

export async function updateCategory(id: number, userId: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function deleteCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// ==================== TRANSACTION OPERATIONS ====================

export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transactions).values(transaction);
  return result;
}

export async function getUserTransactions(userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Otimizado: carregar category e account em uma única query (evita N+1)
  let query = db.select({
    id: transactions.id,
    userId: transactions.userId,
    accountId: transactions.accountId,
    categoryId: transactions.categoryId,
    type: transactions.type,
    amount: transactions.amount,
    description: transactions.description,
    date: transactions.date,
    isPending: transactions.isPending,
    isRecurring: transactions.isRecurring,
    recurringFrequency: transactions.recurringFrequency,
    tags: transactions.tags,
    notes: transactions.notes,
    transferAccountId: transactions.transferAccountId,
    attachmentUrl: transactions.attachmentUrl,
    aiCategorized: transactions.aiCategorized,
    createdAt: transactions.createdAt,
    updatedAt: transactions.updatedAt,
    // Incluir category
    category: {
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
    },
    // Incluir account
    account: {
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
    },
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .leftJoin(accounts, eq(transactions.accountId, accounts.id))
  .where(eq(transactions.userId, userId))
  .orderBy(desc(transactions.date));
  
  if (limit) {
    query = query.limit(limit) as any;
  }
  
  return await query;
}

export async function getTransactionsByAccount(accountId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(transactions)
    .where(and(eq(transactions.accountId, accountId), eq(transactions.userId, userId)))
    .orderBy(desc(transactions.date));
}

export async function getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    ))
    .orderBy(desc(transactions.date));
}

export async function updateTransaction(id: number, userId: number, data: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(transactions).set(data).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function deleteTransaction(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function getUpcomingBills(userId: number, days: number = 30, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const results = await db.select({
    transaction: transactions,
    account: accounts,
    category: categories,
  })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        eq(transactions.isPending, true),
        gte(transactions.date, now),
        lte(transactions.date, futureDate)
      )
    )
    .orderBy(asc(transactions.date))
    .limit(limit);
  
  return results;
}

// ==================== BUDGET OPERATIONS ====================

export async function createBudget(budget: InsertBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(budgets).values(budget);
  return result;
}

export async function getUserBudgets(userId: number, period?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (period) {
    return await db.select().from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.period, period)));
  }
  
  return await db.select().from(budgets).where(eq(budgets.userId, userId)).orderBy(desc(budgets.period));
}

export async function updateBudget(id: number, userId: number, data: Partial<InsertBudget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(budgets).set(data).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
}

export async function deleteBudget(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
}

// ==================== GOAL OPERATIONS ====================

export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(goals).values(goal);
  return result;
}

export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
}

export async function getGoalById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).limit(1);
  return result[0];
}

export async function updateGoal(id: number, userId: number, data: Partial<InsertGoal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(goals).set(data).where(and(eq(goals.id, id), eq(goals.userId, userId)));
}

export async function deleteGoal(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
}

export async function addGoalContribution(contribution: InsertGoalContribution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(goalContributions).values(contribution);
  return result;
}

export async function getGoalContributions(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(goalContributions).where(eq(goalContributions.goalId, goalId)).orderBy(desc(goalContributions.date));
}

// ==================== DEBT OPERATIONS ====================

export async function createDebt(debt: InsertDebt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(debts).values(debt);
  return result;
}

export async function getUserDebts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(debts).where(eq(debts.userId, userId)).orderBy(desc(debts.createdAt));
}

export async function getDebtById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(debts).where(and(eq(debts.id, id), eq(debts.userId, userId))).limit(1);
  return result[0];
}

export async function updateDebt(id: number, userId: number, data: Partial<InsertDebt>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(debts).set(data).where(and(eq(debts.id, id), eq(debts.userId, userId)));
}

export async function deleteDebt(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, userId)));
}

export async function addDebtPayment(payment: InsertDebtPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(debtPayments).values(payment);
  return result;
}

export async function getDebtPayments(debtId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(debtPayments).where(eq(debtPayments.debtId, debtId)).orderBy(desc(debtPayments.date));
}

// ==================== INVESTMENT OPERATIONS ====================

export async function createInvestment(investment: InsertInvestment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(investments).values(investment);
  return result;
}

export async function getUserInvestments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(investments).where(eq(investments.userId, userId)).orderBy(desc(investments.createdAt));
}

export async function getInvestmentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(investments).where(and(eq(investments.id, id), eq(investments.userId, userId))).limit(1);
  return result[0];
}

export async function updateInvestment(id: number, userId: number, data: Partial<InsertInvestment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(investments).set(data).where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

export async function deleteInvestment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(investments).where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

export async function addInvestmentReturn(investmentReturn: InsertInvestmentReturn) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(investmentReturns).values(investmentReturn);
  return result;
}

export async function getInvestmentReturns(investmentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(investmentReturns).where(eq(investmentReturns.investmentId, investmentId)).orderBy(desc(investmentReturns.date));
}

// ==================== RETIREMENT PLAN OPERATIONS ====================

export async function createRetirementPlan(plan: InsertRetirementPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(retirementPlans).values(plan);
  return result;
}

export async function getUserRetirementPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(retirementPlans).where(eq(retirementPlans.userId, userId)).orderBy(desc(retirementPlans.createdAt));
}

export async function getRetirementPlanById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(retirementPlans).where(and(eq(retirementPlans.id, id), eq(retirementPlans.userId, userId))).limit(1);
  return result[0];
}

export async function updateRetirementPlan(id: number, userId: number, data: Partial<InsertRetirementPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(retirementPlans).set(data).where(and(eq(retirementPlans.id, id), eq(retirementPlans.userId, userId)));
}

export async function deleteRetirementPlan(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(retirementPlans).where(and(eq(retirementPlans.id, id), eq(retirementPlans.userId, userId)));
}

// ==================== CATEGORIZATION RULE OPERATIONS ====================

export async function createCategorizationRule(rule: InsertCategorizationRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categorizationRules).values(rule);
  return result;
}

export async function getUserCategorizationRules(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categorizationRules)
    .where(eq(categorizationRules.userId, userId))
    .orderBy(desc(categorizationRules.priority));
}

export async function updateCategorizationRule(id: number, userId: number, data: Partial<InsertCategorizationRule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(categorizationRules).set(data).where(and(eq(categorizationRules.id, id), eq(categorizationRules.userId, userId)));
}

export async function deleteCategorizationRule(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(categorizationRules).where(and(eq(categorizationRules.id, id), eq(categorizationRules.userId, userId)));
}

// ==================== ALERT OPERATIONS ====================

export async function createAlert(alert: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(alerts).values(alert);
  return result;
}

export async function getUserAlerts(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (unreadOnly) {
    return await db.select().from(alerts)
      .where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)))
      .orderBy(desc(alerts.createdAt));
  }
  
  return await db.select().from(alerts).where(eq(alerts.userId, userId)).orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(alerts).set({ isRead: true }).where(and(eq(alerts.id, id), eq(alerts.userId, userId)));
}

export async function deleteAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(alerts).where(and(eq(alerts.id, id), eq(alerts.userId, userId)));
}


// ==================== SUPPORT TICKET OPERATIONS ====================

export async function createTicket(ticket: {
  userId: number;
  subject: string;
  category: "technical" | "billing" | "feature" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(supportTickets).values({
    ...ticket,
    status: "open" as const,
  });
  return result;
}

export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function updateTicketStatus(id: number, status: "open" | "in_progress" | "resolved" | "closed", userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(supportTickets)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(supportTickets.id, id), eq(supportTickets.userId, userId)));
}


// ==================== API SETTINGS OPERATIONS ====================

export async function getApiSetting(key: string): Promise<ApiSetting | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(apiSettings)
    .where(eq(apiSettings.key, key))
    .limit(1);

  return results[0] || null;
}

export async function upsertApiSetting(data: { key: string; value: string; description?: string }): Promise<ApiSetting> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getApiSetting(data.key);

  if (existing) {
    await db
      .update(apiSettings)
      .set({ 
        value: data.value, 
        description: data.description,
        updatedAt: new Date() 
      })
      .where(eq(apiSettings.id, existing.id));

    return { ...existing, value: data.value, description: data.description ?? null };
  } else {
    const result = await db.insert(apiSettings).values({
      key: data.key,
      value: data.value,
      description: data.description,
      isActive: true,
    });

    return {
      id: Number(result[0].insertId),
      key: data.key,
      value: data.value,
      description: data.description ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getAllApiSettings(): Promise<ApiSetting[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(apiSettings).where(eq(apiSettings.isActive, true));
}

export async function deleteApiSetting(key: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(apiSettings).where(eq(apiSettings.key, key));
}


// ==================== ADMIN FUNCTIONS ====================

/**
 * Get all transactions (admin only)
 */
export async function getAllTransactions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(transactions).orderBy(desc(transactions.date));
}

/**
 * Refund a transaction (admin only)
 */
export async function refundTransaction(transactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId));

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Create reverse transaction
  await db.insert(transactions).values({
    userId: transaction.userId,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    type: transaction.type === "income" ? "expense" : "income",
    amount: transaction.amount,
    description: `Estorno: ${transaction.description || ""}`,
    date: new Date(),
    isPending: false,
    isRecurring: false,
    tags: transaction.tags,
    notes: `Estorno da transação #${transactionId}`,
  });

  return { success: true, message: "Transação estornada com sucesso" };
}


/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId));

  return { success: true, message: "Role atualizada com sucesso" };
}


// ============================================================================
// Banimentos
// ============================================================================

export async function createBan(data: { userId: number; bannedBy: number; reason: string; type: "temporary" | "permanent"; expiresAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(bans).values(data);
  return result;
}

export async function getAllBans() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(bans).orderBy(desc(bans.createdAt));
}

export async function getActiveBanForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const [ban] = await db
    .select()
    .from(bans)
    .where(and(
      eq(bans.userId, userId),
      eq(bans.isActive, true)
    ))
    .orderBy(desc(bans.createdAt))
    .limit(1);
  return ban;
}

export async function deactivateBan(banId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(bans)
    .set({ isActive: false })
    .where(eq(bans.id, banId));
}
