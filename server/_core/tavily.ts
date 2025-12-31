import { TavilyClient } from "tavily";

let tavilyClient: TavilyClient | null = null;

/**
 * Get or create Tavily client instance
 * API key should be configured in the admin panel
 */
export function getTavilyClient(apiKey?: string): TavilyClient | null {
  // If API key is provided, create new client
  if (apiKey) {
    try {
      return new TavilyClient({ apiKey });
    } catch (error) {
      console.error("[Tavily] Failed to create client:", error);
      return null;
    }
  }

  // Return existing client or null
  return tavilyClient;
}

/**
 * Initialize Tavily client with API key
 * Should be called when admin configures Tavily API key
 */
export function initializeTavilyClient(apiKey: string): boolean {
  try {
    tavilyClient = new TavilyClient({ apiKey });
    console.log("[Tavily] Client initialized successfully");
    return true;
  } catch (error) {
    console.error("[Tavily] Failed to initialize client:", error);
    tavilyClient = null;
    return false;
  }
}

export interface TavilySearchOptions {
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  includeAnswer?: boolean;
  includeImages?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
}

export interface TavilySearchResult {
  answer?: string;
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
    publishedDate?: string;
  }>;
  images?: string[];
  query: string;
  followUpQuestions?: string[];
}

/**
 * Search the web using Tavily
 * Optimized for AI and LLM applications
 */
export async function searchWeb(
  query: string,
  options: TavilySearchOptions = {},
  apiKey?: string
): Promise<TavilySearchResult> {
  const client = apiKey ? getTavilyClient(apiKey) : tavilyClient;

  if (!client) {
    throw new Error("Tavily client not initialized. Please configure API key in admin panel.");
  }

  const {
    maxResults = 5,
    searchDepth = "basic",
    includeAnswer = true,
    includeImages = false,
    includeDomains,
    excludeDomains,
  } = options;

  try {
    const response = await client.search({
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_answer: includeAnswer,
      include_images: includeImages,
      include_domains: includeDomains,
      exclude_domains: excludeDomains,
    });

    return {
      answer: response.answer,
      results: response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: parseFloat(r.score),
      })),
      images: response.images || [],
      query: response.query,
      followUpQuestions: response.follow_up_questions,
    };
  } catch (error: any) {
    console.error("[Tavily] Search error:", error);
    
    // Handle specific errors
    if (error?.status === 401 || error?.message?.includes("401")) {
      throw new Error("Invalid Tavily API key. Please check your configuration.");
    }
    if (error?.status === 429 || error?.message?.includes("429")) {
      throw new Error("Tavily rate limit exceeded. Please try again later.");
    }
    
    throw new Error(`Tavily API error: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Search for financial news
 * Optimized for financial market information
 */
export async function searchFinancialNews(
  query: string,
  apiKey?: string
): Promise<TavilySearchResult> {
  // Include reputable financial news domains
  const financialDomains = [
    "bloomberg.com",
    "reuters.com",
    "wsj.com",
    "ft.com",
    "cnbc.com",
    "marketwatch.com",
    "investing.com",
    "forbes.com",
    "businessinsider.com",
    "infomoney.com.br",
    "valor.globo.com",
    "exame.com",
  ];

  return await searchWeb(
    query,
    {
      maxResults: 5,
      searchDepth: "advanced",
      includeAnswer: true,
      includeDomains: financialDomains,
    },
    apiKey
  );
}

/**
 * Search for stock quotes and market data
 */
export async function searchStockQuote(
  symbol: string,
  apiKey?: string
): Promise<TavilySearchResult> {
  const query = `${symbol} stock price quote today`;
  
  return await searchWeb(
    query,
    {
      maxResults: 3,
      searchDepth: "basic",
      includeAnswer: true,
    },
    apiKey
  );
}

/**
 * Search for economic indicators
 */
export async function searchEconomicData(
  indicator: string,
  apiKey?: string
): Promise<TavilySearchResult> {
  const query = `${indicator} latest data Brazil`;
  
  return await searchWeb(
    query,
    {
      maxResults: 5,
      searchDepth: "advanced",
      includeAnswer: true,
    },
    apiKey
  );
}

/**
 * Test Tavily API connection
 */
export async function testTavilyConnection(apiKey: string): Promise<boolean> {
  try {
    const client = new TavilyClient({ apiKey });
    
    const response = await client.search({
      query: "test",
      max_results: 1,
      search_depth: "basic",
    });

    return response.results.length >= 0; // Even 0 results means connection works
  } catch (error) {
    console.error("[Tavily] Connection test failed:", error);
    return false;
  }
}

/**
 * Determine if a query needs web search
 * Returns true if query is about current events, prices, news, or market data
 */
export function needsWebSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  const searchKeywords = [
    "cotação",
    "preço",
    "ação",
    "bolsa",
    "mercado",
    "notícia",
    "hoje",
    "atual",
    "agora",
    "recente",
    "dólar",
    "euro",
    "bitcoin",
    "criptomoeda",
    "inflação",
    "selic",
    "juros",
    "economia",
    "ibovespa",
    "nasdaq",
    "s&p",
    "dow jones",
  ];

  return searchKeywords.some(keyword => lowerQuery.includes(keyword));
}
