/**
 * DeepMark Quota Management
 * Workspace limits, daily AI quotas, cost limits
 */

import { createClient } from '@supabase/supabase-js';
import { logger, metrics } from '../observability';

// Default quotas
export const DEFAULT_QUOTAS = {
  // Daily AI request limits
  dailyRequests: 100,
  
  // Monthly token limits (input + output)
  monthlyTokens: 1_000_000,
  
  // Cost limits (in USD)
  dailyCostLimit: 10,
  monthlyCostLimit: 50,
  
  // Workspace limits
  maxWorkspaces: 3,
  maxStartups: 5,
  maxCampaigns: 20,
  maxContentPerMonth: 100,
};

export interface QuotaConfig {
  dailyRequests?: number;
  monthlyTokens?: number;
  dailyCostLimit?: number;
  monthlyCostLimit?: number;
  maxWorkspaces?: number;
  maxStartups?: number;
  maxCampaigns?: number;
  maxContentPerMonth?: number;
}

export interface QuotaStatus {
  available: boolean;
  current: number;
  limit: number;
  remaining: number;
  resetAt?: number;
  upgradeRequired?: boolean;
}

export interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

// In-memory quota storage (in production, use Redis or database)
const quotaStorage: Map<string, { date: string; requests: number; tokens: number; cost: number }> = new Map();
const workspaceConfigs: Map<string, QuotaConfig> = new Map();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Get quota configuration for a workspace
 */
export async function getWorkspaceQuotaConfig(workspaceId: string): Promise<QuotaConfig> {
  // Check in-memory cache first
  const cached = workspaceConfigs.get(workspaceId);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('workspace_settings')
      .select('quota_config')
      .eq('workspace_id', workspaceId)
      .single();

    if (error || !data) {
      // Return default quotas
      return DEFAULT_QUOTAS;
    }

    const config = { ...DEFAULT_QUOTAS, ...data.quota_config };
    workspaceConfigs.set(workspaceId, config);
    return config;
  } catch (err) {
    logger.error('Failed to get workspace quota config', { workspaceId, error: err });
    return DEFAULT_QUOTAS;
  }
}

/**
 * Set quota configuration for a workspace
 */
