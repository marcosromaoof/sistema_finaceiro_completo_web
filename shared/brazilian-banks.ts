/**
 * Lista completa de instituições financeiras brasileiras
 * Inclui bancos tradicionais, digitais, fintechs e cooperativas
 */

export interface BrazilianBank {
  code: string;
  name: string;
  fullName: string;
  type: "traditional" | "digital" | "fintech" | "cooperative";
  popular: boolean;
}

export const BRAZILIAN_BANKS: BrazilianBank[] = [
  // Bancos Digitais Populares
  { code: "260", name: "Nubank", fullName: "Nu Pagamentos S.A.", type: "digital", popular: true },
  { code: "077", name: "Banco Inter", fullName: "Banco Inter S.A.", type: "digital", popular: true },
  { code: "336", name: "C6 Bank", fullName: "Banco C6 S.A.", type: "digital", popular: true },
  { code: "290", name: "PagBank", fullName: "PagSeguro Internet S.A.", type: "digital", popular: true },
  { code: "323", name: "Mercado Pago", fullName: "Mercado Pago", type: "fintech", popular: true },
  { code: "380", name: "PicPay", fullName: "PicPay Serviços S.A.", type: "fintech", popular: true },
  { code: "403", name: "Cora", fullName: "Cora Sociedade de Crédito Direto S.A.", type: "digital", popular: true },
  { code: "197", name: "Stone", fullName: "Stone Pagamentos S.A.", type: "fintech", popular: true },
  { code: "102", name: "XP Investimentos", fullName: "XP Investimentos S.A.", type: "digital", popular: true },
  { code: "450", name: "Neon", fullName: "Neon Pagamentos S.A.", type: "digital", popular: true },
  
  // Bancos Tradicionais
  { code: "001", name: "Banco do Brasil", fullName: "Banco do Brasil S.A.", type: "traditional", popular: true },
  { code: "237", name: "Bradesco", fullName: "Banco Bradesco S.A.", type: "traditional", popular: true },
  { code: "341", name: "Itaú", fullName: "Itaú Unibanco S.A.", type: "traditional", popular: true },
  { code: "104", name: "Caixa Econômica", fullName: "Caixa Econômica Federal", type: "traditional", popular: true },
  { code: "033", name: "Santander", fullName: "Banco Santander Brasil S.A.", type: "traditional", popular: true },
  { code: "745", name: "Citibank", fullName: "Banco Citibank S.A.", type: "traditional", popular: false },
  { code: "399", name: "HSBC", fullName: "HSBC Bank Brasil S.A.", type: "traditional", popular: false },
  { code: "422", name: "Safra", fullName: "Banco Safra S.A.", type: "traditional", popular: true },
  { code: "633", name: "Rendimento", fullName: "Banco Rendimento S.A.", type: "traditional", popular: false },
  { code: "655", name: "Votorantim", fullName: "Banco Votorantim S.A.", type: "traditional", popular: false },
  { code: "041", name: "Banrisul", fullName: "Banco do Estado do Rio Grande do Sul S.A.", type: "traditional", popular: false },
  { code: "070", name: "BRB", fullName: "Banco de Brasília S.A.", type: "traditional", popular: false },
  { code: "047", name: "Banco do Nordeste", fullName: "Banco do Nordeste do Brasil S.A.", type: "traditional", popular: false },
  { code: "021", name: "Banestes", fullName: "Banco do Estado do Espírito Santo S.A.", type: "traditional", popular: false },
  { code: "756", name: "Bancoob", fullName: "Banco Cooperativo do Brasil S.A.", type: "cooperative", popular: true },
  { code: "748", name: "Sicredi", fullName: "Banco Cooperativo Sicredi S.A.", type: "cooperative", popular: true },
  { code: "136", name: "Unicred", fullName: "Unicred do Brasil", type: "cooperative", popular: false },
  
  // Fintechs e Bancos Digitais
  { code: "212", name: "Banco Original", fullName: "Banco Original S.A.", type: "digital", popular: false },
  { code: "389", name: "Banco Mercantil", fullName: "Banco Mercantil do Brasil S.A.", type: "traditional", popular: false },
  { code: "623", name: "Banco Pan", fullName: "Banco Pan S.A.", type: "traditional", popular: true },
  { code: "318", name: "BMG", fullName: "Banco BMG S.A.", type: "traditional", popular: false },
  { code: "626", name: "C6 Consignado", fullName: "Banco C6 Consignado S.A.", type: "digital", popular: false },
  { code: "654", name: "Banco A.J. Renner", fullName: "Banco A.J. Renner S.A.", type: "traditional", popular: false },
  { code: "643", name: "Banco Pine", fullName: "Banco Pine S.A.", type: "traditional", popular: false },
  { code: "246", name: "Banco ABC Brasil", fullName: "Banco ABC Brasil S.A.", type: "traditional", popular: false },
  { code: "025", name: "Banco Alfa", fullName: "Banco Alfa S.A.", type: "traditional", popular: false },
  { code: "121", name: "Banco Agibank", fullName: "Banco Agibank S.A.", type: "digital", popular: false },
  { code: "739", name: "Banco Cetelem", fullName: "Banco Cetelem S.A.", type: "traditional", popular: false },
  { code: "743", name: "Banco Semear", fullName: "Banco Semear S.A.", type: "traditional", popular: false },
  { code: "100", name: "Planner Corretora", fullName: "Planner Corretora de Valores S.A.", type: "fintech", popular: false },
  { code: "096", name: "Banco B3", fullName: "Banco B3 S.A.", type: "traditional", popular: false },
  { code: "301", name: "BPP", fullName: "BPP Instituição de Pagamento S.A.", type: "fintech", popular: false },
  { code: "173", name: "BRL Trust", fullName: "BRL Trust Distribuidora de Títulos e Valores Mobiliários S.A.", type: "fintech", popular: false },
  { code: "142", name: "Broker Brasil", fullName: "Broker Brasil Corretora de Câmbio Ltda.", type: "fintech", popular: false },
  { code: "144", name: "Bexs", fullName: "Bexs Banco de Câmbio S.A.", type: "fintech", popular: false },
  { code: "126", name: "BR Partners", fullName: "BR Partners Banco de Investimento S.A.", type: "traditional", popular: false },
  { code: "292", name: "BS2", fullName: "BS2 Distribuidora de Títulos e Valores Mobiliários S.A.", type: "digital", popular: false },
  { code: "364", name: "Gerencianet", fullName: "Gerencianet Pagamentos do Brasil Ltda.", type: "fintech", popular: false },
  { code: "084", name: "Uniprime Norte do Paraná", fullName: "Uniprime Norte do Paraná - Cooperativa de Crédito Ltda.", type: "cooperative", popular: false },
  { code: "180", name: "CM Capital Markets", fullName: "CM Capital Markets Corretora de Câmbio, Títulos e Valores Mobiliários Ltda.", type: "fintech", popular: false },
  { code: "066", name: "Banco Morgan Stanley", fullName: "Banco Morgan Stanley S.A.", type: "traditional", popular: false },
  { code: "015", name: "UBS Brasil", fullName: "UBS Brasil Corretora de Câmbio, Títulos e Valores Mobiliários S.A.", type: "traditional", popular: false },
  { code: "143", name: "Treviso", fullName: "Treviso Corretora de Câmbio S.A.", type: "fintech", popular: false },
  { code: "062", name: "Hipercard", fullName: "Hipercard Banco Múltiplo S.A.", type: "traditional", popular: false },
  { code: "074", name: "Banco J. Safra", fullName: "Banco J. Safra S.A.", type: "traditional", popular: false },
  { code: "099", name: "Uniprime Central", fullName: "Uniprime Central - Central Interestadual de Cooperativas de Crédito Ltda.", type: "cooperative", popular: false },
  { code: "098", name: "Credialiança", fullName: "Credialiança Cooperativa de Crédito Rural", type: "cooperative", popular: false },
  { code: "097", name: "Credisis", fullName: "Credisis - Central de Cooperativas de Crédito Ltda.", type: "cooperative", popular: false },
];

