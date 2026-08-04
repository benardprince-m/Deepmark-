/**
 * DeepMark Observability - Barrel Export
 */

export {
  logger,
  metrics,
  generateRequestId,
  createRequestLogger,
  trackLatency,
  trackLatencyAsync,
  REQUEST_ID_HEADER,
  type LogContext,
  type LogLevel,
  type MetricPoint,
} from './observability/index';

export {
  initSentry,
  captureError,
  captureMessage,
  startTransaction,
  startTransactionAsync,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  Sentry,
} from './observability/sentry';

export {
  recordTokenUsage,
  calculateCost,
  getUserUsageStats,
  getUserDailyUsage,
  getWorkspaceDailyUsage,
  exportUsageData,
  pruneUsageData,
  TOKEN_PRICING,
  type TokenUsage,
  type CostRecord,
  type UsageStats,
} from './observability/usage';

export {
  initAuditLogger,
  stopAuditLogger,
  flushAll,
  logAuditEvent,
  logProviderUsage,
  logError,
  logAuthEvent,
  logRateLimit,
  logQuotaExceeded,
  getAuditLogs,
  getErrorLogs,
  getProviderUsageSummary,
  type AuditEvent,
  type AuditEventType,
  type ProviderUsageLog,
  type ErrorLog,
} from './observability/audit-logger';
