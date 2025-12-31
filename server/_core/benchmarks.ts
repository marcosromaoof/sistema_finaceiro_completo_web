import { callDataApi } from "./dataApi";

export interface BenchmarkData {
  date: Date;
  value: number;
}

export interface BenchmarkHistory {
  benchmark: string;
  data: BenchmarkData[];
  currentValue: number;
  change: number;
  changePercent: number;
}

/**
 * Símbolos dos benchmarks no Yahoo Finance
 */
const BENCHMARK_SYMBOLS = {
  ibovespa: "^BVSP", // Índice Bovespa
  sp500: "^GSPC", // S&P 500
  cdi: "^IRX", // Aproximação: US Treasury 13 Week (usaremos como proxy para CDI)
};

/**
 * Busca dados históricos de um benchmark
 */
export async function getBenchmarkHistory(
  benchmark: "ibovespa" | "sp500" | "cdi",
  range: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max" = "1y"
): Promise<BenchmarkHistory> {
  const symbol = BENCHMARK_SYMBOLS[benchmark];

  try {
    const response: any = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol,
        region: benchmark === "ibovespa" ? "BR" : "US",
        interval: "1d",
        range,
        includeAdjustedClose: true,
      },
    });

    if (!response || !response.chart || !response.chart.result || response.chart.result.length === 0) {
      throw new Error(`No data found for benchmark ${benchmark}`);
    }

    const result = response.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const closes = quotes.close || [];

    // Converter para formato BenchmarkData
    const data: BenchmarkData[] = timestamps
      .map((timestamp: number, index: number) => {
        const closeValue = closes[index];
        if (closeValue === null || closeValue === undefined) return null;
        
        return {
          date: new Date(timestamp * 1000),
          value: closeValue,
        };
      })
      .filter((item: BenchmarkData | null): item is BenchmarkData => item !== null);

    if (data.length === 0) {
      throw new Error(`No valid data points for benchmark ${benchmark}`);
    }

    // Calcular mudança
    const currentValue = data[data.length - 1].value;
    const firstValue = data[0].value;
    const change = currentValue - firstValue;
    const changePercent = (change / firstValue) * 100;

    return {
      benchmark,
      data,
      currentValue,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching benchmark ${benchmark}:`, error);
    throw error;
  }
}

/**
 * Busca dados de múltiplos benchmarks em paralelo
 */
export async function getMultipleBenchmarks(
  benchmarks: Array<"ibovespa" | "sp500" | "cdi">,
  range: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max" = "1y"
): Promise<Record<string, BenchmarkHistory>> {
  const promises = benchmarks.map(async (benchmark) => {
    try {
      const history = await getBenchmarkHistory(benchmark, range);
      return [benchmark, history] as const;
    } catch (error) {
      console.error(`Failed to fetch ${benchmark}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  
  const benchmarkData: Record<string, BenchmarkHistory> = {};
  for (const result of results) {
    if (result) {
      const [benchmark, history] = result;
      benchmarkData[benchmark] = history;
    }
  }

  return benchmarkData;
}

/**
 * Calcula a rentabilidade de um portfólio em um período
 */
export function calculatePortfolioReturn(
  initialValue: number,
  finalValue: number
): { return: number; returnPercent: number } {
  const returnValue = finalValue - initialValue;
  const returnPercent = (returnValue / initialValue) * 100;
  
  return {
    return: returnValue,
    returnPercent,
  };
}

/**
 * Calcula o Alpha (retorno acima do benchmark)
 */
export function calculateAlpha(
  portfolioReturn: number,
  benchmarkReturn: number
): number {
  return portfolioReturn - benchmarkReturn;
}

/**
 * Calcula o Beta (volatilidade relativa ao benchmark)
 */
export function calculateBeta(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) {
    return 0;
  }

  // Calcular covariância entre portfólio e benchmark
  const portfolioMean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
  const benchmarkMean = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;

  let covariance = 0;
  let benchmarkVariance = 0;

  for (let i = 0; i < portfolioReturns.length; i++) {
    const portfolioDiff = portfolioReturns[i] - portfolioMean;
    const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
    
    covariance += portfolioDiff * benchmarkDiff;
    benchmarkVariance += benchmarkDiff * benchmarkDiff;
  }

  covariance /= portfolioReturns.length - 1;
  benchmarkVariance /= benchmarkReturns.length - 1;

  if (benchmarkVariance === 0) return 0;

  return covariance / benchmarkVariance;
}

/**
 * Calcula o Sharpe Ratio
 */
export function calculateSharpeRatio(
  portfolioReturns: number[],
  riskFreeRate: number = 0.1 // Taxa Selic aproximada (10% ao ano)
): number {
  if (portfolioReturns.length < 2) return 0;

  const meanReturn = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
  
  // Calcular desvio padrão
  const variance = portfolioReturns.reduce((sum, ret) => {
    const diff = ret - meanReturn;
    return sum + diff * diff;
  }, 0) / (portfolioReturns.length - 1);
  
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return (meanReturn - riskFreeRate) / stdDev;
}

/**
 * Calcula retornos diários a partir de valores históricos
 */
export function calculateDailyReturns(values: number[]): number[] {
  const returns: number[] = [];
  
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] !== 0) {
      const dailyReturn = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
      returns.push(dailyReturn);
    }
  }
  
  return returns;
}
