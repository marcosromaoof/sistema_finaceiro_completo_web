import { eq } from "drizzle-orm";
import { users, InsertUser } from "../drizzle/schema";
import { getDb } from "./db";

export async function updateUser(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(users).set(data).where(eq(users.id, userId));
}
