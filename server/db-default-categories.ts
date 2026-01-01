/**
 * Criação automática de categorias padrão para novos usuários
 * 
 * Este módulo garante que todo novo usuário tenha categorias básicas
 * para começar a usar o sistema imediatamente.
 */

import * as db from './db';

export interface DefaultCategory {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isSystem: boolean;
}

/**
 * Lista de categorias padrão que serão criadas para novos usuários
 */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // ==================== DESPESAS ====================
  {
    name: 'Alimentação',
    type: 'expense',
    icon: '🍴',
    color: '#ef4444', // red-500
    isSystem: true
  },
  {
    name: 'Transporte',
    type: 'expense',
    icon: '🚗',
    color: '#f59e0b', // amber-500
    isSystem: true
  },
  {
    name: 'Moradia',
    type: 'expense',
    icon: '🏠',
    color: '#8b5cf6', // violet-500
    isSystem: true
  },
  {
    name: 'Saúde',
    type: 'expense',
    icon: '❤️',
    color: '#10b981', // emerald-500
    isSystem: true
  },
  {
    name: 'Educação',
    type: 'expense',
    icon: '📚',
    color: '#3b82f6', // blue-500
    isSystem: true
  },
  {
    name: 'Lazer',
    type: 'expense',
    icon: '😊',
    color: '#ec4899', // pink-500
    isSystem: true
  },
  {
    name: 'Vestuário',
    type: 'expense',
    icon: '👕',
    color: '#06b6d4', // cyan-500
    isSystem: true
  },
  {
    name: 'Contas',
    type: 'expense',
    icon: '📄',
    color: '#f97316', // orange-500
    isSystem: true
  },
  {
    name: 'Outros',
    type: 'expense',
    icon: '⋯',
    color: '#6b7280', // gray-500
    isSystem: true
  },
  
  // ==================== RECEITAS ====================
  {
    name: 'Salário',
    type: 'income',
    icon: '💵',
    color: '#10b981', // emerald-500
    isSystem: true
  },
  {
    name: 'Investimentos',
    type: 'income',
    icon: '📈',
    color: '#3b82f6', // blue-500
    isSystem: true
  },
  {
    name: 'Freelance',
    type: 'income',
    icon: '💼',
    color: '#8b5cf6', // violet-500
    isSystem: true
  },
  {
    name: 'Outros',
    type: 'income',
    icon: '⋯',
    color: '#6b7280', // gray-500
    isSystem: true
  }
];

/**
 * Cria categorias padrão para um usuário
 * 
 * Esta função é idempotente - pode ser chamada múltiplas vezes sem criar duplicatas
 * 
 * @param userId - ID do usuário
 * @returns Número de categorias criadas
 */
export async function createDefaultCategories(userId: number): Promise<number> {
  try {
    // Verifica se o usuário já tem categorias
    const existingCategories = await db.getUserCategories(userId);
    
    if (existingCategories.length > 0) {
      console.log(`[DefaultCategories] Usuário ${userId} já possui ${existingCategories.length} categorias`);
      return 0;
    }

    // Cria todas as categorias padrão
    let createdCount = 0;
    
    for (const category of DEFAULT_CATEGORIES) {
      try {
        await db.createCategory({
          userId,
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
          isSystem: category.isSystem
        });
        createdCount++;
      } catch (error) {
        console.error(`[DefaultCategories] Erro ao criar categoria ${category.name}:`, error);
        // Continua criando as outras categorias mesmo se uma falhar
      }
    }

    console.log(`[DefaultCategories] Criadas ${createdCount} categorias para usuário ${userId}`);
    return createdCount;
    
  } catch (error) {
    console.error(`[DefaultCategories] Erro ao criar categorias padrão para usuário ${userId}:`, error);
    throw error;
  }
}

/**
 * Cria categorias padrão para múltiplos usuários
 * Útil para migração de usuários existentes
 * 
 * @param userIds - Array de IDs de usuários
 * @returns Objeto com estatísticas de criação
 */
export async function createDefaultCategoriesForUsers(
  userIds: number[]
): Promise<{ success: number; failed: number; skipped: number }> {
  const stats = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (const userId of userIds) {
    try {
      const created = await createDefaultCategories(userId);
      if (created > 0) {
        stats.success++;
      } else {
        stats.skipped++;
      }
    } catch (error) {
      stats.failed++;
      console.error(`[DefaultCategories] Falha para usuário ${userId}:`, error);
    }
  }

  console.log(`[DefaultCategories] Estatísticas: ${JSON.stringify(stats)}`);
  return stats;
}

/**
 * Verifica se um usuário tem categorias padrão
 * 
 * @param userId - ID do usuário
 * @returns true se o usuário tem todas as categorias padrão
 */
export async function hasDefaultCategories(userId: number): Promise<boolean> {
  try {
    const categories = await db.getUserCategories(userId);
    
    // Verifica se tem pelo menos o número mínimo de categorias padrão
    const minCategories = DEFAULT_CATEGORIES.length;
    
    return categories.length >= minCategories;
  } catch (error) {
    console.error(`[DefaultCategories] Erro ao verificar categorias do usuário ${userId}:`, error);
    return false;
  }
}
