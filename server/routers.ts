import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { updateUser } from "./db-user-update";
import { invokeLLM } from "./_core/llm";
import { sendGroqChat, getGroqModels, testGroqConnection, initializeGroqClient } from "./_core/groq";
import { searchWeb, needsWebSearch, initializeTavilyClient, testTavilyConnection } from "./_core/tavily";

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
    
    getUpcomingBills: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
        limit: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        const { getUpcomingBills } = await import("./db");
        return await getUpcomingBills(ctx.user.id, input.days, input.limit);
      }),
    
    analyzeRecurring: protectedProcedure
      .query(async ({ ctx }) => {
        const transactions = await db.getUserTransactions(ctx.user.id);
        const { detectRecurringTransactions } = await import("./recurringAnalysis");
        return detectRecurringTransactions(transactions);
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
        isPending: z.boolean().optional(),
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

  // ==================== AI CHAT ====================
  aiChat: router({    
    // Send message to AI with financial context
    sendMessage: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        apiKey: z.string().optional(),
        model: z.enum(["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]).default("llama-3.1-70b-versatile"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if query needs web search
        let webSearchResults = "";
        if (needsWebSearch(input.message)) {
          try {
            const searchResult = await searchWeb(input.message, {
              maxResults: 3,
              includeAnswer: true,
            }, input.apiKey);
            
            if (searchResult.answer) {
              webSearchResults = `\n\nInformações da Web:\n${searchResult.answer}\n\nFontes:\n${searchResult.results.map(r => `- ${r.title}: ${r.url}`).join('\n')}`;
            }
          } catch (error) {
            console.log("[AI Chat] Web search failed, continuing without it:", error);
          }
        }
        
        // Get user's financial context
        const accounts = await db.getUserAccounts(ctx.user.id);
        const transactions = await db.getUserTransactions(ctx.user.id, 50);
        const budgets = await db.getUserBudgets(ctx.user.id);
        const goals = await db.getUserGoals(ctx.user.id);
        const debts = await db.getUserDebts(ctx.user.id);
        
        // Calculate financial summary
        const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
        const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.remainingAmount), 0);
        const netWorth = totalBalance - totalDebt;
        
        // Get current month transactions
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
        
        const monthIncome = monthTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const monthExpenses = monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        // Build context for AI
        const financialContext = `
Contexto Financeiro do Usuário:
- Patrimônio Líquido: R$ ${netWorth.toFixed(2)}
- Saldo Total em Contas: R$ ${totalBalance.toFixed(2)}
- Dívidas Totais: R$ ${totalDebt.toFixed(2)}
- Receitas do Mês: R$ ${monthIncome.toFixed(2)}
- Despesas do Mês: R$ ${monthExpenses.toFixed(2)}
- Número de Contas: ${accounts.length}
- Orçamentos Ativos: ${budgets.length}
- Metas Ativas: ${goals.filter(g => !g.isCompleted).length}
- Dívidas Ativas: ${debts.length}

Últimas Transações:
${transactions.slice(0, 10).map(t => 
  `- ${t.type === 'income' ? 'Receita' : 'Despesa'}: R$ ${parseFloat(t.amount).toFixed(2)} - ${t.description || 'Sem descrição'} (${new Date(t.date).toLocaleDateString('pt-BR')})`
).join('\n')}
`;
        
        const systemPrompt = `Você é um assistente financeiro especializado em finanças pessoais. 
Você tem acesso aos dados financeiros do usuário e deve fornecer análises precisas, conselhos práticos e insights acionáveis.
Sempre responda em português brasileiro de forma clara e profissional.
Use os dados financeiros fornecidos para dar respostas personalizadas e relevantes.
${financialContext}${webSearchResults}`;
        
        try {
          const response = await sendGroqChat(
            [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
            { model: input.model },
            input.apiKey
          );
          
          return {
            success: true,
            message: response,
            model: input.model,
          };
        } catch (error: any) {
          console.error("[AI Chat] Error:", error);
          return {
            success: false,
            message: error.message || "Erro ao processar mensagem",
            model: input.model,
          };
        }
      }),
    
    // Test Groq API connection
    testConnection: protectedProcedure
      .input(z.object({ apiKey: z.string() }))
      .mutation(async ({ input }) => {
        const isValid = await testGroqConnection(input.apiKey);
        return { success: isValid };
      }),
    
    // Get available models
    getModels: protectedProcedure.query(() => {
      return getGroqModels();
    }),
    
    // Initialize Groq client (admin only)
    initialize: protectedProcedure
      .input(z.object({ apiKey: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        
        const success = initializeGroqClient(input.apiKey);
        return { success };
      }),
  }),

  // ==================== TAVILY SEARCH ====================
  tavilySearch: router({
    // Search the web
    search: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        maxResults: z.number().min(1).max(10).default(5),
        searchDepth: z.enum(["basic", "advanced"]).default("basic"),
        includeAnswer: z.boolean().default(true),
        apiKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await searchWeb(
            input.query,
            {
              maxResults: input.maxResults,
              searchDepth: input.searchDepth,
              includeAnswer: input.includeAnswer,
            },
            input.apiKey
          );
          
          return {
            success: true,
            data: result,
          };
        } catch (error: any) {
          console.error("[Tavily Search] Error:", error);
          return {
            success: false,
            error: error.message || "Erro ao buscar na web",
          };
        }
      }),
    
    // Test Tavily API connection
    testConnection: protectedProcedure
      .input(z.object({
        apiKey: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const success = await testTavilyConnection(input.apiKey);
        return { success };
      }),
    
    // Initialize Tavily client (admin only)
    initialize: protectedProcedure
      .input(z.object({
        apiKey: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const success = initializeTavilyClient(input.apiKey);
        return { success };
      }),
  }),

  // ==================== SUPPORT ====================
  support: router({ listTickets: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTickets(ctx.user.id);
    }),
    
    createTicket: protectedProcedure
      .input(z.object({
        subject: z.string().min(5),
        category: z.enum(["technical", "billing", "feature", "other"]),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        description: z.string().min(20),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createTicket({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    updateTicketStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateTicketStatus(input.id, input.status, ctx.user.id);
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

  // ==================== CHECKOUT ====================
  checkout: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({
        plan: z.enum(["premium", "family"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { stripe } = await import("./_core/stripe");
        const { getPriceId } = await import("../shared/products");
        
        const plan = input.plan.toUpperCase() as "PREMIUM" | "FAMILY";
        const priceId = getPriceId(plan);
        
        if (!priceId) {
          throw new Error(`Price ID not configured for ${plan} plan`);
        }
        
        // Create or retrieve Stripe customer
        let customerId = ctx.user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });
          customerId = customer.id;
          
          // Update user with Stripe customer ID
          await updateUser(ctx.user.id, { stripeCustomerId: customerId });
        }
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/checkout/canceled`,
          subscription_data: {
            trial_period_days: 14,
            metadata: {
              userId: ctx.user.id.toString(),
              plan: input.plan,
            },
          },
          metadata: {
            userId: ctx.user.id.toString(),
            plan: input.plan,
          },
        });
        
        return {
          sessionId: session.id,
          url: session.url,
        };
      }),
    
    getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      return {
        plan: ctx.user.subscriptionPlan || "free",
        status: ctx.user.subscriptionStatus || null,
        endsAt: ctx.user.subscriptionEndsAt || null,
        stripeCustomerId: ctx.user.stripeCustomerId || null,
        stripeSubscriptionId: ctx.user.stripeSubscriptionId || null,
      };
    }),
    
    cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }
      
      const { stripe } = await import("./_core/stripe");
      
      // Cancel at period end
      const subscription = await stripe.subscriptions.update(
        ctx.user.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );
      
      return {
        success: true,
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      };
    }),
    
    createCustomerPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.stripeCustomerId) {
        throw new Error("No Stripe customer found");
      }
      
      const { stripe } = await import("./_core/stripe");
      
      const session = await stripe.billingPortal.sessions.create({
        customer: ctx.user.stripeCustomerId,
        return_url: `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/dashboard/billing`,
      });
      
      return {
        url: session.url,
      };
    }),
    
    getInvoices: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.stripeCustomerId) {
        return [];
      }
      
      const { stripe } = await import("./_core/stripe");
      
      const invoices = await stripe.invoices.list({
        customer: ctx.user.stripeCustomerId,
        limit: 12,
      });
      
      return invoices.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created: invoice.created,
        invoicePdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        periodStart: invoice.period_start,
        periodEnd: invoice.period_end,
      }));
    }),
    
    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.stripeSubscriptionId) {
        return null;
      }
      
      const { stripe } = await import("./_core/stripe");
      
      try {
        const subscription = await stripe.subscriptions.retrieve(
          ctx.user.stripeSubscriptionId
        );
        
        return {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: (subscription as any).current_period_end,
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          cancelAt: (subscription as any).cancel_at,
          items: subscription.items.data.map(item => ({
            priceId: item.price.id,
            amount: item.price.unit_amount,
            currency: item.price.currency,
            interval: item.price.recurring?.interval,
          })),
        };
      } catch (error) {
        console.error("[Billing] Failed to retrieve subscription:", error);
        return null;
      }
    }),
   }),

  // Benchmark routes
  benchmarks: router({
    getHistory: protectedProcedure
      .input(z.object({
        benchmark: z.enum(["ibovespa", "sp500", "cdi"]),
        range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]).default("1y"),
      }))
      .query(async ({ input }) => {
        const { getBenchmarkHistory } = await import("./_core/benchmarks");
        return await getBenchmarkHistory(input.benchmark, input.range);
      }),
    
    getMultiple: protectedProcedure
      .input(z.object({
        benchmarks: z.array(z.enum(["ibovespa", "sp500", "cdi"])),
        range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]).default("1y"),
      }))
      .query(async ({ input }) => {
        const { getMultipleBenchmarks } = await import("./_core/benchmarks");
        return await getMultipleBenchmarks(input.benchmarks, input.range);
      }),
    
    comparePortfolio: protectedProcedure
      .input(z.object({
        benchmark: z.enum(["ibovespa", "sp500", "cdi"]),
        range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]).default("1y"),
      }))
      .query(async ({ ctx, input }) => {
        const { getBenchmarkHistory, calculateAlpha } = await import("./_core/benchmarks");
        
        // Buscar histórico do benchmark
        const benchmarkHistory = await getBenchmarkHistory(input.benchmark, input.range);
        
        // Buscar investimentos do usuário
        const investments = await db.getUserInvestments(ctx.user.id);
        
        // Calcular valor total do portfólio
        const portfolioValue = investments.reduce((sum, inv) => {
          return sum + parseFloat(inv.currentValue || inv.totalInvested);
        }, 0);
        
        const initialValue = investments.reduce((sum, inv) => {
          return sum + parseFloat(inv.totalInvested);
        }, 0);
        
        // Calcular retornos
        const portfolioReturn = initialValue > 0 ? ((portfolioValue - initialValue) / initialValue) * 100 : 0;
        const benchmarkReturn = benchmarkHistory.changePercent;
        
        // Calcular Alpha
        const alpha = calculateAlpha(portfolioReturn, benchmarkReturn);
        
        return {
          benchmark: input.benchmark,
          benchmarkHistory,
          portfolio: {
            currentValue: portfolioValue,
            initialValue,
            return: portfolioValue - initialValue,
            returnPercent: portfolioReturn,
          },
          metrics: {
            alpha,
            beta: 0, // Placeholder - precisa dados históricos
            sharpeRatio: 0, // Placeholder - precisa dados históricos
          },
        };
      }),
  }),

  // Dividends routes
  dividends: router({
    create: protectedProcedure
      .input(z.object({
        investmentId: z.number(),
        type: z.enum(["dividend", "jcp", "interest", "bonus"]),
        amount: z.number().positive(),
        paymentDate: z.date(),
        referenceDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createDividend } = await import("./db-dividends");
        return await createDividend({
          ...input,
          amount: input.amount.toString(), // Converter para string (decimal no banco)
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({
        investmentId: z.number().optional(),
        type: z.enum(["dividend", "jcp", "interest", "bonus"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { listDividends } = await import("./db-dividends");
        return await listDividends(ctx.user.id, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getDividendById } = await import("./db-dividends");
        return await getDividendById(input.id, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        investmentId: z.number().optional(),
        type: z.enum(["dividend", "jcp", "interest", "bonus"]).optional(),
        amount: z.number().positive().optional(),
        paymentDate: z.date().optional(),
        referenceDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const { updateDividend } = await import("./db-dividends");
        // Converter amount para string se fornecido (decimal no banco)
        const updateData = data.amount !== undefined 
          ? { ...data, amount: data.amount.toString() }
          : data;
        return await updateDividend(id, ctx.user.id, updateData as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteDividend } = await import("./db-dividends");
        return await deleteDividend(input.id, ctx.user.id);
      }),

    getStats: protectedProcedure
      .input(z.object({
        investmentId: z.number().optional(),
        year: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getDividendStats } = await import("./db-dividends");
        return await getDividendStats(ctx.user.id, input);
      }),
  }),
});
export type AppRouter = typeof appRouter;
