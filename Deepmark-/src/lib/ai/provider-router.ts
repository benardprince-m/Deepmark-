/**
 * DeepMark Provider Routing
 * Automatic provider selection based on task complexity
 */

import { logger, metrics } from '../observability';
import { providerHealthManager, type ProviderHealth } from './provider-health';

export type TaskComplexity = 'simple' | 'moderate' | 'complex';

export interface ProviderConfig {
  name: string;
  priority: number; // 1 = highest priority
  supportedComplexity: TaskComplexity[];
  maxTokens?: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
  capabilities: string[]; // e.g., ['chat', 'vision', 'code']
}

export interface RoutingContext {
  userId: string;
  workspaceId?: string;
  complexity: TaskComplexity;
  operation: string;
  requiredCapabilities?: string[];
  preferredCostTier?: 'free' | 'low' | 'medium' | 'high';
  estimatedTokens?: number;
}

// Default provider configurations
export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    name: 'openrouter',
    priority: 1,
    supportedComplexity: ['simple', 'moderate', 'complex'],
    costTier: 'low',
    capabilities: ['chat', 'vision'],
  },
  {
    name: 'openai',
    priority: 2,
    supportedComplexity: ['simple', 'moderate', 'complex'],
    maxTokens: 128000,
    costTier: 'medium',
    capabilities: ['chat', 'vision', 'code'],
  },
  {
    name: 'anthropic',
    priority: 3,
    supportedComplexity: ['moderate', 'complex'],
    maxTokens: 200000,
    costTier: 'medium',
    capabilities: ['chat', 'vision', 'code'],
  },
  {
    name: 'google',
    priority: 4,
    supportedComplexity: ['simple', 'moderate', 'complex'],
    costTier: 'low',
    capabilities: ['chat', 'vision'],
  },
  {
    name: 'ollama',
    priority: 5,
    supportedComplexity: ['simple', 'moderate'],
    costTier: 'free',
    capabilities: ['chat'],
  },
];

/**
 * Determine task complexity based on input analysis
 */
export function analyzeComplexity(
  input: string,
  options?: {
    hasCode?: boolean;
    hasVision?: boolean;
    contextLength?: number;
    operation?: string;
  }
): TaskComplexity {
  // Simple tasks
  const simpleIndicators = [
    input.length < 100,
    options?.operation === 'classify',
    options?.operation === 'tag',
    options?.operation === 'summarize' && input.length < 500,
  ];

  // Complex tasks
  const complexIndicators = [
    input.length > 5000,
    options?.hasCode === true,
    options?.hasVision === true,
    options?.operation === 'analyze',
    options?.operation === 'reason',
    options?.operation === 'create',
    (options?.contextLength || 0) > 10000,
  ];

  const simpleScore = simpleIndicators.filter(Boolean).length;
  const complexScore = complexIndicators.filter(Boolean).length;

  if (complexScore > simpleScore) {
    return 'complex';
  } else if (simpleScore > complexScore) {
    return 'simple';
  }
  return 'moderate';
}

/**
 * Get available providers for a given context
 */
