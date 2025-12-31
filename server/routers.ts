import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== ACCOUNTS ====================
  accounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAccounts(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getAccountById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(["checking", "savings", "credit_card", "investment", "loan", "other"]),
        currency: z.string().default("BRL"),
        balance: z.string().default("0.00"),
        creditLimit: z.string().optional(),
        institution: z.string().optional(),
        accountNumber: z.string().optional(),
        color: z.string().default("#3b82f6"),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAccount({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        balance: z.string().optional(),
        creditLimit: z.string().optional(),
        institution: z.string().optional(),
        color: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateAccount(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteAccount(input.id, ctx.user.id);
      }),
  }),

  // ==================== CATEGORIES ====================
  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCategories(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(["income", "expense"]),
        color: z.string().default("#6b7280"),
        icon: z.string().optional(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createCategory({
          userId: ctx.user.id,
          isSystem: false,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateCategory(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteCategory(input.id, ctx.user.id);
      }),
  }),

  // ==================== TRANSACTIONS ====================
  transactions: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserTransactions(ctx.user.id, input.limit);
      }),
    
    byAccount: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getTransactionsByAccount(input.accountId, ctx.user.id);
      }),
    
    byDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getTransactionsByDateRange(ctx.user.id, input.startDate, input.endDate);
      }),
    
    create: protectedProcedure
      .input(z.object({
        accountId: z.number(),
        categoryId: z.number().optional(),
        type: z.enum(["income", "expense", "transfer"]),
        amount: z.string(),
        description: z.string().optional(),
        date: z.date(),
        isPending: z.boolean().default(false),
        isRecurring: z.boolean().default(false),
        recurringFrequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
        transferAccountId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createTransaction({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        amount: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateTransaction(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteTransaction(input.id, ctx.user.id);
      }),
    
    categorize: protectedProcedure
      .input(z.object({
        transactionId: z.number(),
        description: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get user categories
        const categories = await db.getUserCategories(ctx.user.id);
        
        // Use AI to categorize
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em categorização de transações financeiras. Analise a descrição da transação e sugira a categoria mais apropriada da lista fornecida. Responda apenas com o ID da categoria."
            },
            {
              role: "user",
              content: `Categorias disponíveis: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name, type: c.type })))}\n\nDescrição da transação: ${input.description}`
            }
          ],
        });
        
        const content = response.choices[0]?.message?.content;
        const suggestedCategoryId = parseInt(typeof content === 'string' ? content : "");
        
        if (suggestedCategoryId && !isNaN(suggestedCategoryId)) {
          await db.updateTransaction(input.transactionId, ctx.user.id, {
            categoryId: suggestedCategoryId,
            aiCategorized: true,
          });
        }
        
        return { categoryId: suggestedCategoryId };
      }),
  }),

  // ==================== BUDGETS ====================
  budgets: router({
    list: protectedProcedure
      .input(z.object({ period: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserBudgets(ctx.user.id, input.period);
      }),
    
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        amount: z.string(),
        period: z.string(), // YYYY-MM
        rollover: z.boolean().default(false),
        alertThreshold: z.number().default(80),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createBudget({
          userId: ctx.user.id,
          spent: "0.00",
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        amount: z.string().optional(),
        rollover: z.boolean().optional(),
        alertThreshold: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateBudget(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteBudget(input.id, ctx.user.id);
      }),
  }),

  // ==================== GOALS ====================
  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserGoals(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getGoalById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        targetAmount: z.string(),
        targetDate: z.date().optional(),
        category: z.enum(["short_term", "medium_term", "long_term"]),
        description: z.string().optional(),
        color: z.string().default("#10b981"),
        icon: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createGoal({
          userId: ctx.user.id,
          currentAmount: "0.00",
          isCompleted: false,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        targetAmount: z.string().optional(),
        currentAmount: z.string().optional(),
        targetDate: z.date().optional(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateGoal(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteGoal(input.id, ctx.user.id);
      }),
    
    addContribution: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        amount: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.addGoalContribution({
          goalId: input.goalId,
          amount: input.amount,
          date: new Date(),
          notes: input.notes,
        });
      }),
    
    getContributions: protectedProcedure
      .input(z.object({ goalId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getGoalContributions(input.goalId);
      }),
  }),

  // ==================== DEBTS ====================
  debts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserDebts(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getDebtById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        totalAmount: z.string(),
        remainingAmount: z.string(),
        interestRate: z.string(),
        minimumPayment: z.string().optional(),
        dueDay: z.number().optional(),
        startDate: z.date(),
        payoffStrategy: z.enum(["snowball", "avalanche", "custom"]).default("avalanche"),
        creditor: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createDebt({
          userId: ctx.user.id,
          isPaidOff: false,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        remainingAmount: z.string().optional(),
        minimumPayment: z.string().optional(),
        payoffStrategy: z.enum(["snowball", "avalanche", "custom"]).optional(),
        isPaidOff: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateDebt(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteDebt(input.id, ctx.user.id);
      }),
    
    addPayment: protectedProcedure
      .input(z.object({
        debtId: z.number(),
        amount: z.string(),
        principalAmount: z.string(),
        interestAmount: z.string(),
        date: z.date(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.addDebtPayment(input);
      }),
    
    getPayments: protectedProcedure
      .input(z.object({ debtId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getDebtPayments(input.debtId);
      }),
  }),

  // ==================== INVESTMENTS ====================
  investments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserInvestments(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getInvestmentById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        accountId: z.number().optional(),
        name: z.string().min(1),
        type: z.enum(["stocks", "bonds", "funds", "real_estate", "crypto", "other"]),
        ticker: z.string().optional(),
        quantity: z.string().optional(),
        purchasePrice: z.string(),
        currentPrice: z.string().optional(),
        totalInvested: z.string(),
        currentValue: z.string().optional(),
        purchaseDate: z.date(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createInvestment({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        currentPrice: z.string().optional(),
        currentValue: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateInvestment(id, ctx.user.id, {
          ...data,
          lastUpdated: new Date(),
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteInvestment(input.id, ctx.user.id);
      }),
    
    addReturn: protectedProcedure
      .input(z.object({
        investmentId: z.number(),
        type: z.enum(["dividend", "interest", "capital_gain"]),
        amount: z.string(),
        date: z.date(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.addInvestmentReturn(input);
      }),
    
    getReturns: protectedProcedure
      .input(z.object({ investmentId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getInvestmentReturns(input.investmentId);
      }),
  }),

  // ==================== RETIREMENT PLANS ====================
  retirementPlans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserRetirementPlans(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getRetirementPlanById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        currentAge: z.number(),
        retirementAge: z.number(),
        currentSavings: z.string().default("0.00"),
        monthlyContribution: z.string(),
        expectedReturn: z.string(),
        inflationRate: z.string().default("3.50"),
        desiredMonthlyIncome: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createRetirementPlan({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        currentSavings: z.string().optional(),
        monthlyContribution: z.string().optional(),
        expectedReturn: z.string().optional(),
        projectedValue: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await db.updateRetirementPlan(id, ctx.user.id, {
          ...data,
          lastCalculated: new Date(),
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteRetirementPlan(input.id, ctx.user.id);
      }),
  }),

  // ==================== ALERTS ====================
  alerts: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().default(false) }))
      .query(async ({ ctx, input }) => {
        return await db.getUserAlerts(ctx.user.id, input.unreadOnly);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.markAlertAsRead(input.id, ctx.user.id);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteAlert(input.id, ctx.user.id);
      }),
  }),

  // ==================== DASHBOARD ====================
  dashboard: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const accounts = await db.getUserAccounts(ctx.user.id);
      const transactions = await db.getUserTransactions(ctx.user.id, 100);
      const goals = await db.getUserGoals(ctx.user.id);
      const debts = await db.getUserDebts(ctx.user.id);
      const alerts = await db.getUserAlerts(ctx.user.id, true);
      
      // Calculate totals
      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.remainingAmount), 0);
      const netWorth = totalBalance - totalDebt;
      
      // Calculate income and expenses for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
      
      const monthIncome = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      return {
        netWorth,
        totalBalance,
        totalDebt,
        monthIncome,
        monthExpenses,
        accountsCount: accounts.length,
        activeGoalsCount: goals.filter(g => !g.isCompleted).length,
        unreadAlertsCount: alerts.length,
        recentTransactions: transactions.slice(0, 10),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
