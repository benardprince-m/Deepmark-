/**
 * DeepMark Retry Utility
 * Exponential backoff with jitter for resilient operations
 */

import { logger } from '../observability';

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryableErrors?: string[];
  nonRetryableErrors?: string[];
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

/**
 * Calculate delay with exponential backoff
 */
export function calculateBackoff(
  attempt: number,
  baseDelay: number,
  multiplier: number,
  maxDelay: number,
  jitter: boolean = true
): number {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);
  const boundedDelay = Math.min(exponentialDelay, maxDelay);
  
  if (jitter) {
    // Add random jitter (0.5 to 1.5 of the delay)
    const jitterFactor = 0.5 + Math.random();
    return Math.floor(boundedDelay * jitterFactor);
  }
  
  return boundedDelay;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(
  error: Error,
  retryableErrors?: string[],
  nonRetryableErrors?: string[]
): boolean {
  // Check non-retryable list first (higher priority)
  if (nonRetryableErrors) {
    for (const pattern of nonRetryableErrors) {
      if (error.message.includes(pattern) || error.name.includes(pattern)) {
        return false;
      }
    }
  }

  // Check retryable list
  if (retryableErrors) {
    for (const pattern of retryableErrors) {
      if (error.message.includes(pattern) || error.name.includes(pattern)) {
        return true;
      }
    }
  }

  // Default retryable errors
  const defaultRetryable = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'network',
    'timeout',
    'rate_limit',
    '429',
    '502',
    '503',
    '504',
    'temporary',
  ];

  for (const pattern of defaultRetryable) {
    if (error.message.includes(pattern) || String(error).includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    jitter = true,
    retryableErrors,
    nonRetryableErrors,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      const isLastAttempt = attempt >= maxRetries;
      const shouldRetry = !isLastAttempt && isRetryableError(
        lastError,
        retryableErrors,
        nonRetryableErrors
      );

      if (!shouldRetry) {
        logger.warn('Non-retryable error, failing fast', {
          error: lastError.message,
          attempt,
        });
        throw lastError;
      }

      // Calculate delay
      const delay = calculateBackoff(
        attempt,
        baseDelayMs,
        backoffMultiplier,
        maxDelayMs,
        jitter
      );

      logger.info('Retrying after error', {
        attempt: attempt + 1,
        maxRetries,
        delayMs: delay,
        error: lastError.message,
      });

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, lastError, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Retry with circuit breaker integration
 */
export async function withRetryAndCircuitBreaker<T>(
  fn: () => Promise<T>,
  onFailure: () => void,
  onSuccess: () => void,
  options: RetryOptions & { circuitBreakerOpen?: boolean } = {}
): Promise<T> {
  // If circuit breaker is open, fail fast
  if (options.circuitBreakerOpen) {
    throw new Error('Circuit breaker is open, request rejected');
  }

  try {
    const result = await withRetry(fn, options);
    onSuccess();
    return result;
  } catch (error) {
    onFailure();
    throw error;
  }
}

/**
 * Create a retry wrapper for API calls
 */
export function createRetryWrapper(options: RetryOptions = {}) {
  return <T>(fn: () => Promise<T>) => withRetry(fn, options);
}
