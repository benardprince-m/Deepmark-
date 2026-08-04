/**
 * DeepMark Provider Health System
 * Health checks, retries, circuit breaker, automatic failover
 */

import { metrics, logger } from '../observability';

export type ProviderStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface ProviderHealth {
  name: string;
  status: ProviderStatus;
  lastCheck: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  averageLatency: number;
  errorRate: number;
  isCircuitOpen: boolean;
}

export interface HealthCheckResult {
  provider: string;
  healthy: boolean;
  latency: number;
  error?: string;
  timestamp: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Failures before opening circuit
  successThreshold: number;      // Successes before closing circuit
  timeoutMs: number;            // Time before attempting to close circuit
  halfOpenMaxCalls: number;      // Max calls in half-open state
}

const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60000, // 1 minute
  halfOpenMaxCalls: 3,
};

/**
 * Circuit Breaker States
 */
enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',        // Blocking calls
  HALF_OPEN = 'half-open', // Testing if recovery is possible
}

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCalls: number = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  /**
   * Check if a call should be allowed
   */
  canExecute(): boolean {
    switch (this.state) {
      case CircuitState.CLOSED:
        return true;
        
      case CircuitState.OPEN:
        // Check if timeout has passed
        if (Date.now() - this.lastFailureTime >= this.config.timeoutMs) {
          this.state = CircuitState.HALF_OPEN;
          this.halfOpenCalls = 0;
          logger.info('Circuit breaker entering half-open state');
          return true;
        }
        return false;
        
      case CircuitState.HALF_OPEN:
        return this.halfOpenCalls < this.config.halfOpenMaxCalls;
    }
  }

  /**
   * Record a successful call
   */
  recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      this.halfOpenCalls++;
      
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        logger.info('Circuit breaker closed after successful recovery');
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  /**
   * Record a failed call
   */
  recordFailure(): void {
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Immediately open circuit
      this.state = CircuitState.OPEN;
      this.successCount = 0;
      logger.warn('Circuit breaker reopened after half-open failure');
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount++;
      
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN;
        logger.warn(`Circuit breaker opened after ${this.failureCount} consecutive failures`);
      }
    }
  }

  /**
   * Get current state
   */
  getState(): { state: CircuitState; failureCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
    };
  }

  /**
   * Force reset
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
  }
}

/**
 * Provider Health Manager
 */
export class ProviderHealthManager {
  private providers: Map<string, ProviderHealth> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly checkIntervalMs: number;

  constructor(checkIntervalMs: number = 30000) {
    this.checkIntervalMs = checkIntervalMs;
  }

  /**
   * Register a provider
   */
  registerProvider(name: string, config?: Partial<CircuitBreakerConfig>): void {
    this.providers.set(name, {
      name,
      status: 'unknown',
      lastCheck: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      averageLatency: 0,
      errorRate: 0,
      isCircuitOpen: false,
    });
    
    this.circuitBreakers.set(name, new CircuitBreaker(config));
    
    logger.info(`Provider registered: ${name}`);
  }

  /**
   * Get circuit breaker for a provider
   */
  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  /**
   * Record a successful call
   */
  recordSuccess(provider: string, latency: number): void {
    const health = this.providers.get(provider);
    const circuit = this.circuitBreakers.get(provider);
    
    if (!health || !circuit) return;

    health.consecutiveSuccesses++;
    health.consecutiveFailures = 0;
    
    // Update average latency (exponential moving average)
    health.averageLatency = health.averageLatency * 0.7 + latency * 0.3;
    
    // Update error rate
    const total = health.consecutiveSuccesses + health.consecutiveFailures;
    health.errorRate = health.consecutiveFailures / total;
    
    // Update status
    this.updateProviderStatus(health);
    
    // Record in circuit breaker
    circuit.recordSuccess();
    health.isCircuitOpen = circuit.getState().state !== CircuitState.CLOSED;

    metrics.increment('provider.success', { provider });
    metrics.histogram('provider.latency', latency, { provider });
  }

  /**
   * Record a failed call
   */
  recordFailure(provider: string, latency: number, error?: string): void {
    const health = this.providers.get(provider);
    const circuit = this.circuitBreakers.get(provider);
    
    if (!health || !circuit) return;

    health.consecutiveFailures++;
    health.consecutiveSuccesses = 0;
    
    // Update error rate
    const total = health.consecutiveSuccesses + health.consecutiveFailures;
    health.errorRate = health.consecutiveFailures / total;
    
    // Update status
    this.updateProviderStatus(health);
    
    // Record in circuit breaker
    circuit.recordFailure();
    health.isCircuitOpen = circuit.getState().state !== CircuitState.CLOSED;

    logger.error(`Provider failure: ${provider}`, {
      provider,
      error,
      latency,
      consecutiveFailures: health.consecutiveFailures,
    });

    metrics.increment('provider.failure', { provider, error: error || 'unknown' });
  }

  /**
   * Check if provider can handle requests
   */
  canUse(provider: string): boolean {
    const circuit = this.circuitBreakers.get(provider);
    if (!circuit) return true;
    return circuit.canExecute();
  }

  /**
   * Get health status for a provider
   */
  getHealth(provider: string): ProviderHealth | undefined {
    return this.providers.get(provider);
  }

  /**
   * Get all provider health statuses
   */
  getAllHealth(): ProviderHealth[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get best available provider (healthy, circuit closed)
   */
  getBestProvider(providers: string[]): string | null {
    const available = providers
      .map((p) => ({ name: p, health: this.providers.get(p) }))
      .filter(
        (p) =>
          p.health &&
          (p.health.status === 'healthy' || p.health.status === 'degraded') &&
          !p.health.isCircuitOpen
      )
      .sort((a, b) => {
        // Prefer healthy over degraded
        if (a.health!.status === 'healthy' && b.health!.status !== 'healthy') return -1;
        if (b.health!.status === 'healthy' && a.health!.status !== 'healthy') return 1;
        // Then by latency
        return a.health!.averageLatency - b.health!.averageLatency;
      });

    return available[0]?.name || null;
  }

  /**
   * Update provider status based on metrics
   */
  private updateProviderStatus(health: ProviderHealth): void {
    if (health.consecutiveFailures >= 3) {
      health.status = 'unhealthy';
    } else if (health.consecutiveFailures >= 1 || health.errorRate > 0.1) {
      health.status = 'degraded';
    } else if (health.consecutiveSuccesses >= 3) {
      health.status = 'healthy';
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(checkFn: (provider: string) => Promise<HealthCheckResult>): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      for (const [name] of this.providers) {
        try {
          const result = await checkFn(name);
          const health = this.providers.get(name);
          
          if (health) {
            health.lastCheck = result.timestamp;
            
            if (result.healthy) {
              this.recordSuccess(name, result.latency);
            } else {
              this.recordFailure(name, result.latency, result.error);
            }
          }
        } catch (error) {
          logger.error(`Health check failed for ${name}`, { error });
        }
      }
    }, this.checkIntervalMs);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Singleton instance
export const providerHealthManager = new ProviderHealthManager();
