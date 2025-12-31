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

describe("transactions procedures", () => {
  it("should create a new transaction", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an account first
    await caller.accounts.create({
      name: "Transaction Test Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "Transaction Test Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Create transaction
    const result = await caller.transactions.create({
      accountId: account.id,
      type: "expense",
      amount: "50.00",
      description: "Test expense",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    expect(result).toBeDefined();
  });

  it("should list user transactions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account
    await caller.accounts.create({
      name: "List Transactions Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "List Transactions Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Create transaction
    await caller.transactions.create({
      accountId: account.id,
      type: "income",
      amount: "100.00",
      description: "Test income",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    // List transactions
    const transactions = await caller.transactions.list({ limit: 10 });

    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);
  });

  it("should update a transaction", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account
    await caller.accounts.create({
      name: "Update Transaction Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "Update Transaction Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Create transaction
    await caller.transactions.create({
      accountId: account.id,
      type: "expense",
      amount: "75.00",
      description: "Original description",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    // Get transaction
    const transactions = await caller.transactions.list({ limit: 10 });
    const transaction = transactions.find((t) => t.description === "Original description");
    
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update transaction
    await caller.transactions.update({
      id: transaction.id,
      description: "Updated description",
      amount: "100.00",
    });

    // Verify update
    const updatedTransactions = await caller.transactions.list({ limit: 10 });
    const updatedTransaction = updatedTransactions.find((t) => t.id === transaction.id);
    
    expect(updatedTransaction?.description).toBe("Updated description");
    expect(updatedTransaction?.amount).toBe("100.00");
  });

  it("should delete a transaction", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account
    await caller.accounts.create({
      name: "Delete Transaction Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "Delete Transaction Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Create transaction
    await caller.transactions.create({
      accountId: account.id,
      type: "expense",
      amount: "25.00",
      description: "To be deleted",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    // Get transaction
    const transactions = await caller.transactions.list({ limit: 10 });
    const transaction = transactions.find((t) => t.description === "To be deleted");
    
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Delete transaction
    await caller.transactions.delete({ id: transaction.id });

    // Verify deletion
    const remainingTransactions = await caller.transactions.list({ limit: 10 });
    const deletedTransaction = remainingTransactions.find((t) => t.id === transaction.id);
    
    expect(deletedTransaction).toBeUndefined();
  });

  it("should filter transactions by account", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create two accounts
    await caller.accounts.create({
      name: "Filter Account 1",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    await caller.accounts.create({
      name: "Filter Account 2",
      type: "savings",
      balance: "500.00",
      currency: "BRL",
      color: "#10b981",
    });

    const accounts = await caller.accounts.list();
    const account1 = accounts.find((a) => a.name === "Filter Account 1");
    const account2 = accounts.find((a) => a.name === "Filter Account 2");
    
    if (!account1 || !account2) {
      throw new Error("Accounts not found");
    }

    // Create transactions for both accounts
    await caller.transactions.create({
      accountId: account1.id,
      type: "expense",
      amount: "50.00",
      description: "Account 1 expense",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    await caller.transactions.create({
      accountId: account2.id,
      type: "income",
      amount: "100.00",
      description: "Account 2 income",
      date: new Date(),
      isPending: false,
      isRecurring: false,
    });

    // Filter by account
    const account1Transactions = await caller.transactions.byAccount({ accountId: account1.id });
    
    expect(Array.isArray(account1Transactions)).toBe(true);
    expect(account1Transactions.every((t) => t.accountId === account1.id)).toBe(true);
  });
});
