# DeepMark Database Audit Report

**Repository:** /workspace/project/Deepmark-/Deepmark-
**Audit Date:** 2026-08-13

---

## 1. Migration History

| Order | File | Purpose | Version |
|-------|------|---------|---------|
| 1 | 001_initial_schema.sql | Core schema | 1.0.0 |
| 2 | 002_add_notifications.sql | Notifications | 1.0.1 |
| 3 | 003_production_observability.sql | Audit, usage, error logs | 1.0.2 |
| 4 | 004_subscription_system.sql | Subscription tier | 1.0.2 |
| 5 | 005_retention_engines.sql | Global trends | 1.0.3 |
| - | MANUAL_MIGRATION.sql | Redundant with permissive RLS | Manual |

### CRITICAL: MANUAL_MIGRATION.sql overrides secure RLS policies with USING (true)

## 2. Schema Map (17 Tables)

| Table | Columns | Has deleted_at | Indexes |
|-------|---------|----------------|---------|
| users | 11 | Yes | 1 |
| workspaces | 6 | Yes | 1 |
| startups | 10 | Yes | 1 |
| integrations | 11 | Yes | 1 |
| campaigns | 10 | Yes | 1 |
| content | 13 | Yes | 1 |
| tasks | 9 | No | 2 |
| analytics | 8 | No | 1 |
| memory | 11 | Yes | 1 |
| notifications | 9 | No | 3 |
| audit_logs | 12 | No | 5 |
| provider_usage_logs | 17 | No | 5 |
| error_logs | 15 | No | 6 |
| workspace_settings | 7 | No | 1 |
| usage_logs | 5 | No | 0 |
| global_trend_nodes | 11 | No | 0 |
| content_velocity_tracking | 11 | No | 0 |

## 3. Relationships (Cascade Delete Chain)

users → workspaces → startups → campaigns → content → analytics
                                └→ tasks
workspaces → integrations, memory, notifications, audit_logs, workspace_settings
content → content_velocity_tracking → global_trend_nodes

## 4. RLS Policy Analysis

| Table | Workspace Isolation | Public Access |
|-------|---------------------|---------------|
| users | Yes (auth.uid()) | No |
| workspaces | Yes | No |
| startups | Yes | No |
| integrations | Yes | No |
| campaigns | Yes | No |
| content | Yes | No |
| tasks | Yes | No |
| analytics | Yes | No |
| memory | Yes | No |
| notifications | Yes | No |
| audit_logs | Yes | No |
| provider_usage_logs | Yes | No |
| error_logs | Yes | No |
| workspace_settings | Yes | No |
| usage_logs | Yes | No |
| global_trend_nodes | No | YES (USING true) |
| content_velocity_tracking | Yes | No |

## 5. API Route Usage

| Route | Tables |
|-------|--------|
| /api/v1/auth/* | users |
| /api/v1/workspaces/* | workspaces, startups, campaigns |
| /api/v1/startups/* | startups, campaigns |
| /api/v1/campaigns/* | campaigns, tasks, content |
| /api/v1/content/* | content, analytics |
| /api/v1/integrations/* | integrations |
| /api/v1/memory/* | memory |
| /api/v1/tasks/* | tasks |
| /api/v1/analytics/* | analytics, content |
| /api/v1/trends/global | global_trend_nodes |
| /api/v1/trends/velocity | content_velocity_tracking |
| /api/v1/notifications | notifications |

### Tables NOT queried by API:
- audit_logs, provider_usage_logs, error_logs (write-only)
- workspace_settings (NOT USED)
- usage_logs (incomplete integration)

## 6. Issues Found

### CRITICAL
1. MANUAL_MIGRATION.sql overrides RLS with USING (true) - security risk
2. subscription routes don't use usage_logs table

### HIGH
3. workspace_settings never queried
4. content_velocity_tracking upsert has no unique constraint

### MEDIUM
5. Memory route uses unnecessary workspace_id param
6. Soft delete not applied to 9 tables

### LOW
7. global_trend_nodes is publicly accessible
8. Missing partial indexes on notifications, tasks, analytics

## 7. Recommendations

1. Remove/delete MANUAL_MIGRATION.sql
2. Integrate usage_logs with subscription endpoints
3. Add API routes for workspace_settings or remove table
4. Add UNIQUE constraint on content_velocity_tracking
5. Add partial indexes for soft-delete queries
