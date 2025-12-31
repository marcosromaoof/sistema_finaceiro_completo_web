import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { dividends, type Dividend, type InsertDividend } from "../drizzle/schema";

/**
 * Criar um novo registro de dividendo/juros
 */
export async function createDividend(data: InsertDividend): Promise<Dividend> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [dividend] = await db.insert(dividends).values(data).$returningId();
  const [created] = await db.select().from(dividends).where(eq(dividends.id, dividend.id));
  return created!;
}

/**
 * Listar dividendos do usuário com filtros opcionais
 */
export async function listDividends(
  userId: number,
  filters?: {
    investmentId?: number;
    type?: "dividend" | "jcp" | "interest" | "bonus";
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Dividend[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(dividends.userId, userId)];

  if (filters?.investmentId) {
    conditions.push(eq(dividends.investmentId, filters.investmentId));
  }

  if (filters?.type) {
    conditions.push(eq(dividends.type, filters.type));
  }

  if (filters?.startDate) {
    conditions.push(gte(dividends.paymentDate, filters.startDate));
  }

  if (filters?.endDate) {
    conditions.push(lte(dividends.paymentDate, filters.endDate));
  }

  return db
    .select()
    .from(dividends)
    .where(and(...conditions))
    .orderBy(desc(dividends.paymentDate));
}

/**
 * Obter um dividendo específico
 */
export async function getDividendById(id: number, userId: number): Promise<Dividend | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [dividend] = await db
    .select()
    .from(dividends)
    .where(and(eq(dividends.id, id), eq(dividends.userId, userId)));
  return dividend;
}

/**
 * Atualizar um dividendo
 */
export async function updateDividend(
  id: number,
  userId: number,
  data: Partial<InsertDividend>
): Promise<Dividend | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(dividends)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(dividends.id, id), eq(dividends.userId, userId)));

  return getDividendById(id, userId);
}

/**
 * Deletar um dividendo
 */
export async function deleteDividend(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(dividends)
    .where(and(eq(dividends.id, id), eq(dividends.userId, userId)));
  return true;
}

/**
 * Obter estatísticas de dividendos
 */
export async function getDividendStats(
  userId: number,
  filters?: {
    investmentId?: number;
    year?: number;
  }
): Promise<{
  totalReceived: number;
  monthlyAverage: number;
  yearlyTotal: number;
  byType: Record<string, number>;
  byInvestment: Array<{ investmentId: number; total: number }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalReceived: 0,
      monthlyAverage: 0,
      yearlyTotal: 0,
      byType: {},
      byInvestment: [],
    };
  }
  
  const conditions = [eq(dividends.userId, userId)];

  if (filters?.investmentId) {
    conditions.push(eq(dividends.investmentId, filters.investmentId));
  }

  if (filters?.year) {
    const startDate = new Date(filters.year, 0, 1);
    const endDate = new Date(filters.year, 11, 31, 23, 59, 59);
    conditions.push(gte(dividends.paymentDate, startDate));
    conditions.push(lte(dividends.paymentDate, endDate));
  }

  // Total recebido
  const [totalResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${dividends.amount}), 0)`,
    })
    .from(dividends)
    .where(and(...conditions));

  // Por tipo
  const byTypeResult = await db
    .select({
      type: dividends.type,
      total: sql<number>`COALESCE(SUM(${dividends.amount}), 0)`,
    })
    .from(dividends)
    .where(and(...conditions))
    .groupBy(dividends.type);

  // Por investimento
  const byInvestmentResult = await db
    .select({
      investmentId: dividends.investmentId,
      total: sql<number>`COALESCE(SUM(${dividends.amount}), 0)`,
    })
    .from(dividends)
    .where(and(...conditions))
    .groupBy(dividends.investmentId);

  const totalReceived = Number(totalResult?.total || 0);
  const monthlyAverage = totalReceived / 12;
  const yearlyTotal = totalReceived;

  const byType: Record<string, number> = {};
  byTypeResult.forEach((item: { type: string; total: number }) => {
    byType[item.type] = Number(item.total);
  });

  const byInvestment = byInvestmentResult.map((item: { investmentId: number; total: number }) => ({
    investmentId: item.investmentId,
    total: Number(item.total),
  }));

  return {
    totalReceived,
    monthlyAverage,
    yearlyTotal,
    byType,
    byInvestment,
  };
}
