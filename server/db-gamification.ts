import { getDb } from "./db";
import { userProgress, achievements, achievementProgress, transactions, goals, budgets, users } from "../drizzle/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";

// ==================== USER PROGRESS ====================

export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const [progress] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  if (!progress) {
    // Create initial progress
    const [newProgress] = await db
      .insert(userProgress)
      .values({
        userId,
        totalXp: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
      })
      .$returningId();
    
    return await getUserProgress(userId);
  }

  return progress;
}

export async function addXP(userId: number, xpAmount: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const progress = await getUserProgress(userId);
  const newTotalXp = progress.totalXp + xpAmount;
  const newLevel = calculateLevel(newTotalXp);

  await db
    .update(userProgress)
    .set({
      totalXp: newTotalXp,
      currentLevel: newLevel,
      lastActivityDate: new Date(),
    })
    .where(eq(userProgress.userId, userId));

  return {
    leveledUp: newLevel > progress.currentLevel,
    oldLevel: progress.currentLevel,
    newLevel,
    totalXp: newTotalXp,
  };
}

export async function updateStreak(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const progress = await getUserProgress(userId);
  const now = new Date();
  const lastActivity = progress.lastActivityDate;

  if (!lastActivity) {
    // First activity
    await db
      .update(userProgress)
      .set({
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: now,
      })
      .where(eq(userProgress.userId, userId));
    return { currentStreak: 1, isNewStreak: true };
  }

  const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Same day, no change
    return { currentStreak: progress.currentStreak, isNewStreak: false };
  } else if (daysDiff === 1) {
    // Consecutive day
    const newStreak = progress.currentStreak + 1;
    const newLongest = Math.max(newStreak, progress.longestStreak);

    await db
      .update(userProgress)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: now,
      })
      .where(eq(userProgress.userId, userId));

    return { currentStreak: newStreak, isNewStreak: true };
  } else {
    // Streak broken
    await db
      .update(userProgress)
      .set({
        currentStreak: 1,
        lastActivityDate: now,
      })
      .where(eq(userProgress.userId, userId));

    return { currentStreak: 1, isNewStreak: false, streakBroken: true };
  }
}

// ==================== ACHIEVEMENTS ====================

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return await db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.unlockedAt));
}

export async function unlockAchievement(
  userId: number,
  achievementType: string,
  level: "bronze" | "silver" | "gold",
  xpEarned: number
) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  // Check if already unlocked
  const [existing] = await db
    .select()
    .from(achievements)
    .where(
      and(
        eq(achievements.userId, userId),
        eq(achievements.achievementType, achievementType),
        eq(achievements.level, level)
      )
    );

  if (existing) {
    return { alreadyUnlocked: true, achievement: existing };
  }

  // Unlock achievement
  const [newAchievement] = await db
    .insert(achievements)
    .values({
      userId,
      achievementType,
      level,
      xpEarned,
    })
    .$returningId();

  // Add XP
  await addXP(userId, xpEarned);

  return {
    alreadyUnlocked: false,
    achievement: await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, newAchievement.id))
      .then((rows: any[]) => rows[0]),
  };
}

export async function getAchievementProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return await db
    .select()
    .from(achievementProgress)
    .where(eq(achievementProgress.userId, userId));
}

export async function updateAchievementProgress(
  userId: number,
  achievementType: string,
  level: "bronze" | "silver" | "gold",
  currentProgress: number,
  targetProgress: number
) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const [existing] = await db
    .select()
    .from(achievementProgress)
    .where(
      and(
        eq(achievementProgress.userId, userId),
        eq(achievementProgress.achievementType, achievementType),
        eq(achievementProgress.level, level)
      )
    );

  if (existing) {
    await db
      .update(achievementProgress)
      .set({ currentProgress })
      .where(eq(achievementProgress.id, existing.id));
  } else {
    await db.insert(achievementProgress).values({
      userId,
      achievementType,
      level,
      currentProgress,
      targetProgress,
    });
  }

  // Check if achievement should be unlocked
  if (currentProgress >= targetProgress) {
    const xpRewards = {
      bronze: 100,
      silver: 250,
      gold: 500,
    };

    await unlockAchievement(userId, achievementType, level, xpRewards[level]);
    return { unlocked: true };
  }

  return { unlocked: false };
}

