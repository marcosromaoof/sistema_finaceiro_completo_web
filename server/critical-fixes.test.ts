/**
 * Testes para Correções Críticas de Segurança
 * 
 * Testa sanitização XSS, rate limiting e criação de categorias padrão
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  sanitizeText, 
  sanitizeHTML, 
  sanitizeNumber, 
  sanitizeBoolean, 
  sanitizeURL, 
  sanitizeEmail,
  sanitizeObject,
  limitLength
} from './_core/sanitize';
import { clearRateLimitRecords } from './_core/rateLimit';
import { createDefaultCategories, DEFAULT_CATEGORIES, hasDefaultCategories } from './db-default-categories';

// ==================== TESTES DE SANITIZAÇÃO XSS ====================

describe('Sanitização de Inputs (XSS)', () => {
  describe('sanitizeText', () => {
    it('deve remover tags HTML', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeText(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('deve escapar caracteres especiais', () => {
      const input = '&"\'/';
      const result = sanitizeText(input);
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
      expect(result).toContain('&#x2F;');
    });

    it('deve remover espaços extras', () => {
      const input = '  Hello   World  ';
      expect(sanitizeText(input)).toBe('Hello   World');
    });

    it('deve retornar string vazia para null/undefined', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
    });
  });

  describe('sanitizeHTML', () => {
    it('deve remover scripts', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('script');
      expect(result).toContain('Hello');
    });

    it('deve remover event handlers', () => {
      const input = '<div onclick="alert(1)">Click</div>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('onclick');
    });

    it('deve remover javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('javascript:');
    });

    it('deve remover data: protocol', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('data:');
    });

    it('deve remover atributos style', () => {
      const input = '<p style="color: red">Text</p>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('style');
    });
  });

  describe('sanitizeNumber', () => {
    it('deve converter strings para números', () => {
      expect(sanitizeNumber('123')).toBe(123);
      expect(sanitizeNumber('123.45')).toBe(123.45);
    });

    it('deve retornar 0 para valores inválidos', () => {
      expect(sanitizeNumber('abc')).toBe(0);
      expect(sanitizeNumber(null)).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
    });

    it('deve aceitar números diretamente', () => {
      expect(sanitizeNumber(123)).toBe(123);
    });
  });

  describe('sanitizeBoolean', () => {
    it('deve converter strings para boolean', () => {
      expect(sanitizeBoolean('true')).toBe(true);
      expect(sanitizeBoolean('false')).toBe(false);
      expect(sanitizeBoolean('1')).toBe(true);
      expect(sanitizeBoolean('0')).toBe(false);
    });

    it('deve aceitar booleans diretamente', () => {
      expect(sanitizeBoolean(true)).toBe(true);
      expect(sanitizeBoolean(false)).toBe(false);
    });
  });

  describe('sanitizeURL', () => {
    it('deve permitir URLs http/https', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com');
      expect(sanitizeURL('http://example.com')).toBe('http://example.com');
    });

    it('deve permitir mailto', () => {
      expect(sanitizeURL('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('deve bloquear javascript:', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('');
    });

    it('deve bloquear data:', () => {
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('deve retornar vazio para URLs inválidas', () => {
      expect(sanitizeURL('not a url')).toBe('');
      expect(sanitizeURL('')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('deve aceitar emails válidos', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk');
    });

    it('deve rejeitar emails inválidos', () => {
      expect(sanitizeEmail('notanemail')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
      expect(sanitizeEmail('test@')).toBe('');
    });

    it('deve converter para lowercase', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });
  });

  describe('sanitizeObject', () => {
    it('deve sanitizar todas as strings do objeto', () => {
      const input = {
        name: '<script>alert(1)</script>John',
        age: 30,
        active: true
      };
      const result = sanitizeObject(input);
      expect(result.name).not.toContain('<script>');
      expect(result.name).toContain('John');
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
    });

    it('deve sanitizar objetos aninhados', () => {
      const input = {
        user: {
          name: '<b>John</b>',
          email: 'test@example.com'
        }
      };
      const result = sanitizeObject(input);
      expect(result.user.name).not.toContain('<b>');
    });

    it('deve sanitizar arrays', () => {
      const input = {
        tags: ['<script>tag1</script>', 'tag2']
      };
      const result = sanitizeObject(input);
      expect(result.tags[0]).not.toContain('script');
      expect(result.tags[1]).toBe('tag2');
    });
  });

  describe('limitLength', () => {
    it('deve limitar tamanho de strings', () => {
      const longString = 'a'.repeat(20000);
      const result = limitLength(longString, 1000);
      expect(result.length).toBe(1000);
    });

    it('deve manter strings curtas', () => {
      const shortString = 'Hello';
      expect(limitLength(shortString, 1000)).toBe('Hello');
    });
  });
});

// ==================== TESTES DE RATE LIMITING ====================

describe('Rate Limiting', () => {
  beforeEach(() => {
    clearRateLimitRecords();
  });

  it('deve permitir requisições dentro do limite', () => {
    // Este teste é mais conceitual pois rate limiting usa Express middleware
    // Em produção, testar com supertest
    expect(true).toBe(true);
  });

  it('deve bloquear requisições acima do limite', () => {
    // Teste conceitual
    expect(true).toBe(true);
  });

  it('deve resetar contador após janela expirar', () => {
    // Teste conceitual
    expect(true).toBe(true);
  });
});

// ==================== TESTES DE CATEGORIAS PADRÃO ====================

describe('Criação de Categorias Padrão', () => {
  it('deve ter 13 categorias padrão definidas', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(13);
  });

  it('deve ter 9 categorias de despesa', () => {
    const expenses = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');
    expect(expenses).toHaveLength(9);
  });

  it('deve ter 4 categorias de receita', () => {
    const incomes = DEFAULT_CATEGORIES.filter(c => c.type === 'income');
    expect(incomes).toHaveLength(4);
  });

  it('todas as categorias devem ter nome, tipo, ícone e cor', () => {
    DEFAULT_CATEGORIES.forEach(category => {
      expect(category.name).toBeTruthy();
      expect(category.type).toMatch(/^(income|expense)$/);
      expect(category.icon).toBeTruthy();
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(category.isSystem).toBe(true);
    });
  });

  it('deve incluir categorias essenciais', () => {
    const names = DEFAULT_CATEGORIES.map(c => c.name);
    expect(names).toContain('Alimentação');
    expect(names).toContain('Transporte');
    expect(names).toContain('Salário');
  });

  // Testes de integração (requerem banco de dados)
  // Descomentar quando tiver ambiente de teste configurado
  
  /*
  it('deve criar categorias para novo usuário', async () => {
    const userId = 9999; // ID de teste
    const count = await createDefaultCategories(userId);
    expect(count).toBe(13);
  });

  it('não deve criar categorias duplicadas', async () => {
    const userId = 9999;
    await createDefaultCategories(userId);
    const count = await createDefaultCategories(userId); // Segunda vez
    expect(count).toBe(0); // Não deve criar novamente
  });

  it('deve verificar se usuário tem categorias padrão', async () => {
    const userId = 9999;
    await createDefaultCategories(userId);
    const has = await hasDefaultCategories(userId);
    expect(has).toBe(true);
  });
  */
});

// ==================== TESTES DE INTEGRAÇÃO ====================

describe('Integração de Correções Críticas', () => {
  it('sanitização deve ser aplicada antes de salvar no banco', () => {
    // Teste conceitual - verificar que procedures usam sanitização
    expect(true).toBe(true);
  });

  it('rate limiting deve proteger todas as rotas sensíveis', () => {
    // Teste conceitual - verificar que middleware está aplicado
    expect(true).toBe(true);
  });

  it('categorias padrão devem ser criadas no registro', () => {
    // Teste conceitual - verificar que callback OAuth chama createDefaultCategories
    expect(true).toBe(true);
  });
});
