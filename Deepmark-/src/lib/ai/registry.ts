// AI Provider Registry - Resolves active provider based on configuration hierarchy

import { AIProvider, AIProviderValidation } from "./interface";
import { AIRequest, AIUsage } from "./types";
import { getOpenRouterProvider } from "./adapters/openrouter";

// Provider registry
const providers: Record<string, AIProvider> = {
  openrouter: getOpenRouterProvider(),
};

// Configuration hierarchy (per LAW 4):
// 1. User Settings (database) - NOT YET IMPLEMENTED
// 2. Environment Variables
// 3. DeepMark Defaults (OpenRouter + free-tier)

export interface ProviderInfo {
  name: string;
  displayName: string;
  configured: boolean;
  model?: string;
}

export interface ProviderStatus {
  active: string;
  available: ProviderInfo[];
}

// Get all available providers
export function getAvailableProviders(): ProviderInfo[] {
  return Object.values(providers).map(p => ({
    name: p.name,
    displayName: p.displayName,
    configured: !!process.env.OPENROUTER_API_KEY,
    model: process.env.DEFAULT_MODEL,
  }));
}

// Get active provider based on configuration hierarchy
export async function getActiveProvider(): Promise<AIProvider> {
  // Check environment variables first
  const defaultProvider = process.env.DEFAULT_PROVIDER || "openrouter";
  
  const provider = providers[defaultProvider];
  if (!provider) {
    console.warn("Provider " + defaultProvider + " not found, falling back to openrouter");
    return providers.openrouter;
  }
  
  return provider;
}

// Get provider by name
export function getProvider(name: string): AIProvider | null {
  return providers[name] || null;
}

// Get active provider status
export async function getProviderStatus(): Promise<ProviderStatus> {
  const available = getAvailableProviders();
  const activeProvider = await getActiveProvider();
  
  return {
    active: activeProvider.name,
    available,
  };
}

// Validate provider configuration
export async function validateProvider(name: string): Promise<AIProviderValidation> {
  const provider = getProvider(name);
  if (!provider) {
    return {
      valid: false,
      error: "Provider " + name + " not found",
    };
  }
  
  return provider.validateConfig();
}

// Capability Registry - Translates feature requests to provider calls

export type AICapability =
  | "generateMarketingPlan"
  | "generateLinkedInPost"
  | "generateXThread"
  | "generateCarousel"
  | "generateVideoScript"
  | "generateNewsletter"
  | "analyzeWebsite"
  | "analyzeCompetitor"
  | "rewriteCopy"
  | "extractMemory";

export type ThinkingStage = 
  | "idle" 
  | "understanding" 
  | "retrieving_memory" 
  | "selecting_skills" 
  | "building_prompt" 
  | "selecting_provider" 
  | "calling_provider" 
  | "validating_response" 
  | "returning_result" 
  | "error";

export interface ThinkingCallback {
  (stage: ThinkingStage, details?: string): void;
}

export interface StartupProfile {
  name: string;
  industry?: string;
  description?: string;
  website?: string;
}

export interface AudienceProfile {
  description?: string;
  painPoints?: string[];
  demographicContext?: string;
}

export interface GoalProfile {
  primary?: string;
  secondary?: string[];
}

export interface MemoryCard {
  id: string;
  category: string;
  title: string;
  content: string;
  confidence: number;
  source: string;
}

export interface ActiveSkill {
  id: string;
  name: string;
  instructions: string;
}

export interface CapabilityContext {
  startup: StartupProfile;
  audience: AudienceProfile;
  goals: GoalProfile;
  memory: MemoryCard[];
  skills: ActiveSkill[];
  userInput: string;
}

export interface CapabilityRequest {
  capability: AICapability;
  context: CapabilityContext;
  options?: {
    stream?: boolean;
    modelOverride?: string;
    thinkingCallback?: ThinkingCallback;
  };
}

export interface CapabilityResponse {
  output: string;
  promptUsed: string;
  provider: string;
  model: string;
  tokensUsed?: AIUsage;
  memoryUpdated?: MemoryCard[];
  thinkingStages?: { stage: ThinkingStage; timestamp: number }[];
}

