/**
 * DeepMark Audit Logging System
 * Provider usage logs, error logs, security events
 */

import { createClient } from '@supabase/supabase-js';
import { logger, metrics } from './index';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export type AuditEventType =
  | 'provider_request'
  | 'provider_error'
  | 'auth_login'
  | 'auth_logout'
  | 'auth_failure'
  | 'auth_signup'
  | 'rate_limit'
  | 'quota_exceeded'
  | 'workspace_created'
  | 'workspace_deleted'
  | 'content_created'
  | 'content_deleted'
  | 'memory_created'
  | 'memory_accessed'
  | 'memory_deleted'
  | 'settings_changed'
  | 'admin_action';

export interface AuditEvent {
  id?: string;
  event_type: AuditEventType;
  user_id: string;
  workspace_id?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  created_at?: string;
}

export interface ProviderUsageLog {
  id?: string;
  user_id: string;
  workspace_id?: string;
  provider: string;
  model: string;
  operation: string;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  latency_ms: number;
  status: 'success' | 'error' | 'partial';
  error_message?: string;
  request_id?: string;
  created_at?: string;
}

export interface ErrorLog {
  id?: string;
  user_id?: string;
  workspace_id?: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  provider?: string;
  operation?: string;
  request_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// In-memory buffer for batch writes
const auditBuffer: AuditEvent[] = [];
const usageBuffer: ProviderUsageLog[] = [];
const errorBuffer: ErrorLog[] = [];

const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 5000;

// Flush interval
let flushInterval: NodeJS.Timeout | null = null;

/**
 * Initialize audit logger (start background flush)
 */
export function initAuditLogger(): void {
  if (flushInterval) return;
  
  flushInterval = setInterval(() => {
    flushAll().catch((err) => {
      logger.error('Failed to flush audit logs', { error: err });
    });
  }, FLUSH_INTERVAL_MS);

  logger.info('Audit logger initialized');
}

/**
 * Flush all buffers to database
 */
export async function flushAll(): Promise<void> {
  await Promise.all([
    flushAuditEvents(),
    flushUsageLogs(),
    flushErrorLogs(),
  ]);
}

/**
 * Flush audit events buffer
 */
async function flushAuditEvents(): Promise<void> {
  if (auditBuffer.length === 0) return;

  const events = auditBuffer.splice(0, BATCH_SIZE);
  
  try {
    const { error } = await supabase.from('audit_logs').insert(events);
    if (error) {
      logger.error('Failed to write audit logs', { error, count: events.length });
      // Re-add to buffer on failure
      auditBuffer.unshift(...events);
    } else {
      metrics.increment('audit.events_written', { count: String(events.length) });
    }
  } catch (err) {
    logger.error('Failed to flush audit events', { error: err });
    auditBuffer.unshift(...events);
  }
}

/**
 * Flush usage logs buffer
 */
async function flushUsageLogs(): Promise<void> {
  if (usageBuffer.length === 0) return;

  const logs = usageBuffer.splice(0, BATCH_SIZE);
  
  try {
    const { error } = await supabase.from('provider_usage_logs').insert(logs);
    if (error) {
      logger.error('Failed to write usage logs', { error, count: logs.length });
      usageBuffer.unshift(...logs);
    } else {
      metrics.increment('audit.usage_written', { count: String(logs.length) });
    }
  } catch (err) {
    logger.error('Failed to flush usage logs', { error: err });
    usageBuffer.unshift(...logs);
  }
}

/**
 * Flush error logs buffer
 */
async function flushErrorLogs(): Promise<void> {
  if (errorBuffer.length === 0) return;

  const logs = errorBuffer.splice(0, BATCH_SIZE);
  
  try {
    const { error } = await supabase.from('error_logs').insert(logs);
    if (error) {
      logger.error('Failed to write error logs', { error, count: logs.length });
      errorBuffer.unshift(...logs);
    } else {
      metrics.increment('audit.errors_written', { count: String(logs.length) });
    }
  } catch (err) {
    logger.error('Failed to flush error logs', { error: err });
    errorBuffer.unshift(...logs);
  }
}

/**
 * Log an audit event
 */
export function logAuditEvent(event: AuditEvent): void {
  auditBuffer.push(event);
  
  // Log to console for immediate visibility
  logger.info(`Audit: ${event.event_type}`, {
    eventType: event.event_type,
    userId: event.user_id,
    action: event.action,
    requestId: event.request_id,
  });

  // Flush if buffer is getting large
  if (auditBuffer.length >= BATCH_SIZE * 2) {
    flushAuditEvents().catch(() => {});
  }
}

/**
 * Log provider usage
 */
export function logProviderUsage(log: ProviderUsageLog): void {
  usageBuffer.push(log);
  
  logger.debug('Provider usage', {
    provider: log.provider,
    model: log.model,
    inputTokens: log.input_tokens,
    outputTokens: log.output_tokens,
    cost: log.total_cost,
    latency: log.latency_ms,
    status: log.status,
  });

  metrics.increment('provider.usage', { provider: log.provider, model: log.model, status: log.status });
  metrics.histogram('provider.usage.tokens', log.input_tokens + log.output_tokens, { provider: log.provider });

  if (usageBuffer.length >= BATCH_SIZE * 2) {
    flushUsageLogs().catch(() => {});
  }
}

/**
 * Log an error
 */
export function logError(error: ErrorLog): void {
  errorBuffer.push(error);
  
  // Also log to console based on severity
  switch (error.severity) {
    case 'critical':
    case 'high':
      logger.error('Critical error logged', {
        type: error.error_type,
        message: error.error_message,
        provider: error.provider,
        userId: error.user_id,
      });
      break;
    case 'medium':
      logger.warn('Error logged', {
        type: error.error_type,
        message: error.error_message,
      });
      break;
    default:
      logger.debug('Error logged', {
        type: error.error_type,
        message: error.error_message,
      });
  }

  if (errorBuffer.length >= BATCH_SIZE * 2) {
    flushErrorLogs().catch(() => {});
  }
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  type: 'login' | 'logout' | 'signup' | 'failure',
  userId: string,
  metadata?: {
    email?: string;
    reason?: string;
    ip_address?: string;
    user_agent?: string;
  }
): void {
  logAuditEvent({
    event_type: `auth_${type}`,
    user_id: userId,
    action: `auth.${type}`,
    metadata: metadata ? {
      email: metadata.email,
      reason: metadata.reason,
    } : undefined,
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
  });
}

/**
 * Log rate limit event
 */
export function logRateLimit(
  userId: string,
  endpoint: string,
  ipAddress?: string
): void {
  logAuditEvent({
    event_type: 'rate_limit',
    user_id: userId,
    action: 'rate_limit.exceeded',
    metadata: { endpoint },
    ip_address: ipAddress,
  });

  logError({
    user_id: userId,
    error_type: 'RateLimitExceeded',
    error_message: `Rate limit exceeded for endpoint: ${endpoint}`,
    severity: 'low',
    resolved: true,
    metadata: { endpoint },
  });
}

/**
 * Log quota exceeded event
 */
export function logQuotaExceeded(
  userId: string,
  workspaceId: string,
  quotaType: string,
  current: number,
  limit: number
): void {
  logAuditEvent({
    event_type: 'quota_exceeded',
    user_id: userId,
    workspace_id: workspaceId,
    action: 'quota.exceeded',
    metadata: { quotaType, current, limit },
  });

  logError({
    user_id: userId,
    workspace_id: workspaceId,
    error_type: 'QuotaExceeded',
    error_message: `Quota exceeded: ${quotaType} (${current}/${limit})`,
    severity: 'medium',
    resolved: false,
    metadata: { quotaType, current, limit },
  });
}

/**
 * Get audit logs for a user (admin function)
 */
export async function getAuditLogs(
  userId: string,
  options: {
    eventTypes?: AuditEventType[];
    limit?: number;
    offset?: number;
  } = {}
): Promise<AuditEvent[]> {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options.eventTypes?.length) {
    query = query.in('event_type', options.eventTypes);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error } = await query;
  
