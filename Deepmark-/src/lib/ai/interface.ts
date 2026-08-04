// AI Provider Interface

import { AIRequest, AIResponse, AIProviderConfig, AIProviderValidation } from './types';
export type { AIProviderValidation } from './types';

export interface AIProvider {
  readonly name: string;
  readonly displayName: string;
  
  configure(config: AIProviderConfig): void;
  
  generate(request: AIRequest): Promise<AIResponse>;
  
  stream(request: AIRequest): AsyncIterable<string>;
  
  validateConfig(): Promise<AIProviderValidation>;
}

export interface ProviderAdapter {
  readonly providerName: string;
  
  createRequest(request: AIRequest): Record<string, unknown>;
  
  parseResponse(data: Record<string, unknown>): AIResponse;
  
  parseStreamChunk(data: Record<string, unknown>): string;
}

export const DEFAULT_PROVIDER_CONFIG = {
  temperature: 0.7,
  maxTokens: 2000,
} as const;
