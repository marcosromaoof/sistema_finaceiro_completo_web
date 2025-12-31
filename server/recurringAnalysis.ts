import { Transaction } from "../drizzle/schema";

export interface RecurringTransaction {
  description: string;
  amount: string;
  frequency: "monthly" | "quarterly" | "yearly" | "weekly";
  occurrences: number;
  lastDate: Date;
  nextExpectedDate: Date;
  annualImpact: number;
  transactions: Transaction[];
  categoryId: number | null;
  accountId: number;
}

/**
 * Detecta transações recorrentes analisando padrões de valores e descrições similares
 */
export function detectRecurringTransactions(
  transactions: Transaction[]
): RecurringTransaction[] {
  // Agrupar transações por descrição e valor similares
  const groups = groupSimilarTransactions(transactions);

  // Analisar cada grupo para detectar padrões recorrentes
  const recurring: RecurringTransaction[] = [];

  for (const group of groups) {
    if (group.length < 2) continue; // Precisa de pelo menos 2 ocorrências

    // Ordenar por data
    const sorted = group.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calcular intervalos entre transações
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = Math.abs(
        new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()
      );
      intervals.push(Math.round(diff / (1000 * 60 * 60 * 24))); // dias
    }

    // Detectar frequência baseada nos intervalos
    const frequency = detectFrequency(intervals);
    if (!frequency) continue;

    // Calcular próxima data esperada
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const nextExpectedDate = calculateNextDate(lastDate, frequency);

    // Calcular impacto anual
    const avgAmount = parseFloat(sorted[0].amount);
    const annualImpact = calculateAnnualImpact(avgAmount, frequency);

    recurring.push({
      description: sorted[0].description || "Sem descrição",
      amount: sorted[0].amount,
      frequency,
      occurrences: sorted.length,
      lastDate,
      nextExpectedDate,
      annualImpact,
      transactions: sorted,
      categoryId: sorted[0].categoryId,
      accountId: sorted[0].accountId,
    });
  }

  // Ordenar por impacto anual (maior primeiro)
  return recurring.sort((a, b) => b.annualImpact - a.annualImpact);
}

/**
 * Agrupa transações com descrições e valores similares
 */
function groupSimilarTransactions(transactions: Transaction[]): Transaction[][] {
  const groups: Map<string, Transaction[]> = new Map();

  for (const transaction of transactions) {
    // Normalizar descrição para comparação
    const normalizedDesc = normalizeDescription(transaction.description || "");
    const amount = parseFloat(transaction.amount);

    // Buscar grupo existente com descrição e valor similares
    let foundGroup = false;
    const entries: Array<[string, Transaction[]]> = [];
    groups.forEach((value, key) => entries.push([key, value]));
    for (const [key, group] of entries) {
      const [groupDesc, groupAmount] = key.split("|");
      const descSimilarity = calculateSimilarity(normalizedDesc, groupDesc);
      const amountDiff = Math.abs(amount - parseFloat(groupAmount)) / amount;

      // Considerar similar se descrição > 80% similar e valor < 10% diferença
      if (descSimilarity > 0.8 && amountDiff < 0.1) {
        group.push(transaction);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      const key = `${normalizedDesc}|${amount}`;
      groups.set(key, [transaction]);
    }
  }

  const result: Transaction[][] = [];
  groups.forEach((value) => result.push(value));
  return result;
}

/**
 * Normaliza descrição removendo números, datas e caracteres especiais
 */
function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/\d+/g, "") // Remove números
    .replace(/[^\w\s]/g, "") // Remove caracteres especiais
    .trim();
}

/**
 * Calcula similaridade entre duas strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calcula distância de Levenshtein entre duas strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Detecta frequência baseada nos intervalos entre transações
 */
function detectFrequency(
  intervals: number[]
): "weekly" | "monthly" | "quarterly" | "yearly" | null {
  if (intervals.length === 0) return null;

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Tolerância de 20% para variações
  if (Math.abs(avgInterval - 7) < 7 * 0.2) return "weekly";
  if (Math.abs(avgInterval - 30) < 30 * 0.2) return "monthly";
  if (Math.abs(avgInterval - 90) < 90 * 0.2) return "quarterly";
  if (Math.abs(avgInterval - 365) < 365 * 0.2) return "yearly";

  return null;
}

/**
 * Calcula próxima data esperada baseada na frequência
 */
function calculateNextDate(
  lastDate: Date,
  frequency: "weekly" | "monthly" | "quarterly" | "yearly"
): Date {
  const next = new Date(lastDate);

  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

/**
 * Calcula impacto anual de uma transação recorrente
 */
function calculateAnnualImpact(
  amount: number,
  frequency: "weekly" | "monthly" | "quarterly" | "yearly"
): number {
  switch (frequency) {
    case "weekly":
      return amount * 52;
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "yearly":
      return amount;
  }
}
