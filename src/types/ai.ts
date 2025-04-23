
/**
 * Available AI source engines for chatbot/recommendation features
 * Aligned with RecommendationStrategy for compatibility
 */
export type AISource = "openai" | "claude" | "local" | "similar" | "popular" | "trending";

/**
 * Response structure from the AI Assistant edge function
 */
export interface AIAssistantResponse {
  answer: string;
  error?: string;
  details?: string;
  code?: number;
  errorType?: string;
  errorSource?: string;
  stackTrace?: string;
  requestId?: string;
  duration?: number;
}

/**
 * Message payload sent to AI Assistant edge function
 */
export interface AIMessagePayload {
  userId: string | null;
  question: string;
  history: {
    sender: "user" | "bot";
    message: string;
  }[];
}
