
export interface AIMessagePayload {
  userId: string | null;
  question: string;
  history: Array<{
    sender: string;
    message: string;
  }>;
}

export interface AIAssistantResponse {
  answer: string;
  error?: string;
  code?: string | number;
  requestId?: string;
  errorType?: string;
  errorSource?: 'configuration' | 'validation' | 'edge_function';
}