// ==================== ACHIEVEMENT DETECTION ====================

export async function checkTransactionAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const transactionCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .then((rows: any[]) => Number(rows[0]?.count || 0));

  // Primeiros Passos
  if (transactionCount >= 5) {
    await updateAchievementProgress(userId, 'primeiros_passos', 'bronze', transactionCount, 5);
  }
  if (transactionCount >= 20) {
    await updateAchievementProgress(userId, 'primeiros_passos', 'silver', transactionCount, 20);
  }
  if (transactionCount >= 50) {
    await updateAchievementProgress(userId, 'primeiros_passos', 'gold', transactionCount, 50);
  }
}

export async function checkGoalAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const completedGoals = await db
    .select({ count: sql<number>`count(*)` })
    .from(goals)
    .where(
      eq(goals.userId, userId)
    )
    .then((rows: any[]) => Number(rows[0]?.count || 0));

  // Caçador de Metas
  if (completedGoals >= 1) {
    await updateAchievementProgress(userId, 'cacador_metas', 'bronze', completedGoals, 1);
  }
  if (completedGoals >= 3) {
    await updateAchievementProgress(userId, 'cacador_metas', 'silver', completedGoals, 3);
  }
  if (completedGoals >= 5) {
    await updateAchievementProgress(userId, 'cacador_metas', 'gold', completedGoals, 5);
  }
}

export async function checkStreakAchievements(userId: number) {
  const progress = await getUserProgress(userId);
  const streak = progress.currentStreak;

  // Analista Financeiro (dias consecutivos)
  if (streak >= 7) {
    await updateAchievementProgress(userId, 'analista_financeiro', 'bronze', streak, 7);
  }
  if (streak >= 30) {
    await updateAchievementProgress(userId, 'analista_financeiro', 'silver', streak, 30);
  }
  if (streak >= 90) {
    await updateAchievementProgress(userId, 'analista_financeiro', 'gold', streak, 90);
  }
}

export async function checkBudgetAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  // Count months following budget (simplified - would need more complex logic)
  const budgetCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .then((rows: any[]) => Number(rows[0]?.count || 0));

  // Orçamento no Controle
  if (budgetCount >= 1) {
    await updateAchievementProgress(userId, 'orcamento_controle', 'bronze', budgetCount, 1);
  }
  if (budgetCount >= 3) {
    await updateAchievementProgress(userId, 'orcamento_controle', 'silver', budgetCount, 3);
  }
  if (budgetCount >= 6) {
    await updateAchievementProgress(userId, 'orcamento_controle', 'gold', budgetCount, 6);
  }
}

// ==================== LEVEL CALCULATION ====================

function calculateLevel(totalXp: number): number {
  if (totalXp < 500) return 1;
  if (totalXp < 1500) return 2;
  if (totalXp < 3500) return 3;
  if (totalXp < 7000) return 4;
  return 5;
}

export function getLevelInfo(level: number) {
  const levels = [
    { level: 1, title: "Aprendiz Financeiro", minXp: 0, maxXp: 500 },
    { level: 2, title: "Economista Iniciante", minXp: 500, maxXp: 1500 },
    { level: 3, title: "Gestor Financeiro", minXp: 1500, maxXp: 3500 },
    { level: 4, title: "Mestre das Finanças", minXp: 3500, maxXp: 7000 },
    { level: 5, title: "Guru Financeiro", minXp: 7000, maxXp: Infinity },
  ];

  return levels[level - 1] || levels[0];
}

// ==================== DAILY XP ACTIONS ====================

