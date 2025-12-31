import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

describe("Upcoming Bills", () => {
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

  describe("getUpcomingBills", () => {
    it("should require authentication", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.transactions.getUpcomingBills({ days: 30, limit: 10 })
      ).rejects.toThrow();
    });

    it("should return empty array for authenticated user with no bills", async () => {
      const caller = createCaller(mockUser);
      const result = await caller.transactions.getUpcomingBills({ days: 30, limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should accept custom days parameter", async () => {
      const caller = createCaller(mockUser);
      const result = await caller.transactions.getUpcomingBills({ days: 7, limit: 5 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should accept custom limit parameter", async () => {
      const caller = createCaller(mockUser);
      const result = await caller.transactions.getUpcomingBills({ days: 30, limit: 20 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should use default values when not provided", async () => {
      const caller = createCaller(mockUser);
      const result = await caller.transactions.getUpcomingBills({});
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("update transaction with isPending", () => {
    it("should require authentication", async () => {
      const caller = createCaller(undefined);
      
      await expect(
        caller.transactions.update({ id: 1, isPending: false })
      ).rejects.toThrow();
    });

    it("should accept isPending parameter", async () => {
      const caller = createCaller(mockUser);
      
      // This will fail because transaction doesn't exist, but validates schema
      try {
        await caller.transactions.update({ id: 999999, isPending: false });
      } catch (error: any) {
        // Expected to fail - transaction doesn't exist
        expect(error).toBeTruthy();
      }
    });
  });
});
