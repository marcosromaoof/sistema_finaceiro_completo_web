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

describe("aiChat", () => {
  it("should return available Groq models", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.aiChat.getModels();

    expect(models).toBeDefined();
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
    
    // Check that Llama 3.1 70B is available
    const llama70b = models.find(m => m.id === "llama-3.1-70b-versatile");
    expect(llama70b).toBeDefined();
    expect(llama70b?.name).toBe("Llama 3.1 70B");
    expect(llama70b?.recommended).toBe(true);
  });

  it("should fail to send message without API key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aiChat.sendMessage({
      message: "Hello",
      model: "llama-3.1-70b-versatile",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("not initialized");
  });

  it("should require admin role to initialize Groq client", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.aiChat.initialize({ apiKey: "test-key" })
    ).rejects.toThrow("Unauthorized");
  });

  it("should allow admin to initialize Groq client", async () => {
    const { ctx } = createAuthContext();
    // Make user admin
    ctx.user!.role = "admin";
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aiChat.initialize({ apiKey: "test-key" });

    // Will fail because test-key is invalid, but should not throw unauthorized error
    expect(result).toBeDefined();
  });
});
