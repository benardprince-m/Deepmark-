/**
 * DeepMark Observability Infrastructure
 * Structured logging, metrics, and request tracing
 */

import { randomUUID } from 'crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogContext {
  requestId?: string;
  userId?: string;
  workspaceId?: string;
  provider?: string;
  operation?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: unknown;
}

export interface MetricPoint {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

// In-memory metrics store (in production, use Prometheus, DataDog, etc.)
const metricsStore: Map<string, MetricPoint[]> = new Map();
const counters: Map<string, number> = new Map();

// Request ID header name
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Get current timestamp in ISO format
 */
function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Format log entry as structured JSON
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const entry = {
    timestamp: timestamp(),
    level,
    message,
    ...context,
  };
  return JSON.stringify(entry);
}

/**
 * DeepMark Logger - Structured logging with context
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      console.log(formatLog('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    console.log(formatLog('info', message, context));
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatLog('warn', message, context));
  },

  error(message: string, context?: LogContext): void {
    console.error(formatLog('error', message, context));
  },

  critical(message: string, context?: LogContext): void {
    console.error(formatLog('critical', message, context));
  },
};

/**
 * Metrics collector
 */
export const metrics = {
  /**
   * Increment a counter
   */
  increment(name: string, tags: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(tags)}`;
    counters.set(key, (counters.get(key) || 0) + 1);
  },

  /**
   * Record a histogram value
   */
  histogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const point: MetricPoint = {
      name,
      value,
      tags,
      timestamp: Date.now(),
    };
    
    const existing = metricsStore.get(name) || [];
    existing.push(point);
    
    // Keep last 1000 points per metric
    if (existing.length > 1000) {
      existing.shift();
    }
    
    metricsStore.set(name, existing);
  },

  /**
   * Record latency in milliseconds
   */
  latency(name: string, durationMs: number, tags: Record<string, string> = {}): void {
    this.histogram(`${name}.latency`, durationMs, tags);
    
    // Also record as distribution buckets for percentiles
    const buckets = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    for (const bucket of buckets) {
      if (durationMs <= bucket) {
        this.histogram(`${name}.latency_bucket`, 1, { ...tags, le: bucket.toString() });
        break;
      }
    }
    // +Inf bucket
    this.histogram(`${name}.latency_bucket`, 1, { ...tags, le: '+Inf' });
  },

  /**
   * Get current counter value
   */
  getCounter(name: string, tags: Record<string, string> = {}): number {
    const key = `${name}:${JSON.stringify(tags)}`;
    return counters.get(key) || 0;
  },

  /**
   * Get histogram summary for a metric
   */
  getHistogramSummary(name: string): { min: number; max: number; avg: number; count: number } {
    const points = metricsStore.get(name) || [];
    if (points.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    
    const values = points.map(p => p.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    };
  },

  /**
   * Get all stored metrics (for debugging/export)
   */
  export(): { counters: Record<string, number>; histograms: Record<string, unknown> } {
    const histograms: Record<string, unknown> = {};
    
    for (const [name, points] of metricsStore.entries()) {
      histograms[name] = {
        count: points.length,
        latest: points[points.length - 1]?.value || 0,
        summary: this.getHistogramSummary(name),
      };
    }
    
    return {
      counters: Object.fromEntries(counters),
      histograms,
    };
  },
};

/**
 * Create request-scoped logger with request ID
 */
export function createRequestLogger(requestId: string, baseContext: LogContext = {}) {
  return {
    debug: (message: string, context?: LogContext) => 
      logger.debug(message, { requestId, ...baseContext, ...context }),
    info: (message: string, context?: LogContext) => 
      logger.info(message, { requestId, ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) => 
      logger.warn(message, { requestId, ...baseContext, ...context }),
    error: (message: string, context?: LogContext) => 
      logger.error(message, { requestId, ...baseContext, ...context }),
    critical: (message: string, context?: LogContext) => 
      logger.critical(message, { requestId, ...baseContext, ...context }),
  };
}

/**
 * Latency tracker utility
 */
export function trackLatency<T>(
  name: string,
  fn: () => T,
  tags: Record<string, string> = {}
): T {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;
    metrics.latency(name, duration, { ...tags, status: 'success' });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.latency(name, duration, { ...tags, status: 'error' });
    throw error;
  }
}

/**
 * Async latency tracker
 */
export async function trackLatencyAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags: Record<string, string> = {}
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    metrics.latency(name, duration, { ...tags, status: 'success' });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.latency(name, duration, { ...tags, status: 'error' });
    throw error;
  }
}