// Request a capability from the AI system
export async function requestCapability(
  request: CapabilityRequest
): Promise<CapabilityResponse> {
  const thinkingStages: { stage: ThinkingStage; timestamp: number }[] = [];
  const think = request.options?.thinkingCallback || ((stage: ThinkingStage, _details?: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    thinkingStages.push({ stage, timestamp: Date.now() });
  });
  
  // Stage: Understanding
  think("understanding", "Parsing user request");
  
  // Stage: Retrieving memory (already passed in context)
  if (request.context.memory.length > 0) {
    think("retrieving_memory", `Found ${request.context.memory.length} relevant memories`);
  } else {
    think("retrieving_memory", "No previous memories found");
  }
  
  // Stage: Selecting skills
  think("selecting_skills", request.context.skills.length > 0 
    ? `Selected ${request.context.skills.length} skills` 
    : "Using default marketing strategy");
  
  // Stage: Building prompt
  think("building_prompt", "Constructing context-rich prompt");
  
  // Get provider
  think("selecting_provider", "Determining best AI provider");
  const provider = await getActiveProvider();
  
  // Build prompts
  const systemPrompt = buildSystemPrompt(request);
  const userPrompt = buildUserPrompt(request);
  
  think("calling_provider", `Calling ${provider.displayName}`);
  
  // Make the API call
  const aiRequest: AIRequest = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  };
  
  try {
    const response = await provider.generate(aiRequest);
    
    think("validating_response", "Verifying response quality");
    think("returning_result", "Formatting output");
    
    return {
      output: response.content,
      promptUsed: systemPrompt + "\n\n" + userPrompt,
      provider: response.provider,
      model: response.model,
      tokensUsed: response.usage,
      thinkingStages,
    };
  } catch (error) {
    think("error", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
}

// Build system prompt from context
function buildSystemPrompt(request: CapabilityRequest): string {
  const { context, capability } = request;
  
  let prompt = "You are a senior marketing strategist helping founders execute their marketing effectively.\n\n";
  
  // Startup profile
  if (context.startup.name) {
    prompt += "STARTUP PROFILE:\n";
    prompt += "- Name: " + context.startup.name + "\n";
    if (context.startup.industry) prompt += "- Industry: " + context.startup.industry + "\n";
    if (context.startup.description) prompt += "- Description: " + context.startup.description + "\n";
    if (context.startup.website) prompt += "- Website: " + context.startup.website + "\n";
    prompt += "\n";
  }
  
  // Audience
  if (context.audience.description) {
    prompt += "TARGET AUDIENCE:\n" + context.audience.description + "\n";
    if (context.audience.painPoints?.length) {
      prompt += "Pain Points: " + context.audience.painPoints.join(", ") + "\n";
    }
    prompt += "\n";
  }
  
  // Goals
  if (context.goals.primary) {
    prompt += "GOALS:\nPrimary: " + context.goals.primary + "\n";
    if (context.goals.secondary?.length) {
      prompt += "Secondary: " + context.goals.secondary.join(", ") + "\n";
    }
    prompt += "\n";
  }
  
  // Memory (relevant patterns)
  if (context.memory.length > 0) {
    prompt += "PREVIOUS SUCCESSFUL PATTERNS:\n";
    for (const card of context.memory.slice(0, 3)) {
      prompt += "- [" + card.category + "] " + card.title + ": " + card.content + "\n";
    }
    prompt += "\n";
  }
  
  // Active skills
  if (context.skills.length > 0) {
    prompt += "ACTIVE SKILLS:\n";
    for (const skill of context.skills) {
      prompt += "- " + skill.name + ": " + skill.instructions + "\n";
    }
    prompt += "\n";
  }
  
  // Task type
  prompt += "YOUR TASK: " + getCapabilityDescription(capability) + "\n\n";
  prompt += "CONSTRAINTS:\n";
  prompt += "- No emojis unless explicitly appropriate for the platform\n";
  prompt += "- Match the startup's tone and voice\n";
  prompt += "- Reference the positioning and unique value proposition\n";
  prompt += "- Include a clear call-to-action when appropriate\n";
  
  return prompt;
}

// Build user prompt
function buildUserPrompt(request: CapabilityRequest): string {
  return request.context.userInput;
}

// Get capability description
function getCapabilityDescription(capability: AICapability): string {
  const descriptions: Record<AICapability, string> = {
    generateMarketingPlan: "Create a comprehensive marketing plan with clear milestones and action items",
    generateLinkedInPost: "Write an engaging LinkedIn post optimized for the platform's algorithm and audience",
    generateXThread: "Create a thread of tweets that tell a compelling story and drive engagement",
    generateCarousel: "Design a carousel post structure with compelling slides",
    generateVideoScript: "Write a short video script for social media",
    generateNewsletter: "Write an email newsletter that converts subscribers",
    analyzeWebsite: "Analyze the website and provide actionable improvement recommendations",
    analyzeCompetitor: "Analyze competitor positioning and suggest differentiation strategies",
    rewriteCopy: "Rewrite the provided copy to improve engagement and conversion",
    extractMemory: "Extract key information that should be remembered for future context",
  };
  
  return descriptions[capability] || capability;
}