function getAvailableProviders(
  providers: ProviderConfig[],
  context: RoutingContext
): ProviderConfig[] {
  return providers.filter((p) => {
    // Check complexity support
    if (!p.supportedComplexity.includes(context.complexity)) {
      return false;
    }

    // Check capabilities
    if (context.requiredCapabilities) {
      const hasCapabilities = context.requiredCapabilities.every((cap) =>
        p.capabilities.includes(cap)
      );
      if (!hasCapabilities) return false;
    }

    // Check token limit
    if (context.estimatedTokens && p.maxTokens) {
      if (context.estimatedTokens > p.maxTokens) {
        return false;
      }
    }

    // Check circuit breaker
    if (!providerHealthManager.canUse(p.name)) {
      return false;
    }

    // Check cost preference
    if (context.preferredCostTier) {
      const costOrder = ['free', 'low', 'medium', 'high'];
      const providerCostIndex = costOrder.indexOf(p.costTier);
      const preferredCostIndex = costOrder.indexOf(context.preferredCostTier);
      
      // Allow up to one tier higher
      if (providerCostIndex > preferredCostIndex + 1) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Select the best provider for a given context
 */
export function selectProvider(
  context: RoutingContext,
  providers: ProviderConfig[] = DEFAULT_PROVIDERS
): { provider: ProviderConfig; fallback?: ProviderConfig } | null {
  const available = getAvailableProviders(providers, context);

  if (available.length === 0) {
    logger.warn('No available providers for context', { context });
    return null;
  }

  // Sort by priority and cost tier
  available.sort((a, b) => {
    // First by priority
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    // Then by cost tier (prefer free > low > medium > high)
    const costOrder = ['free', 'low', 'medium', 'high'];
    return costOrder.indexOf(a.costTier) - costOrder.indexOf(b.costTier);
  });

  const selected = available[0];
  const fallback = available.length > 1 ? available[1] : undefined;

  logger.info('Provider selected', {
    selected: selected.name,
    fallback: fallback?.name,
    complexity: context.complexity,
    operation: context.operation,
  });

  metrics.increment('router.provider_selected', { 
    provider: selected.name,
    complexity: context.complexity,
  });

  return { provider: selected, fallback };
}

/**
 * Select provider with automatic complexity detection
 */
export function selectProviderAuto(
  input: string,
  context: Omit<RoutingContext, 'complexity'>,
  providers: ProviderConfig[] = DEFAULT_PROVIDERS
): { provider: ProviderConfig; fallback?: ProviderConfig; complexity: TaskComplexity } | null {
  // Analyze complexity
  const complexity = analyzeComplexity(input, {
    operation: context.operation,
    contextLength: context.estimatedTokens,
  });

  // Select provider with analyzed complexity
  const result = selectProvider({ ...context, complexity }, providers);

  if (!result) return null;

  return {
    ...result,
    complexity,
  };
}

/**
 * Get provider health status
 */
export function getProviderStatus(name: string): ProviderHealth | undefined {
  return providerHealthManager.getHealth(name);
}

/**
 * Get all providers with their health status
 */
export function getAllProviderStatus(): Array<ProviderConfig & { health: ProviderHealth | undefined }> {
  return DEFAULT_PROVIDERS.map((p) => ({
    ...p,
    health: providerHealthManager.getHealth(p.name),
  }));
}

/**
 * Register all default providers with health manager
 */
export function registerDefaultProviders(): void {
  for (const provider of DEFAULT_PROVIDERS) {
    providerHealthManager.registerProvider(provider.name);
  }
  logger.info('Registered default providers', { count: DEFAULT_PROVIDERS.length });
}

/**
 * Create routing middleware for API routes
 */
export function createRoutingMiddleware(
  providers: ProviderConfig[] = DEFAULT_PROVIDERS
) {
  return async function routeRequest(
    input: string,
    context: RoutingContext
  ): Promise<{ provider: string; complexity: TaskComplexity } | null> {
    const result = selectProviderAuto(input, context, providers);

    if (!result) {
      logger.error('Routing failed - no provider available', { context });
      metrics.increment('router.no_provider');
      return null;
    }

    return {
      provider: result.provider.name,
      complexity: result.complexity,
    };
  };
}

/**
 * Get routing recommendations for dashboard
 */
export function getRoutingRecommendations(): {
  currentProvider: string;
  recommendations: string[];
  healthSummary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
} {
  const statuses = getAllProviderStatus();
  
  const healthy = statuses.filter((p) => p.health?.status === 'healthy').length;
  const degraded = statuses.filter((p) => p.health?.status === 'degraded').length;
  const unhealthy = statuses.filter((p) => p.health?.status === 'unhealthy').length;

  const recommendations: string[] = [];

  if (unhealthy > 0) {
    const unhealthyProviders = statuses
      .filter((p) => p.health?.status === 'unhealthy')
      .map((p) => p.name);
    recommendations.push(`Consider disabling: ${unhealthyProviders.join(', ')}`);
  }

  if (degraded > statuses.length / 2) {
    recommendations.push('Multiple providers degraded - check API status pages');
  }

  // Suggest free providers for simple tasks
  const freeProviders = statuses.filter((p) => p.costTier === 'free');
  if (freeProviders.length > 0) {
    recommendations.push(`Free providers available: ${freeProviders.map((p) => p.name).join(', ')}`);
  }

  return {
    currentProvider: 'openrouter', // Default
    recommendations,
    healthSummary: { healthy, degraded, unhealthy },
  };
}
