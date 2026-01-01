/**
 * Rate Limiting simples por IP
 * 
 * Protege contra brute force e DDoS básicos
 * Sem dependências externas
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;      // Janela de tempo em milissegundos
  maxRequests: number;   // Máximo de requisições por janela
  message?: string;      // Mensagem de erro customizada
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// Armazena contadores por IP
const requestCounts = new Map<string, RequestRecord>();

// Limpa registros antigos a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  const ipsToDelete: string[] = [];
  requestCounts.forEach((record, ip) => {
    if (now > record.resetTime) {
      ipsToDelete.push(ip);
    }
  });
  ipsToDelete.forEach(ip => requestCounts.delete(ip));
}, 5 * 60 * 1000);

/**
 * Cria middleware de rate limiting
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Muitas requisições. Tente novamente mais tarde.'
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // Obtém IP do cliente
    const ip = getClientIP(req);
    
    if (!ip) {
      // Se não conseguir obter IP, permite a requisição
      return next();
    }

    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      // Primeira requisição ou janela expirou
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      // Limite excedido
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', record.resetTime.toString());
      
      return res.status(429).json({
        error: message,
        retryAfter,
        resetTime: new Date(record.resetTime).toISOString()
      });
    }

    // Incrementa contador
    record.count++;
    requestCounts.set(ip, record);

    // Adiciona headers informativos
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - record.count).toString());
    res.setHeader('X-RateLimit-Reset', record.resetTime.toString());

    next();
  };
}

/**
 * Obtém IP do cliente considerando proxies
 */
function getClientIP(req: Request): string | null {
  // Tenta obter IP de headers de proxy
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }

  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  // Fallback para IP direto
  return req.ip || req.socket.remoteAddress || null;
}

/**
 * Rate limiters pré-configurados
 */

// Rate limiter padrão: 300 requisições por minuto (aumentado para landing page)
export const defaultRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 300,
  message: 'Muitas requisições. Tente novamente em 1 minuto.'
});

// Rate limiter para tRPC: 500 requisições por minuto
export const trpcRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 500,
  message: 'Muitas requisições. Tente novamente em 1 minuto.'
});

// Rate limiter estrito para autenticação: 5 tentativas por 15 minutos
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

// Rate limiter para APIs: 1000 requisições por hora
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 1000,
  message: 'Limite de API excedido. Tente novamente em 1 hora.'
});

// Rate limiter para criação de recursos: 20 por minuto
export const resourceCreationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 20,
  message: 'Você está criando recursos muito rápido. Aguarde 1 minuto.'
});

/**
 * Estatísticas de rate limiting (para monitoramento)
 */
export function getRateLimitStats() {
  const now = Date.now();
  const activeIPs = Array.from(requestCounts.entries())
    .filter(([, record]) => now <= record.resetTime)
    .map(([ip, record]) => ({
      ip,
      count: record.count,
      resetTime: new Date(record.resetTime).toISOString()
    }));

  return {
    totalActiveIPs: activeIPs.length,
    totalStoredIPs: requestCounts.size,
    activeIPs: activeIPs.slice(0, 10) // Primeiros 10 para não expor muito
  };
}

/**
 * Limpa todos os registros (útil para testes)
 */
export function clearRateLimitRecords() {
  requestCounts.clear();
}
