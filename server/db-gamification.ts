import { getDb } from "./db";
import { userProgress, achievements, achievementProgress, transactions, goals, budgets } from "../drizzle/schema";
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
