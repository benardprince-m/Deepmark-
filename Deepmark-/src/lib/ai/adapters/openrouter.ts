// OpenRouter Adapter - Default AI Provider

import { BaseAdapter } from "./base";
import { ProviderAdapter } from "../interface";
import { AIRequest, AIResponse, AIProviderValidation } from "../types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";

class OpenRouterAdapter implements ProviderAdapter {
  readonly providerName = "openrouter";
  
  createRequest(request: AIRequest): Record<string, unknown> {
    return {
      model: request.model || DEFAULT_MODEL,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    };
  }
  
  parseResponse(data: Record<string, unknown>): AIResponse {
    const choices = data.choices as Array<{ message?: { content?: string }; finish_reason?: string }>;
    const usage = data.usage as { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;
    
    return {
      content: choices?.[0]?.message?.content ?? "",
      model: (data.model as string) || DEFAULT_MODEL,
      provider: "openrouter",
      usage: usage ? {
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
        totalTokens: usage.total_tokens ?? 0,
      } : undefined,
      finishReason: (choices?.[0]?.finish_reason as "stop" | "length" | "error") || "stop",
    };
  }
  
  parseStreamChunk(data: Record<string, unknown>): string {
    const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined;
    const delta = choices?.[0]?.delta;
    return delta?.content || "";
  }
}

export class OpenRouterProvider extends BaseAdapter {
  readonly name = "openrouter";
  readonly displayName = "OpenRouter";
  
  getDefaultBaseUrl(): string {
    return OPENROUTER_BASE_URL;
  }
  
  getDefaultModel(): string {
    return process.env.DEFAULT_MODEL || DEFAULT_MODEL;
  }
  
  createRequestAdapter(): ProviderAdapter {
    return new OpenRouterAdapter();
  }
  
  async validateConfig(): Promise<AIProviderValidation> {
    if (!this.apiKey) {
      const envKey = process.env.OPENROUTER_API_KEY;
      if (!envKey) {
        return {
          valid: false,
          error: "OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable.",
        };
      }
      this.apiKey = envKey;
    }
    
    // Test the API key with a simple request
    try {
      const response = await fetch(this.baseUrl + "/auth/key", {
        headers: {
          "Authorization": "Bearer " + this.apiKey,
        },
      });
      
      if (!response.ok) {
        return {
          valid: false,
          error: "Invalid OpenRouter API key",
        };
      }
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: "Failed to validate API key: " + (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  }
}

// Singleton instance
let openRouterInstance: OpenRouterProvider | null = null;

export function getOpenRouterProvider(): OpenRouterProvider {
  if (!openRouterInstance) {
    openRouterInstance = new OpenRouterProvider();
    openRouterInstance.configure({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: OPENROUTER_BASE_URL,
      model: process.env.DEFAULT_MODEL || DEFAULT_MODEL,
    });
  }
  return openRouterInstance;
}
