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
    priceId: process.env.STRIPE_PRICE_PREMIUM || "price_premium",
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
    priceId: process.env.STRIPE_PRICE_FAMILY || "price_family",
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
