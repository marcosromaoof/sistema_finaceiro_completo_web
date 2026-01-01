import { getDb } from "./db";
import { passiveIncomeGoals, type InsertPassiveIncomeGoal, type PassiveIncomeGoal } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export async function createPassiveIncomeGoal(data: InsertPassiveIncomeGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [goal] = await db.insert(passiveIncomeGoals).values(data).$returningId();
  return goal;
}

export async function listPassiveIncomeGoals(userId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(passiveIncomeGoals.userId, userId)];
  
  if (activeOnly) {
    conditions.push(eq(passiveIncomeGoals.isActive, true));
  }
  
  return await db
    .select()
    .from(passiveIncomeGoals)
    .where(and(...conditions))
    .orderBy(desc(passiveIncomeGoals.createdAt));
}

export async function getPassiveIncomeGoalById(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [goal] = await db
    .select()
    .from(passiveIncomeGoals)
    .where(and(eq(passiveIncomeGoals.id, id), eq(passiveIncomeGoals.userId, userId)));
  
  return goal;
}

export async function updatePassiveIncomeGoal(
  id: number,
  userId: number,
  data: Partial<InsertPassiveIncomeGoal>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(passiveIncomeGoals)
    .set(data)
    .where(and(eq(passiveIncomeGoals.id, id), eq(passiveIncomeGoals.userId, userId)));
  
  return { id };
}

export async function deletePassiveIncomeGoal(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(passiveIncomeGoals)
    .where(and(eq(passiveIncomeGoals.id, id), eq(passiveIncomeGoals.userId, userId)));
  
  return { id };
}
