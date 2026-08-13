# DeepMark Dependency Map

## Overview

This document maps all dependencies between major system components, identifies single points of failure, circular dependencies, and hidden coupling.

---

## 1. Component Dependency Matrix

### Core Architecture

```
PRESENTATION LAYER
  - src/app/(marketing)/pricing/page.tsx
  - src/app/auth/{login,signup}/page.tsx
  - src/app/dashboard/{analytics,planner,studio,settings,plan,page}.tsx
  - src/components/{ai,ui,layout,globe,thinking}/**

         |
         v

API LAYER (src/app/api/v1/)
  - auth/{login,signup,logout,refresh,me}/route.ts
  - content/{id}/route.ts, campaigns/{id}/route.ts
  - workspaces/{id}/route.ts, startups/{id}/route.ts
  - memory/[workspace_id]/{id}/route.ts
  - studio/{enhance,prompt}/route.ts
  - subscription/{check,usage}/route.ts
  - analytics/{startup/[id],sync}/route.ts
  - integrations/[ws]/index.ts, health/route.ts

         |
         v

LIBRARY LAYER (src/lib/)
  - jwt.ts: signToken(), verifyToken(), getUserFromRequest()
  - auth.ts: getToken(), saveToken(), logout()
  - api.ts: apiGet(), apiPost(), apiPatch()
  - api-response.ts: successResponse(), errorResponse()
  - supabase.ts: supabase client, supabaseAdmin
  - observability/: logger, metrics, audit-logger, usage
  - subscription.ts: SUBSCRIPTION_PLANS
  - rate-limit.ts: rateLimit()

         |
         v

AI ORCHESTRATION (src/lib/ai/)
  - provider-router.ts: Provider selection, complexity analysis
  - registry.ts: AI capability system, prompt building
  - interface.ts: AIProvider interface
  - provider-health.ts: Circuit breaker, health monitoring
  - quota-manager.ts: Workspace quotas, usage tracking
  - memory-quality.ts: Memory scoring, quality gates
  - retry.ts: Exponential backoff retry
  - adapters/openrouter.ts: OpenRouter provider implementation

         |
         v

DATABASE (supabase/migrations/)
  - 001_initial_schema.sql: Core tables, RLS policies
  - 002_add_notifications.sql: Notifications table
  - 003_production_observability.sql: Audit, usage, error logs
  - 004_subscription_system.sql: Subscription tiers
  - 005_retention_engines.sql: Trend nodes, velocity tracking
```

---

## 2. Dependency Analysis by Component

### 2.1 Presentation Layer

