// AI Provider Types

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: AIUsage;
  finishReason?: 'stop' | 'length' | 'error';
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface AIProviderValidation {
  valid: boolean;
  error?: string;
}