// Helper: Buscar banco por código
export function getBankByCode(code: string): BrazilianBank | undefined {
  return BRAZILIAN_BANKS.find(bank => bank.code === code);
}

// Helper: Buscar banco por nome (busca parcial, case-insensitive)
export function searchBankByName(query: string): BrazilianBank[] {
  const lowerQuery = query.toLowerCase();
  return BRAZILIAN_BANKS.filter(bank => 
    bank.name.toLowerCase().includes(lowerQuery) ||
    bank.fullName.toLowerCase().includes(lowerQuery)
  );
}

// Helper: Listar apenas bancos populares
export function getPopularBanks(): BrazilianBank[] {
  return BRAZILIAN_BANKS.filter(bank => bank.popular);
}

// Helper: Listar bancos por tipo
export function getBanksByType(type: BrazilianBank["type"]): BrazilianBank[] {
  return BRAZILIAN_BANKS.filter(bank => bank.type === type);
}

// Helper: Formatar para select options
export function getBankOptions(popularFirst: boolean = true): Array<{ value: string; label: string }> {
  const banks = popularFirst 
    ? [...BRAZILIAN_BANKS].sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      })
    : BRAZILIAN_BANKS;
  
  return banks.map(bank => ({
    value: bank.code,
    label: `${bank.name} (${bank.code})`,
  }));
}
