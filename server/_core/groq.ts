import Groq from "groq-sdk";

let groqClient: Groq | null = null;

/**
 * Get or create Groq client instance
 * API key should be configured in the admin panel
 */
export function getGroqClient(apiKey?: string): Groq | null {
  // If API key is provided, create new client
  if (apiKey) {
    try {
      return new Groq({
        apiKey: apiKey,
      });
    } catch (error) {
      console.error("[Groq] Failed to create client:", error);
      return null;
    }
  }

  // Return existing client or null
  return groqClient;
}

/**
 * Initialize Groq client with API key
 * Should be called when admin configures Groq API key
 */
export function initializeGroqClient(apiKey: string): boolean {
  try {
    groqClient = new Groq({
      apiKey: apiKey,
    });
    console.log("[Groq] Client initialized successfully");
    return true;
  } catch (error) {
    console.error("[Groq] Failed to initialize client:", error);
    groqClient = null;
    return false;
  }
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqChatOptions {
  model?: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "mixtral-8x7b-32768";
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Send chat completion request to Groq
 * Uses Llama 3.3 70B by default for best quality
 */
export async function sendGroqChat(
  messages: GroqMessage[],
  options: GroqChatOptions = {},
  apiKey?: string
): Promise<string> {
  const client = apiKey ? getGroqClient(apiKey) : groqClient;

  if (!client) {
    throw new Error("Groq client not initialized. Please configure API key in admin panel.");
  }

  const {
    model = "llama-3.3-70b-versatile",
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  try {
    const completion = await client.chat.completions.create({
      messages: messages,
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content || "";
    return response;
  } catch (error: any) {
    console.error("[Groq] Chat completion error:", error);
    
    // Handle specific errors
    if (error?.status === 401) {
      throw new Error("Invalid Groq API key. Please check your configuration.");
    }
    if (error?.status === 429) {
      throw new Error("Groq rate limit exceeded. Please try again later.");
    }
    
    throw new Error(`Groq API error: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Send streaming chat completion request to Groq
 * Returns async generator for streaming responses
 */
export async function* sendGroqChatStream(
  messages: GroqMessage[],
  options: GroqChatOptions = {},
  apiKey?: string
): AsyncGenerator<string, void, unknown> {
  const client = apiKey ? getGroqClient(apiKey) : groqClient;

  if (!client) {
    throw new Error("Groq client not initialized. Please configure API key in admin panel.");
  }

  const {
    model = "llama-3.3-70b-versatile",
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  try {
    const stream = await client.chat.completions.create({
      messages: messages,
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    console.error("[Groq] Streaming error:", error);
    
    if (error?.status === 401) {
      throw new Error("Invalid Groq API key. Please check your configuration.");
    }
    if (error?.status === 429) {
      throw new Error("Groq rate limit exceeded. Please try again later.");
    }
    
    throw new Error(`Groq API error: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Test Groq API connection
 */
export async function testGroqConnection(apiKey: string): Promise<boolean> {
  try {
    const client = new Groq({ apiKey });
    
    const completion = await client.chat.completions.create({
      messages: [{ role: "user", content: "Hello" }],
      model: "llama-3.1-8b-instant", // Use faster model for testing
      max_tokens: 10,
    });

    return completion.choices.length > 0;
  } catch (error) {
    console.error("[Groq] Connection test failed:", error);
    return false;
  }
}

/**
 * Get available Groq models
 */
export function getGroqModels() {
  return [
    {
      id: "llama-3.3-70b-versatile",
      name: "Llama 3.3 70B",
      description: "Most advanced model - Best for complex analysis and reasoning",
      contextWindow: 131072,
      recommended: true,
    },
    {
      id: "llama-3.1-8b-instant",
      name: "Llama 3.1 8B",
      description: "Fast responses for simple queries",
      contextWindow: 131072,
      recommended: false,
    },
    {
      id: "mixtral-8x7b-32768",
      name: "Mixtral 8x7B",
      description: "Good balance of speed and quality",
      contextWindow: 32768,
      recommended: false,
    },
  ];
}
