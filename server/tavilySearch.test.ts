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

describe("tavilySearch", () => {
  it("should fail to search without API key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tavilySearch.search({
      query: "test",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("not initialized");
  });

  it("should require admin role to initialize Tavily client", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tavilySearch.initialize({ apiKey: "test-key" })
    ).rejects.toThrow("Unauthorized");
  });

  it("should allow admin to initialize Tavily client", async () => {
    const { ctx } = createAuthContext();
    // Make user admin
    ctx.user!.role = "admin";
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tavilySearch.initialize({ apiKey: "test-key" });

    // Will succeed even with invalid key because we just initialize the client
    expect(result.success).toBe(true);
  });

  it("should test Tavily connection with API key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tavilySearch.testConnection({
      apiKey: "invalid-key",
    });

    // Will fail because key is invalid
    expect(result.success).toBe(false);
  });
});