  if (error) {
    logger.error('Failed to fetch audit logs', { userId, error });
    return [];
  }

  return data || [];
}

/**
 * Get error logs for a user
 */
export async function getErrorLogs(
  userId?: string,
  options: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resolved?: boolean;
    limit?: number;
  } = {}
): Promise<ErrorLog[]> {
  let query = supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (options.severity) {
    query = query.eq('severity', options.severity);
  }

  if (options.resolved !== undefined) {
    query = query.eq('resolved', options.resolved);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  
  if (error) {
    logger.error('Failed to fetch error logs', { userId, error });
    return [];
  }

  return data || [];
}

/**
 * Get provider usage summary
 */
export async function getProviderUsageSummary(
  userId: string,
  days: number = 7
): Promise<{
  totalRequests: number;
  totalCost: number;
  byProvider: Record<string, { requests: number; cost: number }>;
  byDay: Record<string, { requests: number; cost: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  const { data, error } = await supabase
    .from('provider_usage_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDateStr);

  if (error || !data) {
    return { totalRequests: 0, totalCost: 0, byProvider: {}, byDay: {} };
  }

  const summary = {
    totalRequests: 0,
    totalCost: 0,
    byProvider: {} as Record<string, { requests: number; cost: number }>,
    byDay: {} as Record<string, { requests: number; cost: number }>,
  };

  for (const log of data) {
    summary.totalRequests++;
    summary.totalCost += log.total_cost;

    if (!summary.byProvider[log.provider]) {
      summary.byProvider[log.provider] = { requests: 0, cost: 0 };
    }
    summary.byProvider[log.provider].requests++;
    summary.byProvider[log.provider].cost += log.total_cost;

    const day = log.created_at?.split('T')[0] || 'unknown';
    if (!summary.byDay[day]) {
      summary.byDay[day] = { requests: 0, cost: 0 };
    }
    summary.byDay[day].requests++;
    summary.byDay[day].cost += log.total_cost;
  }

  return summary;
}

/**
 * Stop audit logger
 */
export function stopAuditLogger(): void {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
  
  // Final flush
  flushAll().catch(() => {});
}
