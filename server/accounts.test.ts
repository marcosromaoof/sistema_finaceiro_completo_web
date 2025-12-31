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

describe("accounts procedures", () => {
  it("should create a new account", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accounts.create({
      name: "Test Checking Account",
      type: "checking",
      balance: "1000.00",
      currency: "BRL",
      institution: "Test Bank",
      color: "#3b82f6",
    });

    expect(result).toBeDefined();
  });

  it("should list user accounts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test account first
    await caller.accounts.create({
      name: "Test Account",
      type: "savings",
      balance: "500.00",
      currency: "BRL",
      color: "#10b981",
    });

    const accounts = await caller.accounts.list();

    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts.length).toBeGreaterThan(0);
  });

  it("should update account balance", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account
    await caller.accounts.create({
      name: "Update Test Account",
      type: "checking",
      balance: "100.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    // Get the account
    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "Update Test Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Update balance
    await caller.accounts.update({
      id: account.id,
      balance: "200.00",
    });

    // Verify update
    const updatedAccount = await caller.accounts.getById({ id: account.id });
    expect(updatedAccount?.balance).toBe("200.00");
  });

  it("should delete an account", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account
    await caller.accounts.create({
      name: "Delete Test Account",
      type: "checking",
      balance: "100.00",
      currency: "BRL",
      color: "#3b82f6",
    });

    // Get the account
    const accounts = await caller.accounts.list();
    const account = accounts.find((a) => a.name === "Delete Test Account");
    
    if (!account) {
      throw new Error("Account not found");
    }

    // Delete account
    await caller.accounts.delete({ id: account.id });

    // Verify deletion
    const deletedAccount = await caller.accounts.getById({ id: account.id });
    expect(deletedAccount).toBeUndefined();
  });
});