export async function setWorkspaceQuotaConfig(
  workspaceId: string,
  config: Partial<QuotaConfig>
): Promise<void> {
  const current = await getWorkspaceQuotaConfig(workspaceId);
  const updated = { ...current, ...config };
  
  workspaceConfigs.set(workspaceId, updated);

  try {
    await supabase.from('workspace_settings').upsert({
      workspace_id: workspaceId,
      quota_config: updated,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Failed to save workspace quota config', { workspaceId, error: err });
  }
}

/**
 * Get daily usage for a workspace
 */
export function getDailyUsage(workspaceId: string): DailyUsage {
  const today = new Date().toISOString().split('T')[0];
  const key = `${workspaceId}:${today}`;
  
  return quotaStorage.get(key) || {
    date: today,
    requests: 0,
    tokens: 0,
    cost: 0,
  };
}

/**
 * Record quota usage
 */
export function recordUsage(
  workspaceId: string,
  tokens: number,
  cost: number
): void {
  const today = new Date().toISOString().split('T')[0];
  const key = `${workspaceId}:${today}`;
  
  const current = quotaStorage.get(key) || {
    date: today,
    requests: 0,
    tokens: 0,
    cost: 0,
  };

  current.requests++;
  current.tokens += tokens;
  current.cost += cost;
  
  quotaStorage.set(key, current);

  // Record metrics
  metrics.increment('quota.requests', { workspace: workspaceId });
  metrics.histogram('quota.tokens', tokens, { workspace: workspaceId });
  metrics.histogram('quota.cost', cost * 1000, { workspace: workspaceId }); // millicents
}

/**
 * Check if workspace can make AI request
 */
export async function checkQuota(
  workspaceId: string,
  estimatedTokens?: number,
  estimatedCost?: number
): Promise<{ allowed: boolean; reasons: string[] }> {
  const config = await getWorkspaceQuotaConfig(workspaceId);
  const usage = getDailyUsage(workspaceId);
  
  const reasons: string[] = [];

  // Check daily request limit
  if (config.dailyRequests && usage.requests >= config.dailyRequests) {
    reasons.push(`Daily request limit reached (${usage.requests}/${config.dailyRequests})`);
  }

  // Check estimated cost
  if (config.dailyCostLimit && estimatedCost) {
    const projectedCost = usage.cost + estimatedCost;
    if (projectedCost > config.dailyCostLimit) {
      reasons.push(`Daily cost limit would be exceeded ($${projectedCost.toFixed(4)}/$${config.dailyCostLimit})`);
    }
  }

  // Check estimated tokens
  if (config.monthlyTokens && estimatedTokens) {
    const projectedTokens = usage.tokens + estimatedTokens;
    if (projectedTokens > config.monthlyTokens) {
      reasons.push(`Monthly token limit would be exceeded (${projectedTokens}/${config.monthlyTokens})`);
    }
  }

  const allowed = reasons.length === 0;

  if (!allowed) {
    logger.warn('Quota check failed', {
      workspaceId,
      reasons,
      usage,
      config,
    });
  }

  return { allowed, reasons };
}

/**
 * Get quota status for dashboard display
 */
export async function getQuotaStatus(workspaceId: string): Promise<{
  requests: QuotaStatus;
  tokens: QuotaStatus;
  cost: QuotaStatus;
}> {
  const config = await getWorkspaceQuotaConfig(workspaceId);
  const usage = getDailyUsage(workspaceId);
  
  // Get monthly usage (in production, aggregate from database)
  const monthlyTokens = usage.tokens; // Simplified for now
  
  return {
    requests: {
      available: !config.dailyRequests || usage.requests < config.dailyRequests,
      current: usage.requests,
      limit: config.dailyRequests || 0,
      remaining: config.dailyRequests 
        ? Math.max(0, config.dailyRequests - usage.requests)
        : Infinity,
    },
    tokens: {
      available: !config.monthlyTokens || monthlyTokens < config.monthlyTokens,
      current: monthlyTokens,
      limit: config.monthlyTokens || 0,
      remaining: config.monthlyTokens
        ? Math.max(0, config.monthlyTokens - monthlyTokens)
        : Infinity,
    },
    cost: {
      available: !config.dailyCostLimit || usage.cost < config.dailyCostLimit,
      current: usage.cost,
      limit: config.dailyCostLimit || 0,
      remaining: config.dailyCostLimit
        ? Math.max(0, config.dailyCostLimit - usage.cost)
        : Infinity,
    },
  };
}

/**
 * Count workspace resources
 */
export async function countWorkspaceResources(workspaceId: string): Promise<{
  workspaces: number;
  startups: number;
  campaigns: number;
  contentThisMonth: number;
}> {
  try {
    const [startups, campaigns, content] = await Promise.all([
      supabase
        .from('startups')
        .select('id', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null),
      
      supabase
        .from('campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('startup_id', workspaceId) // Simplified
        .is('deleted_at', null),
      
      supabase
        .from('content')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()) // This month
        .is('deleted_at', null),
    ]);

    return {
      workspaces: 1, // Current workspace
      startups: startups.count || 0,
      campaigns: campaigns.count || 0,
      contentThisMonth: content.count || 0,
    };
  } catch (err) {
    logger.error('Failed to count workspace resources', { workspaceId, error: err });
    return {
      workspaces: 1,
      startups: 0,
      campaigns: 0,
      contentThisMonth: 0,
    };
  }
}

/**
 * Check workspace limits
 */
export async function checkWorkspaceLimits(
  workspaceId: string,
  resourceType: 'startup' | 'campaign' | 'content'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const config = await getWorkspaceQuotaConfig(workspaceId);
  const counts = await countWorkspaceResources(workspaceId);

  switch (resourceType) {
    case 'startup':
      return {
        allowed: !config.maxStartups || counts.startups < config.maxStartups,
        current: counts.startups,
        limit: config.maxStartups || Infinity,
      };
    case 'campaign':
      return {
        allowed: !config.maxCampaigns || counts.campaigns < config.maxCampaigns,
        current: counts.campaigns,
        limit: config.maxCampaigns || Infinity,
      };
    case 'content':
      return {
        allowed: !config.maxContentPerMonth || counts.contentThisMonth < config.maxContentPerMonth,
        current: counts.contentThisMonth,
        limit: config.maxContentPerMonth || Infinity,
      };
  }
}

/**
 * Get reset time for daily quotas (midnight UTC)
 */
export function getDailyResetTime(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Get reset time for monthly quotas
 */
export function getMonthlyResetTime(): number {
  const now = new Date();
  const nextMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return nextMonth.getTime();
}
