// Product configuration shared between frontend and backend
// Note: priceId values are placeholders and should be configured via environment variables on the server

export const PRODUCTS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "Dashboard básico",
      "Até 5 contas",
      "100 transações/mês",
      "Orçamentos básicos",
      "Suporte por email",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: 9900, // R$ 99.00 em centavos
    priceId: "price_premium", // Placeholder - configured via STRIPE_PRICE_PREMIUM env var on server
    features: [
      "Dashboard completo",
      "Contas ilimitadas",
      "Transações ilimitadas",
      "Orçamentos avançados",
      "Metas e dívidas",
      "Investimentos",
      "Relatórios PDF/Excel",
      "IA Chat",
      "Suporte prioritário",
    ],
  },
  FAMILY: {
    name: "Family",
    price: 19900, // R$ 199.00 em centavos
    priceId: "price_family", // Placeholder - configured via STRIPE_PRICE_FAMILY env var on server
    features: [
      "Tudo do Premium",
      "Até 5 usuários",
      "Colaboração familiar",
      "Compartilhamento de orçamentos",
      "Controle de permissões",
      "Suporte 24/7",
      "Gerente de conta dedicado",
    ],
  },
} as const;

export type PlanType = keyof typeof PRODUCTS;

// Helper function to get price ID with environment variable override (server-side only)
export function getPriceId(plan: "PREMIUM" | "FAMILY"): string {
  const envKey = `STRIPE_PRICE_${plan}`;
  // This will only work on server-side where process.env is available
  if (typeof process !== "undefined" && process.env && process.env[envKey]) {
    return process.env[envKey] as string;
  }
  return PRODUCTS[plan].priceId as string;
}
