import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

describe("Checkout Router", () => {
  const mockUser: User = {
    id: 1,
    openId: "test-open-id",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "oauth",
    role: "user",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    subscriptionStatus: null,
    subscriptionPlan: "free",
    subscriptionEndsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const createCaller = (user: User | undefined) => {
    return appRouter.createCaller({
      user,
      req: {} as any,
      res: {} as any,
    });
  };

  describe("getSubscriptionStatus", () => {
    it("should return subscription status for authenticated user", async () => {
      const caller = createCaller(mockUser);
      const result = await caller.checkout.getSubscriptionStatus();

      expect(result).toHaveProperty("plan");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("endsAt");
      expect(result.plan).toBe("free");
      expect(result.status).toBe(null);
    });

    it("should throw error for unauthenticated user", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.checkout.getSubscriptionStatus()
      ).rejects.toThrow();
    });
  });

  describe("createCheckoutSession", () => {
    it("should require authentication", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.checkout.createCheckoutSession({ plan: "premium" })
      ).rejects.toThrow();
    });

    it("should validate plan parameter - reject invalid plan", async () => {
      const caller = createCaller(mockUser);
      
      await expect(
        caller.checkout.createCheckoutSession({ plan: "invalid" as any })
      ).rejects.toThrow();
    });
  });

  describe("cancelSubscription", () => {
    it("should require authentication", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.checkout.cancelSubscription()
      ).rejects.toThrow();
    });

    it("should throw error when no active subscription", async () => {
      const caller = createCaller(mockUser);
      
      await expect(
        caller.checkout.cancelSubscription()
      ).rejects.toThrow("No active subscription found");
    });
  });
});