export async function addDailyLoginXP(userId: number) {
  const streakInfo = await updateStreak(userId);
  const baseXp = 20;
  
  // Bonus XP for streaks
  let bonusXp = 0;
  if (streakInfo.currentStreak === 7) bonusXp = 100;
  else if (streakInfo.currentStreak === 30) bonusXp = 500;
  else if (streakInfo.currentStreak === 90) bonusXp = 1500;
  else if (streakInfo.currentStreak === 365) bonusXp = 5000;

  const totalXp = baseXp + bonusXp;
  await addXP(userId, totalXp);

  return {
    xpEarned: totalXp,
    streak: streakInfo.currentStreak,
    bonusXp,
  };
}

export async function addTransactionXP(userId: number) {
  await addXP(userId, 10);
  await checkTransactionAchievements(userId);
  await checkStreakAchievements(userId);
}

export async function addGoalCompletedXP(userId: number) {
  await addXP(userId, 150);
  await checkGoalAchievements(userId);
}

export async function addBudgetReviewXP(userId: number) {
  await addXP(userId, 50);
  await checkBudgetAchievements(userId);
}

// ==================== LEADERBOARD ====================

export async function getLeaderboard(period: "all" | "monthly" | "weekly" = "all", limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  // Calcular data de início baseado no período
  let startDate: Date | null = null;
  const now = new Date();

  if (period === "weekly") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === "monthly") {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  }

  // Query base: buscar progresso de usuários
  let query = db
    .select({
      userId: userProgress.userId,
      totalXp: userProgress.totalXp,
      currentLevel: userProgress.currentLevel,
      currentStreak: userProgress.currentStreak,
      userName: users.name,
      userEmail: users.email,
    })
    .from(userProgress)
    .leftJoin(users, eq(userProgress.userId, users.id))
    .orderBy(desc(userProgress.totalXp))
    .limit(limit);

  // Se período não é "all", filtrar por data
  if (startDate) {
    query = query.where(gte(userProgress.updatedAt, startDate)) as any;
  }

  const leaderboard = await query;

  // Adicionar ranking position
  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    levelInfo: getLevelInfo(entry.currentLevel),
  }));
}

// ==================== SPECIAL & SEASONAL ACHIEVEMENTS ====================

/**
 * Conquistas especiais por milestones importantes
 */
export async function checkMilestoneAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  // Primeira Transação (milestone especial)
  const firstTransaction = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .limit(1);

  if (firstTransaction.length > 0) {
    await updateAchievementProgress(userId, 'primeira_transacao', 'bronze', 1, 1);
  }

  // 100 Transações (milestone importante)
  const transactionCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .then((rows: any[]) => Number(rows[0]?.count || 0));

  if (transactionCount >= 100) {
    await updateAchievementProgress(userId, 'centenario', 'gold', transactionCount, 100);
  }

  // 500 Transações (milestone épico)
  if (transactionCount >= 500) {
    await updateAchievementProgress(userId, 'mestre_financas', 'gold', transactionCount, 500);
  }

  // Primeira Meta Alcançada
  const completedGoals = await db
    .select({ count: sql<number>`count(*)` })
    .from(goals)
    .where(eq(goals.userId, userId))
    .then((rows: any[]) => Number(rows[0]?.count || 0));

  if (completedGoals >= 1) {
    await updateAchievementProgress(userId, 'primeira_meta', 'bronze', completedGoals, 1);
  }
}

/**
 * Conquistas sazonais (Ano Novo, Black Friday, etc.)
 */
