/**
 * DeepMark AI Production Features - Barrel Export
 */

export {
  CircuitBreaker,
  ProviderHealthManager,
  providerHealthManager,
  type ProviderHealth,
  type ProviderStatus,
  type HealthCheckResult,
  type RetryConfig,
  type CircuitBreakerConfig,
} from './provider-health';

export {
  withRetry,
  withRetryAndCircuitBreaker,
  calculateBackoff,
  isRetryableError,
  createRetryWrapper,
  type RetryOptions,
} from './retry';

export {
  getWorkspaceQuotaConfig,
  setWorkspaceQuotaConfig,
  checkQuota,
  getQuotaStatus,
  checkWorkspaceLimits,
  recordUsage,
  getDailyUsage,
  DEFAULT_QUOTAS,
  type QuotaConfig,
  type QuotaStatus,
  type DailyUsage,
} from './quota-manager';

export {
  scoreMemory,
  evaluateQualityGate,
  pruneMemories,
  findSimilarMemories,
  mergeMemories,
  updateMemoryAccess,
  getMemoryHealthReport,
  type MemoryEntry,
  type MemoryScore,
  type QualityGateResult,
} from './memory-quality';

export {
  selectProvider,
  selectProviderAuto,
  analyzeComplexity,
  getProviderStatus,
  getAllProviderStatus,
  registerDefaultProviders,
  createRoutingMiddleware,
  getRoutingRecommendations,
  DEFAULT_PROVIDERS,
  type TaskComplexity,
  type ProviderConfig,
  type RoutingContext,
} from './provider-router';
