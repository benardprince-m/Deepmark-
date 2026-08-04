/**
 * DeepMark Sentry Integration
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';
import { generateRequestId, REQUEST_ID_HEADER } from './index';

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry if DSN is configured
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log('[Sentry] No DSN configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Error sampling
    sampleRate: 1.0,
    
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',
    
    // Ignore common non-errors
    ignoreErrors: [
      'Network Error',
      'NetworkError',
      'Failed to fetch',
      'Cancel',
    ],
    
    // Attach stack traces
    attachStacktrace: true,
    
    // Custom error processors
    beforeSend(event) {
      // Remove sensitive data
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });

  console.log('[Sentry] Initialized with environment:', SENTRY_ENVIRONMENT);
}

/**
 * Capture an error with optional context
 */
export function captureError(
  error: Error,
  context?: {
    requestId?: string;
    userId?: string;
    workspaceId?: string;
    provider?: string;
    operation?: string;
  }
): string {
  const requestId = context?.requestId || generateRequestId();
  
  Sentry.withScope((scope) => {
    // Set request ID
    scope.setTag('request_id', requestId);
    
    // Set user context if available
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    
    // Set custom tags
    if (context?.workspaceId) {
      scope.setTag('workspace_id', context.workspaceId);
    }
    if (context?.provider) {
      scope.setTag('provider', context.provider);
    }
    if (context?.operation) {
      scope.setTag('operation', context.operation);
    }
    
    // Capture the error
    Sentry.captureException(error, {
      contexts: {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
      },
    });
  });

  return requestId;
}

/**
 * Capture a message (non-error)
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): string {
  const requestId = context?.requestId as string || generateRequestId();
  
  Sentry.withScope((scope) => {
    scope.setTag('request_id', requestId);
    
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    Sentry.captureMessage(message, level);
  });

  return requestId;
}

/**
 * Start a performance transaction
 */
export function startTransaction<T>(
  name: string,
  operation: string,
  fn: () => T,
  _tags?: Record<string, string>
): T {
  // Use startSpan for transaction tracing
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    (span) => {
      try {
        const result = fn();
        return result;
      } catch (error) {
        if (error instanceof Error) {
          span.setStatus({ code: 2 }); // ERROR status
          span.recordException(error);
        }
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

/**
 * Async performance transaction
 */
export async function startTransactionAsync<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>,
  _tags?: Record<string, string>
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    async (span) => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        if (error instanceof Error) {
          span.setStatus({ code: 2 });
          span.recordException(error);
        }
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

/**
 * Add breadcrumb for user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data: data as Record<string, string>,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context
 */
export function setUserContext(userId: string, email?: string): void {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Express middleware-style request handler
 */
export function requestHandler() {
  // Note: Sentry.wrapRequestHandler deprecated in Next.js
  // Use Sentry's built-in Next.js integration instead
  return null;
}

export { Sentry, generateRequestId, REQUEST_ID_HEADER };
