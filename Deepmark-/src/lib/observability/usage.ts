/**
 * DeepMark Token Usage and Cost Tracking
 * Track AI provider usage, costs, and quotas
 */

import { metrics, logger } from './index';

// Token pricing per 1M tokens (in USD)
export const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  // OpenRouter defaults (approximate)
  'openrouter': { input: 0.5, output: 1.5 }, // per 1M tokens
  'openai': { input: 2.5, output: 10 },
  'anthropic': { input: 3, output: 15 },
  'google': { input: 1.25, output: 5 },
  'ollama': { input: 0, output: 0 }, // Local, free
  'default': { input: 1, output: 3 },
};

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  provider: string;
}

export interface CostRecord {
  userId: string;
  workspaceId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  requestId: string;
  timestamp: number;
}

export interface UsageStats {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  byProvider: Record<string, { requests: number; tokens: number; cost: number }>;
  byModel: Record<string, { requests: number; tokens: number; cost: number }>;
}

/**
 * Calculate cost for token usage
 */
export function calculateCost(
  provider: string,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const pricing = TOKEN_PRICING[provider] || TOKEN_PRICING['default'];
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  
  return {
    inputCost: Math.round(inputCost * 1_000_000) / 1_000_000, // 6 decimal precision
    outputCost: Math.round(outputCost * 1_000_000) / 1_000_000,
    totalCost: Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000,
  };
}

/**
 * In-memory usage storage (in production, use Redis or database)
 */
const usageStorage: CostRecord[] = [];
const userDailyUsage: Map<string, { date: string; cost: number; tokens: number }> = new Map();
const workspaceDailyUsage: Map<string, { date: string; cost: number; tokens: number }> = new Map();

/**
 * Record token usage and cost
 */
export function recordTokenUsage(
  usage: TokenUsage,
  context: {
    userId: string;
    workspaceId?: string;
    requestId: string;
  }
): CostRecord {
  const cost = calculateCost(usage.provider, usage.promptTokens, usage.completionTokens);
  
  const record: CostRecord = {
    userId: context.userId,
    workspaceId: context.workspaceId,
    provider: usage.provider,
    model: usage.model,
    inputTokens: usage.promptTokens,
    outputTokens: usage.completionTokens,
    inputCost: cost.inputCost,
    outputCost: cost.outputCost,
    totalCost: cost.totalCost,
    requestId: context.requestId,
    timestamp: Date.now(),
  };

  // Store in memory
  usageStorage.push(record);
  
  // Keep only last 10,000 records
  if (usageStorage.length > 10000) {
    usageStorage.shift();
  }

  // Update daily usage
  const today = new Date().toISOString().split('T')[0];
  
  if (context.userId) {
    const userKey = `${context.userId}:${today}`;
    const userStats = userDailyUsage.get(userKey) || { date: today, cost: 0, tokens: 0 };
    userStats.cost += record.totalCost;
    userStats.tokens += usage.totalTokens;
    userDailyUsage.set(userKey, userStats);
  }
  
  if (context.workspaceId) {
    const wsKey = `${context.workspaceId}:${today}`;
    const wsStats = workspaceDailyUsage.get(wsKey) || { date: today, cost: 0, tokens: 0 };
    wsStats.cost += record.totalCost;
    wsStats.tokens += usage.totalTokens;
    workspaceDailyUsage.set(wsKey, wsStats);
  }

  // Record metrics
  metrics.increment('ai.usage.requests', { provider: usage.provider, model: usage.model });
  metrics.histogram('ai.usage.input_tokens', usage.promptTokens, { provider: usage.provider, model: usage.model });
  metrics.histogram('ai.usage.output_tokens', usage.completionTokens, { provider: usage.provider, model: usage.model });
  metrics.histogram('ai.usage.cost', record.totalCost * 1000, { provider: usage.provider, model: usage.model }); // Convert to millicents

  logger.info('Token usage recorded', {
    provider: usage.provider,
    model: usage.model,
    inputTokens: usage.promptTokens,
    outputTokens: usage.completionTokens,
    cost: record.totalCost,
    userId: context.userId,
  });

  return record;
}

/**
 * Get usage stats for a user
 */
export function getUserUsageStats(userId: string, days: number = 7): UsageStats {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  const userRecords = usageStorage.filter(
    (r) => r.userId === userId && r.timestamp > cutoff
  );

  const stats: UsageStats = {
    totalRequests: userRecords.length,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0,
    byProvider: {},
    byModel: {},
  };

  for (const record of userRecords) {
    stats.totalInputTokens += record.inputTokens;
    stats.totalOutputTokens += record.outputTokens;
    stats.totalCost += record.totalCost;

    // By provider
    if (!stats.byProvider[record.provider]) {
      stats.byProvider[record.provider] = { requests: 0, tokens: 0, cost: 0 };
    }
    stats.byProvider[record.provider].requests++;
    stats.byProvider[record.provider].tokens += record.inputTokens + record.outputTokens;
    stats.byProvider[record.provider].cost += record.totalCost;

    // By model
    if (!stats.byModel[record.model]) {
      stats.byModel[record.model] = { requests: 0, tokens: 0, cost: 0 };
    }
    stats.byModel[record.model].requests++;
    stats.byModel[record.model].tokens += record.inputTokens + record.outputTokens;
    stats.byModel[record.model].cost += record.totalCost;
  }

  return stats;
}

/**
 * Get daily usage for a user
 */
export function getUserDailyUsage(userId: string, date?: string): { cost: number; tokens: number } {
  const today = date || new Date().toISOString().split('T')[0];
  const key = `${userId}:${today}`;
  const stats = userDailyUsage.get(key);
  
  return stats || { cost: 0, tokens: 0 };
}

/**
 * Get workspace daily usage
 */
export function getWorkspaceDailyUsage(workspaceId: string, date?: string): { cost: number; tokens: number } {
  const today = date || new Date().toISOString().split('T')[0];
  const key = `${workspaceId}:${today}`;
  const stats = workspaceDailyUsage.get(key);
  
  return stats || { cost: 0, tokens: 0 };
}

/**
 * Export all usage data (for audit logs)
 */
export function exportUsageData(days: number = 30): CostRecord[] {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return usageStorage.filter((r) => r.timestamp > cutoff);
}

/**
 * Clear old usage data (for memory management)
 */
export function pruneUsageData(daysToKeep: number = 90): number {
  const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  const originalLength = usageStorage.length;
  
  // Remove old records
  while (usageStorage.length > 0 && usageStorage[0].timestamp < cutoff) {
    usageStorage.shift();
  }
  
  // Also prune daily usage maps
  const oldKeys: string[] = [];
  const cutoffDate = new Date(cutoff).toISOString().split('T')[0];
  
  for (const [key] of userDailyUsage) {
    if (key.endsWith(cutoffDate)) {
      const stats = userDailyUsage.get(key);
      if (stats && new Date(stats.date) < new Date(cutoffDate)) {
        oldKeys.push(key);
      }
    }
  }
  
  oldKeys.forEach((k) => userDailyUsage.delete(k));
  
  return originalLength - usageStorage.length;
}