| Dependency | Provider | Consumer | Risk |
|------------|----------|----------|------|
| src/lib/auth.ts | getToken, logout, isAuthenticated | All dashboard pages | LOW |
| src/lib/api.ts | apiGet, apiPost, apiPatch | All dashboard pages | MEDIUM |
| src/components/ui/* | UI primitives | All pages | LOW |
| src/components/ai/ThinkingPanel | AI thinking display | Studio page | MEDIUM |

### 2.2 API Layer

| Dependency | Provider | Consumer | Risk |
|------------|----------|----------|------|
| src/lib/jwt.ts | getUserFromRequest, verifyToken | All protected routes | HIGH |
| src/lib/supabase.ts | supabaseAdmin | Auth, content, memory routes | HIGH |
| src/lib/api-response.ts | successResponse, errorResponse | All API routes | LOW |
| src/lib/rate-limit.ts | rateLimit, getClientIP | Auth routes | MEDIUM |
| src/lib/subscription.ts | SUBSCRIPTION_PLANS | Subscription routes | LOW |
| src/lib/ai/registry.ts | requestCapability | Studio/prompt route | MEDIUM |
| src/lib/ai/quota-manager.ts | checkQuota, recordUsage | Studio routes | MEDIUM |

### 2.3 Identity/Auth

| Dependency | Type | Consumer | Risk |
|------------|------|----------|------|
| JWT_SECRET | Env Var | middleware.ts, jwt.ts | CRITICAL |
| jose | Package | jwtVerify, SignJWT | jwt.ts | MEDIUM |
| bcryptjs | Package | Password hashing | signup, login routes | LOW |
| supabaseAdmin | Import | Database access | Auth routes | HIGH |

### 2.4 Authorization (RLS Policies)

| Table | RLS Policy | Depends On |
|-------|------------|------------|
| users | auth.uid() = id | Supabase Auth |
| workspaces | auth.uid() = user_id | users table |
| startups | Subquery to workspaces | workspaces, users |
| campaigns | Subquery through startups | startups, workspaces |
| content | Subquery through campaigns | campaigns, startups |
| memory | Subquery to workspaces | workspaces |
| integrations | Subquery to workspaces | workspaces |

---

## 3. Data Flow Diagrams

### 3.1 Authentication Flow

```
SIGNUP FLOW:
Client -> POST signup -> Insert user/workspace -> Supabase -> Return JWT

REQUEST FLOW:
Client +Bearer -> Middleware (Edge) -> jwtVerify() -> Forward to Route -> RLS Query

PUBLIC ROUTES (no auth):
- /api/v1/auth/signup, /api/v1/auth/login, /api/v1/auth/refresh, /api/v1/health
```

### 3.2 AI Generation Pipeline

```
User Input -> Validation (Zod) -> Auth Check -> Capability Mapping
    |
    v
Thinking Stages (registry.ts):
  1. understanding      2. retrieving_memory  3. selecting_skills
  4. building_prompt     5. selecting_provider   6. calling_provider
  7. validating_response 8. returning_result
    |
    v
Provider Selection (provider-router.ts):
  Input Analysis: Simple (<100 chars) | Moderate (100-5000) | Complex (>5000 chars)
  
  Provider Priority:
    1. openrouter (priority: 1, cost: low)
    2. openai (priority: 2, cost: medium)
    3. anthropic (priority: 3, cost: medium)
    4. google (priority: 4, cost: low)
    5. ollama (priority: 5, cost: free)
    |
    v
API Call (adapters/openrouter.ts):
  URL: https://openrouter.ai/api/v1/chat/completions
  Model: google/gemma-4-26b-a4b-it:free (default)
  
  Retry: maxRetries=3, timeoutMs=30000, backoff=2^n * 1000ms
  Circuit Breaker: failureThreshold=5, successThreshold=2, timeoutMs=60000
    |
    v
Response to Client
```

### 3.3 Memory System Flow

```
Memory Query -> Score Cards -> Filter (>30)

Scoring Formula:
  score = (confidence/100)*50 + category_match*20 + recency_score*20 + context_relevance*10
```

### 3.4 Database Query Flow

```
API Route -> supabaseAdmin (bypasses RLS) -> Workspace Access Check -> Data Query
```

---

## 4. External Service Dependencies

| Service | Purpose | Fallback | Risk |
|---------|---------|---------|------|
| Supabase | Database, Auth, RLS | None | CRITICAL |
| OpenRouter API | AI generation | Not implemented | HIGH |
| JWT_SECRET | Token signing | Throws error | CRITICAL |
| Sentry DSN | Error tracking | Console logging | LOW |

---

## 5. Single Points of Failure (SPOF)

### CRITICAL SPOF

| Component | Description | Impact | Mitigation |
|-----------|-------------|--------|------------|
| Supabase | Single database | All data access fails | Multi-region replication |
| JWT_SECRET | Auth token signing | Login/logout breaks | Env variable validation |
| OpenRouter API | AI provider | Content generation breaks | Implement fallback providers |

### HIGH SPOF

| Component | Description | Impact | Mitigation |
|-----------|-------------|--------|------------|
| providerHealthManager | Singleton circuit breaker | No provider failover | Add backup providers |
| In-memory rate limiting | Map-based storage | Rate limits reset on restart | Use Redis |
| In-memory quotas | Map-based storage | Quotas reset on restart | Use database |

### MEDIUM SPOF

| Component | Description | Impact | Mitigation |
|-----------|-------------|--------|------------|
| Audit buffer | Batch writes | Potential log loss | Reduce batch size |
| Memory scoring | Threshold at 30 | May miss relevant memories | Tune threshold |

---

## 6. Circular Dependencies

**No circular dependencies detected.** The import chain is acyclic.

Potential concern points:
- src/lib/ai/production.ts exports from multiple modules that may create implicit cycles
- observability/index.ts is imported by many modules (but doesn't import back)

---

## 7. Duplicated Logic

### 7.1 JWT Secret Initialization

Location 1: src/middleware.ts
Location 2: src/lib/jwt.ts

Both define JWT_SECRET identically:
```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (() => { throw new Error(...) })()
);
```

Solution: Extract to src/lib/constants.ts

### 7.2 Workspace Access Verification

Location 1: src/app/api/v1/memory/[workspace_id]/route.ts
Location 2: src/app/api/v1/integrations/[ws]/index.ts

Identical verifyWorkspaceAccess() implementations.

Solution: Extract to src/lib/auth.ts or src/lib/workspace.ts

### 7.3 Subscription Plan Definitions

Location 1: src/lib/subscription.ts
Location 2: supabase/migrations/004_subscription_system.sql

Plans defined in both TypeScript and SQL.

Solution: Generate SQL from TypeScript definitions or vice versa

### 7.4 Observability Import

Multiple locations import from src/lib/observability:
```typescript
import { logger, metrics } from '../observability';
```

Impact: Tight coupling, harder to swap observability providers

---

## 8. Hidden Coupling

### 8.1 Environment Variable Coupling

| Variable | Files Using | Risk |
|----------|-------------|------|
| NEXT_PUBLIC_SUPABASE_URL | supabase.ts, memory-engine/client.ts, audit-logger.ts, quota-manager.ts | HIGH |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | supabase.ts, memory-engine/client.ts | HIGH |
| SUPABASE_SERVICE_ROLE_KEY | supabase.ts, audit-logger.ts, quota-manager.ts | HIGH |
| JWT_SECRET | middleware.ts, jwt.ts | CRITICAL |

### 8.2 Magic Numbers

| Location | Value | Should Be |
|----------|-------|-----------|
| BaseAdapter.maxRetries | 3 | Configurable |
| BaseAdapter.timeoutMs | 30000 | Configurable |
| memory-engine/client.ts score threshold | 30 | Named constant |
| CircuitBreaker.failureThreshold | 5 | Configurable |
| CircuitBreaker.timeoutMs | 60000 | Configurable |

### 8.3 Implicit Dependencies

| Module | Implicit Dependency | Explicit Should Be |
|--------|-------------------|-------------------|
| registry.ts | OpenRouter is default | Provider selection |
| memory-engine/client.ts | Supabase URL from env | Injected client |
| observability | Console + metrics | Structured interface |

---

## 9. Risk Assessment Summary

### Risk Matrix

| Component | Availability | Data Loss | Security | Performance |
|-----------|--------------|-----------|----------|-------------|
| Database (Supabase) | HIGH | HIGH | MEDIUM | MEDIUM |
| AI Provider (OpenRouter) | HIGH | LOW | LOW | MEDIUM |
| In-memory Storage | HIGH | CRITICAL | LOW | LOW |
| JWT Auth | MEDIUM | LOW | HIGH | LOW |
| Rate Limiting | MEDIUM | LOW | MEDIUM | LOW |
| Observability | MEDIUM | MEDIUM | LOW | LOW |

### Recommended Priority Fixes

1. CRITICAL: Implement fallback AI provider in registry.ts
2. CRITICAL: Add env variable validation at startup
3. HIGH: Extract duplicated verifyWorkspaceAccess()
4. HIGH: Move rate limiting/quota storage to Redis or database
5. MEDIUM: Extract JWT_SECRET to shared constant
6. MEDIUM: Add configuration for magic numbers
7. LOW: Generate SQL from TypeScript subscription definitions

---

## 10. Visual Architecture Diagram

```
CLIENTS: Browser, iOS, Android, API, CLI
    |
    v
+-----------------------------------------------------------+
|                      NEXT.JS APPLICATION                   |
|                                                           |
|  +---------------------------------------------------+   |
|  |  MIDDLEWARE (Edge)                               |   |
|  |  - JWT Verification (public routes bypass)        |   |
|  |  - Rate Limiting (public routes)                 |   |
|  +---------------------------------------------------+   |
|                        |                                 |
|                        v                                 |
|  +---------------------------------------------------+   |
|  |  PRESENTATION LAYER                              |   |
|  |  src/app/{auth,dashboard,(marketing)}/           |   |
|  +---------------------------------------------------+   |
|                        |                                 |
|                        v                                 |
|  +---------------------------------------------------+   |
|  |  API LAYER (src/app/api/v1/)                    |   |
|  |  auth/, content/, memory/, studio/, subscription/ |   |
|  +---------------------------------------------------+   |
|                        |                                 |
|                        v                                 |
|  +---------------------------------------------------+   |
|  |  LIBRARY LAYER (src/lib/)                       |   |
|  |  jwt.ts, auth.ts, api.ts, supabase.ts           |   |
|  |  subscription.ts, rate-limit                     |   |
|  |            |                                      |   |
|  |            v                                      |   |
|  |  +---------------------------------------------+ |   |
|  |  |  AI ORCHESTRATION (src/lib/ai/)            | |   |
|  |  |  provider-router, registry, provider-health  | |   |
|  |  |  quota-manager, memory-quality, retry       | |   |
|  |  |  adapters/openrouter                        | |   |
|  |  +---------------------------------------------+ |   |
|  +---------------------------------------------------+   |
+-----------------------------------------------------------+
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
+----------------+ +----------------+ +----------------+
|   SUPABASE    | |  OPENROUTER    | |    SENTRY      |
| AUTH + DB     | |   AI API       | |Error Tracking  |
| RLS Policies  | | /chat/complet  | |  (Optional)    |
| Tables:       | +----------------+ +----------------+
| - users       |
| - workspaces  |
| - memory      |
| - audit_logs  |
+----------------+
```

---

## 11. Appendix: File Reference

### Core Infrastructure Files

| File | Purpose | Dependencies |
|------|---------|--------------|
| src/middleware.ts | Edge auth middleware | jose |
| src/lib/supabase.ts | Database client | @supabase/supabase-js |
| src/lib/jwt.ts | JWT utilities | jose |
| src/lib/auth.ts | Client auth | None |
| src/lib/api.ts | API client | auth.ts |
| src/lib/api-response.ts | Response helpers | None |

### AI System Files

| File | Purpose | Dependencies |
|------|---------|--------------|
| src/lib/ai/provider-router.ts | Provider selection | observability, provider-health |
| src/lib/ai/registry.ts | AI capabilities | interface, types, adapters |
| src/lib/ai/provider-health.ts | Circuit breaker | observability |
| src/lib/ai/quota-manager.ts | Quota tracking | observability, supabase |
| src/lib/ai/memory-quality.ts | Memory scoring | observability |
| src/lib/ai/retry.ts | Retry logic | observability |
| src/lib/ai/adapters/openrouter.ts | OpenRouter impl | base, types |

### Observability Files

| File | Purpose | Dependencies |
|------|---------|--------------|
| src/lib/observability/index.ts | Logger, metrics | Node.js crypto |
| src/lib/observability/sentry.ts | Sentry integration | @sentry/nextjs |
| src/lib/observability/audit-logger.ts | Audit logging | supabase |
| src/lib/observability/usage.ts | Token tracking | observability |

### Database Migrations

| File | Purpose | Tables Added |
|------|---------|--------------|
| 001_initial_schema.sql | Core schema | users, workspaces, startups, campaigns, content, tasks, analytics, memory, integrations |
| 002_add_notifications.sql | Notifications | notifications |
| 003_production_observability.sql | Audit system | audit_logs, provider_usage_logs, error_logs, workspace_settings |
| 004_subscription_system.sql | Subscriptions | usage_logs |
| 005_retention_engines.sql | Trend system | global_trend_nodes, content_velocity_tracking |

---

*Generated: 2026-08-13*
*Version: 1.0.0*