export async function checkSeasonalAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Ano Novo (Janeiro 1-7)
  if (month === 1 && day <= 7) {
    const transactionsThisWeek = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, new Date(now.getFullYear(), 0, 1))
        )
      )
      .then((rows: any[]) => Number(rows[0]?.count || 0));

    if (transactionsThisWeek >= 5) {
      await updateAchievementProgress(userId, 'ano_novo_2025', 'gold', transactionsThisWeek, 5);
    }
  }

  // Black Friday (Novembro 20-30)
  if (month === 11 && day >= 20 && day <= 30) {
    const transactionsThisWeek = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, new Date(now.getFullYear(), 10, 20))
        )
      )
      .then((rows: any[]) => Number(rows[0]?.count || 0));

    if (transactionsThisWeek >= 10) {
      await updateAchievementProgress(userId, 'black_friday_2024', 'gold', transactionsThisWeek, 10);
    }
  }

  // Natal (Dezembro 20-31)
  if (month === 12 && day >= 20) {
    const transactionsThisWeek = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, new Date(now.getFullYear(), 11, 20))
        )
      )
      .then((rows: any[]) => Number(rows[0]?.count || 0));

    if (transactionsThisWeek >= 5) {
      await updateAchievementProgress(userId, 'natal_2024', 'gold', transactionsThisWeek, 5);
    }
  }
}

/**
 * Sistema de XP Bônus por eventos especiais
 */
export async function addBonusXP(userId: number, reason: string, multiplier: number = 2) {
  const baseXp = 50;
  const bonusXp = baseXp * multiplier;
  
  await addXP(userId, bonusXp);
  
  return {
    xpEarned: bonusXp,
    reason,
    multiplier,
  };
}

/**
 * Verifica e aplica XP bônus sazonal
 */
export async function checkSeasonalBonusXP(userId: number) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Dobro de XP no Ano Novo (Janeiro 1-7)
  if (month === 1 && day <= 7) {
    return await addBonusXP(userId, 'Bônus de Ano Novo! 🎉', 2);
  }

  // Triplo de XP na Black Friday (Novembro 25)
  if (month === 11 && day === 25) {
    return await addBonusXP(userId, 'Bônus de Black Friday! 🛍️', 3);
  }

  // Dobro de XP no Natal (Dezembro 25)
  if (month === 12 && day === 25) {
    return await addBonusXP(userId, 'Bônus de Natal! 🎄', 2);
  }

  return null;
}

// ==================== PUBLIC PROFILE ====================

export async function getPublicProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  // Buscar informações do usuário
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Buscar progresso
  const progress = await getUserProgress(userId);

  // Buscar conquistas em progresso
  const achievementsInProgress = await db
    .select({
      id: achievementProgress.id,
      achievementType: achievementProgress.achievementType,
      level: achievementProgress.level,
      currentProgress: achievementProgress.currentProgress,
      targetProgress: achievementProgress.targetProgress,
      updatedAt: achievementProgress.updatedAt,
    })
    .from(achievementProgress)
    .where(eq(achievementProgress.userId, userId))
    .orderBy(desc(achievementProgress.updatedAt));

  // Calcular conquistas completadas (currentProgress >= targetProgress)
  const completedAchievements = achievementsInProgress.filter(
    (a: any) => a.currentProgress >= a.targetProgress
  );

  // Buscar estatísticas gerais
  const [transactionStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .then((rows: any[]) => rows.map(r => ({ count: Number(r.count || 0) })));

  const [goalStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(goals)
    .where(eq(goals.userId, userId))
    .then((rows: any[]) => rows.map(r => ({ count: Number(r.count || 0) })));

  // Calcular posição no ranking global
  const allUsers = await getLeaderboard("all", 1000);
  const rankPosition = allUsers.findIndex((u: any) => u.userId === userId) + 1;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    progress: {
      totalXp: progress.totalXp,
      currentLevel: progress.currentLevel,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastActivityDate: progress.lastActivityDate,
    },
    achievements: {
      total: completedAchievements.length,
      list: completedAchievements,
    },
    stats: {
      transactions: transactionStats?.count || 0,
      goals: goalStats?.count || 0,
      rankPosition: rankPosition > 0 ? rankPosition : null,
    },
    levelInfo: getLevelInfo(progress.currentLevel),
  };
}
