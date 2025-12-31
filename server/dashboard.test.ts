import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("dashboard procedures", () => {
  it("should return dashboard summary with correct structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.dashboard.summary();

    expect(summary).toBeDefined();
    expect(typeof summary.netWorth).toBe("number");
    expect(typeof summary.totalBalance).toBe("number");
    expect(typeof summary.totalDebt).toBe("number");
    expect(typeof summary.monthIncome).toBe("number");
    expect(typeof summary.monthExpenses).toBe("number");
    expect(typeof summary.accountsCount).toBe("number");
    expect(typeof summary.activeGoalsCount).toBe("number");
    expect(typeof summary.unreadAlertsCount).toBe("number");
    expect(Array.isArray(summary.recentTransactions)).toBe(true);
  });

  it("should calculate net worth correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account with balance
    await caller.accounts.create({
      name: "Net Worth Test Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    const summary = await caller.dashboard.summary();

    expect(summary.totalBalance).toBeGreaterThanOrEqual(1000);
    expect(summary.netWorth).toBe(summary.totalBalance - summary.totalDebt);
  });

  it("should calculate monthly income and expenses", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account
    await caller.accounts.create({
      name: "Monthly Calc Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "Monthly Calc Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Create income transaction
    await caller.transactions.create({
      accountId: account.id,
      type: "income",
      amount: "500.00",
      description: "Monthly income",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    // Create expense transaction
    await caller.transactions.create({
      accountId: account.id,
      type: "expense",
      amount: "200.00",
      description: "Monthly expense",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    const summary = await caller.dashboard.summary();

    expect(summary.monthIncome).toBeGreaterThanOrEqual(500);
    expect(summary.monthExpenses).toBeGreaterThanOrEqual(200);
  });

  it("should count accounts correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const beforeCount = (await caller.dashboard.summary()).accountsCount;

    // Create new account
    await caller.accounts.create({
      name: "Count Test Account",
      type: "savings",
      balance: "500.00",
      currency: "BRL",
      color: "#10b981",
    });

    const afterCount = (await caller.dashboard.summary()).accountsCount;

    // Should have at least one more account
    expect(afterCount).toBeGreaterThanOrEqual(beforeCount + 1);
  });

  it("should include recent transactions in summary", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account
    await caller.accounts.create({
      name: "Recent Transactions Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "Recent Transactions Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Create transaction
    await caller.transactions.create({
      accountId: account.id,
      type: "expense",
      amount: "75.00",
      description: "Recent transaction test",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    const summary = await caller.dashboard.summary();

    expect(summary.recentTransactions.length).toBeGreaterThan(0);
    expect(summary.recentTransactions.length).toBeLessThanOrEqual(10);
  });
});
