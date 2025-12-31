import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

describe("Billing Router", () => {
  const mockUserWithoutStripe: User = {
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

  const mockUserWithStripe: User = {
    ...mockUserWithoutStripe,
    stripeCustomerId: "cus_test123",
    stripeSubscriptionId: "sub_test123",
    subscriptionStatus: "active",
    subscriptionPlan: "premium",
  };

  const createCaller = (user: User | undefined) => {
    return appRouter.createCaller({
      user,
      req: {} as any,
      res: {} as any,
    });
  };

  describe("createCustomerPortalSession", () => {
    it("should require authentication", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.checkout.createCustomerPortalSession()
      ).rejects.toThrow();
    });

    it("should throw error when no Stripe customer", async () => {
      const caller = createCaller(mockUserWithoutStripe);
      
      await expect(
        caller.checkout.createCustomerPortalSession()
      ).rejects.toThrow("No Stripe customer found");
    });
  });

  describe("getInvoices", () => {
    it("should require authentication", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.checkout.getInvoices()
      ).rejects.toThrow();
    });

    it("should return empty array when no Stripe customer", async () => {
      const caller = createCaller(mockUserWithoutStripe);
      const result = await caller.checkout.getInvoices();
      
      expect(result).toEqual([]);
    });
  });

  describe("getCurrentSubscription", () => {
    it("should require authentication", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.checkout.getCurrentSubscription()
      ).rejects.toThrow();
    });

    it("should return null when no subscription", async () => {
      const caller = createCaller(mockUserWithoutStripe);
      const result = await caller.checkout.getCurrentSubscription();
      
      expect(result).toBeNull();
    });
  });
});
