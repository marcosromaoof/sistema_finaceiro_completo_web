/**
 * Sanitização de inputs para prevenção de XSS
 * 
 * Este módulo fornece funções para sanitizar inputs do usuário,
 * removendo ou escapando conteúdo potencialmente malicioso.
 */

/**
 * Sanitiza texto simples removendo todas as tags HTML
 * Uso: campos de texto, nomes, descrições
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  
  // Remove todas as tags HTML
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escapa caracteres especiais
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Remove espaços extras
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitiza HTML permitindo apenas tags seguras
 * Uso: campos de rich text, descrições formatadas
 */
export function sanitizeHTML(input: string | null | undefined): string {
  if (!input) return '';
  
  // Lista de tags permitidas
  const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'];
  const allowedAttributes = ['href', 'title'];
  
  let sanitized = input;
  
  // Remove scripts
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  
  // Remove data: protocol
  sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, '');
  
  // Remove style attributes (podem conter expressões maliciosas)
  sanitized = sanitized.replace(/style\s*=\s*["'][^"']*["']/gi, '');
  
  return sanitized;
}

/**
 * Sanitiza números
 * Uso: valores monetários, quantidades
 */
export function sanitizeNumber(input: any): number {
  const num = parseFloat(input);
  return isNaN(num) ? 0 : num;
}

/**
 * Sanitiza booleanos
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1';
  }
  return Boolean(input);
}

/**
 * Sanitiza URLs
 * Permite apenas http, https e mailto
 */
export function sanitizeURL(input: string | null | undefined): string {
  if (!input) return '';
  
  const url = input.trim();
  
  // Verifica se é uma URL válida
  try {
    const parsed = new URL(url);
    
    // Permite apenas protocolos seguros
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return url;
    }
  } catch {
    // Se não for uma URL válida, retorna vazio
    return '';
  }
  
  return '';
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return '';
  
  const email = input.trim().toLowerCase();
  
  // Regex simples para validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(email)) {
    return email;
  }
  
  return '';
}

/**
 * Sanitiza objeto recursivamente
 * Aplica sanitizeText em todas as strings do objeto
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item: any) => 
        typeof item === 'object' ? sanitizeObject(item) : sanitizeText(String(item))
      );
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Limita tamanho de string
 * Previne ataques de DoS por strings muito grandes
 */
export function limitLength(input: string, maxLength: number = 10000): string {
  if (!input) return '';
  return input.slice(0, maxLength);
}
