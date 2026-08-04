// Base Adapter with shared retry and timeout logic

import { AIProvider, ProviderAdapter } from "../interface";
import { AIRequest, AIResponse, AIProviderConfig, AIProviderValidation } from "../types";

export abstract class BaseAdapter implements AIProvider {
  protected apiKey: string = "";
  protected baseUrl: string = "";
  protected model: string = "";
  
  abstract readonly name: string;
  abstract readonly displayName: string;
  
  protected readonly maxRetries = 3;
  protected readonly timeoutMs = 30000;
  
  configure(config: AIProviderConfig): void {
    this.apiKey = config.apiKey || "";
    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl();
    this.model = config.model || this.getDefaultModel();
  }
  
  abstract getDefaultBaseUrl(): string;
  abstract getDefaultModel(): string;
  
  abstract createRequestAdapter(): ProviderAdapter;
  
  async generate(request: AIRequest): Promise<AIResponse> {
    const adapter = this.createRequestAdapter();
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.executeWithTimeout(
          this.callProvider(adapter, request)
        );
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error("AI Provider attempt " + (attempt + 1) + " failed:", lastError.message);
        
        if (attempt < this.maxRetries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw lastError || new Error("AI Provider failed after all retries");
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async *stream(_request: AIRequest): AsyncIterable<string> {
    // Streaming not yet implemented - use generate() instead
    throw new Error("Streaming not implemented");
  }
  
  abstract validateConfig(): Promise<AIProviderValidation>;
  
  protected async executeWithTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), this.timeoutMs)
      ),
    ]);
  }
  
  protected async callProvider(
    adapter: ProviderAdapter,
    request: AIRequest
  ): Promise<AIResponse> {
    const url = this.baseUrl + "/chat/completions";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + this.apiKey,
      },
      body: JSON.stringify(adapter.createRequest(request)),
    });
    
    if (!response.ok) throw new Error("API failed: " + response.status);
    
    const data = await response.json();
    return adapter.parseResponse(data);
  }
  
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
