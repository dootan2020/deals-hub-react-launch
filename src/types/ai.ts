
/**
 * Available AI source engines for chatbot/recommendation features
 */
export type AISource = "openai" | "claude" | "local";

export interface AIAssistantResponse {
  answer: string;
  error?: string;
  details?: string;
}

export interface AIMessagePayload {
  userId: string | null;
  question: string;
  history: {
    sender: "user" | "bot";
    message: string;
  }[];
}
