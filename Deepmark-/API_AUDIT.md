# DeepMark API Audit Report

**Generated:** 2026-08-13  
**Version:** 1.0  
**API Base Path:** `/api/v1`

---

## 1. Complete Endpoint Inventory

### 1.1 Authentication Endpoints

| Method | Route | File | Auth | Rate Limit |
|--------|-------|------|------|------------|
| POST | `/api/v1/auth/signup` | `auth/signup/route.ts` | None | 3/hour |
| POST | `/api/v1/auth/login` | `auth/login/route.ts` | None | 5/min |
| POST | `/api/v1/auth/logout` | `auth/logout/route.ts` | JWT | None |
| POST | `/api/v1/auth/refresh` | `auth/refresh/route.ts` | None | 10/min |
| GET | `/api/v1/auth/me` | `auth/me/route.ts` | JWT | None |

### 1.2 Workspaces Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| GET | `/api/v1/workspaces` | `workspaces/route.ts` | JWT | None |
| POST | `/api/v1/workspaces` | `workspaces/route.ts` | JWT | Zod schema |
| GET | `/api/v1/workspaces/[id]` | `workspaces/[id]/route.ts` | JWT | UUID param |
| PATCH | `/api/v1/workspaces/[id]` | `workspaces/[id]/route.ts` | JWT | Zod schema |
| DELETE | `/api/v1/workspaces/[id]` | `workspaces/[id]/route.ts` | JWT | UUID param |

### 1.3 Startups Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| GET | `/api/v1/startups` | `startups/route.ts` | JWT | None |
| POST | `/api/v1/startups` | `startups/route.ts` | JWT | Zod schema |
| GET | `/api/v1/startups/[id]` | `startups/[id]/route.ts` | JWT | UUID param |
| PATCH | `/api/v1/startups/[id]` | `startups/[id]/route.ts` | JWT | Zod schema |
| DELETE | `/api/v1/startups/[id]` | `startups/[id]/route.ts` | JWT | UUID param |

### 1.4 Campaigns Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| POST | `/api/v1/campaigns` | `campaigns/route.ts` | JWT | Zod schema |
| GET | `/api/v1/campaigns/[id]` | `campaigns/[id]/route.ts` | JWT | UUID param |
| PATCH | `/api/v1/campaigns/[id]` | `campaigns/[id]/route.ts` | JWT | Zod schema |
| DELETE | `/api/v1/campaigns/[id]` | `campaigns/[id]/route.ts` | JWT | UUID param |

### 1.5 Content Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| POST | `/api/v1/content` | `content/route.ts` | JWT | Zod schema |
| GET | `/api/v1/content/[id]` | `content/[id]/route.ts` | JWT | UUID param |
| PATCH | `/api/v1/content/[id]` | `content/[id]/route.ts` | JWT | Zod schema |
| DELETE | `/api/v1/content/[id]` | `content/[id]/route.ts` | JWT | UUID param |

### 1.6 Tasks Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| POST | `/api/v1/tasks` | `tasks/route.ts` | JWT | Zod schema |
| GET | `/api/v1/tasks/[id]` | `tasks/[id]/route.ts` | JWT | UUID param |
| PATCH | `/api/v1/tasks/[id]` | `tasks/[id]/route.ts` | JWT | Zod schema |
| DELETE | `/api/v1/tasks/[id]` | `tasks/[id]/route.ts` | JWT | UUID param |

### 1.7 AI/Studio Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| POST | `/api/v1/studio/prompt` | `studio/prompt/route.ts` | JWT | Zod schema |
| POST | `/api/v1/studio/enhance` | `studio/enhance/route.ts` | JWT | Zod schema |
| GET | `/api/v1/ai/provider` | `ai/provider/route.ts` | JWT | None |

### 1.8 Analytics Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| GET | `/api/v1/analytics/startup/[startup_id]` | `analytics/startup/[startup_id]/route.ts` | JWT | UUID param |
| POST | `/api/v1/analytics/sync` | `analytics/sync/route.ts` | JWT | None |

### 1.9 Trends Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| GET | `/api/v1/trends/global` | `trends/global/route.ts` | JWT | None |
| GET | `/api/v1/trends/velocity` | `trends/velocity/route.ts` | JWT | None |
| POST | `/api/v1/trends/velocity` | `trends/velocity/route.ts` | JWT | Zod schema |

### 1.10 Subscription Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| GET | `/api/v1/subscription/check` | `subscription/check/route.ts` | JWT | None |
| POST | `/api/v1/subscription/usage` | `subscription/usage/route.ts` | JWT | Zod schema |

### 1.11 Other Endpoints

| Method | Route | File | Auth | Validation |
|--------|-------|------|------|------------|
| GET | `/api/v1/health` | `health/route.ts` | None | None |
| GET | `/api/v1/notifications` | `notifications/route.ts` | JWT | None |
| GET | `/api/v1/memory/[workspace_id]` | `memory/[workspace_id]/route.ts` | JWT | UUID param |
| POST | `/api/v1/memory/[workspace_id]` | `memory/[workspace_id]/route.ts` | JWT | Zod schema |
| GET | `/api/v1/memory/[workspace_id]/[id]` | `memory/[workspace_id]/[id]/route.ts` | JWT | UUID param |
| PATCH | `/api/v1/memory/[workspace_id]/[id]` | `memory/[workspace_id]/[id]/route.ts` | JWT | Zod schema |
| DELETE | `/api/v1/memory/[workspace_id]/[id]` | `memory/[workspace_id]/[id]/route.ts` | JWT | UUID param |
| GET | `/api/v1/integrations/[id]` | `integrations/[id]/route.ts` | JWT | UUID param |
| POST | `/api/v1/integrations/[id]` | `integrations/[id]/route.ts` | JWT | Zod schema |
| GET | `/api/v1/migrate` | `migrate/route.ts` | Secret Header | None |
| POST | `/api/v1/migrate` | `migrate/route.ts` | Secret Header | None |

---

## 2. Endpoint Details by Category

### 2.1 Authentication (`/api/v1/auth/*`)

#### POST `/api/v1/auth/signup`
- **File:** `src/app/api/v1/auth/signup/route.ts`
- **Auth:** None (public)
- **Rate Limit:** 3 requests/hour per IP
- **Input:** `{ "email": "string", "password": "string(min 8)" }`
- **Validation:** Zod schema (email format, password min 8 chars)
- **Business Logic:**
  1. Check if user exists
  2. Hash password with bcryptjs
  3. Create user record
  4. Create default workspace
  5. Generate JWT token
- **Database Writes:** `users`, `workspaces`
- **External Services:** None
- **Response:** `{ success, data: { user, token }, message }`
- **Issues:** No email verification, no password strength requirements beyond length

#### POST `/api/v1/auth/login`
- **File:** `src/app/api/v1/auth/login/route.ts`
- **Auth:** None (public)
- **Rate Limit:** 5 requests/minute per IP
- **Input:** `{ "email": "string", "password": "string" }`
- **Validation:** Zod schema (email format, non-empty password)
- **Business Logic:** Rate limit check, validate input, find user, compare password, generate JWT
- **Database Reads:** `users`
- **Response:** `{ success, data: { user, token }, message }`

#### POST `/api/v1/auth/logout`
- **File:** `src/app/api/v1/auth/logout/route.ts`
- **Auth:** JWT required
- **Business Logic:** Client-side logout (server confirms valid token)
- **Response:** `{ success: true }`

#### POST `/api/v1/auth/refresh`
- **File:** `src/app/api/v1/auth/refresh/route.ts`
- **Auth:** None (accepts any token)
- **Rate Limit:** 10 requests/minute per IP
- **Input:** `{ "token": "string" }`
- **Business Logic:** Verify token (even if expired), generate new JWT
- **Response:** `{ success, data: { token } }`
- **Issues:** Accepts expired tokens - should be more restrictive

#### GET `/api/v1/auth/me`
- **File:** `src/app/api/v1/auth/me/route.ts`
- **Auth:** JWT required
- **Business Logic:** Fetch current user profile
- **Database Reads:** `users`

### 2.2 AI/Studio (`/api/v1/studio/*`)

#### POST `/api/v1/studio/prompt`
- **File:** `src/app/api/v1/studio/prompt/route.ts`
- **Auth:** JWT required
- **Input:** `{ "type": "post|carousel|thread|video", "user_input": "string" }`
- **Business Logic:**
  1. Retrieve workspace memory
  2. Build context-rich prompt
  3. Call AI provider (OpenRouter)
  4. Extract insights and create memory entries
- **External Services:** OpenRouter API (AI generation)
- **Timeout:** 60 seconds (explicit)
- **Retry:** Built into provider (3 retries with backoff)

#### POST `/api/v1/studio/enhance`
- **File:** `src/app/api/v1/studio/enhance/route.ts`
- **Auth:** JWT required
- **Input:** `{ "content": "string", "instructions": "string?" }`
- **Business Logic:** Rewrite/enhance existing content
- **External Services:** OpenRouter API

### 2.3 Analytics (`/api/v1/analytics/*`)

#### GET `/api/v1/analytics/startup/[startup_id]`
- **Auth:** JWT required
- **Query Params:** `period` (week/month/all), `group_by` (platform)
- **Business Logic:**
  1. Verify startup access
  2. Get all campaigns for startup
  3. Fetch analytics for content in those campaigns
  4. Calculate totals and group by platform
- **Database Reads:** `startups`, `campaigns`, `analytics`
- **N+1 Issue:** Potential - campaigns fetched then analytics queried

#### POST `/api/v1/analytics/sync`
- **Auth:** JWT required
- **Business Logic:**
  1. Get recently published content (last 7 days)
  2. For each content, sync analytics
  3. Uses mock data for analytics
- **SECURITY ISSUE:** Uses `Math.random()` for analytics - not real data!

---

## 3. Authentication & Security Analysis

### 3.1 Public Routes (No Auth Required)
- `/api/v1/auth/signup`
- `/api/v1/auth/login`
- `/api/v1/auth/refresh`
- `/api/v1/health`
- `/api/v1/migrate` (requires secret header)

### 3.2 Middleware Protection
**File:** `src/middleware.ts`

The middleware correctly:
- Verifies JWT for protected routes
- Allows public routes without auth
- Returns 401 for missing/invalid tokens

**Issues identified:**
- JWT verification only checks signature/expiry - no revocation list
- `verifyToken` returns `null` on error without distinction
- No token refresh mechanism integrated into middleware

### 3.3 Endpoint-Level Auth Verification
**Status:** CORRECT

All protected endpoints:
1. Call `getUserFromRequest(request)` from `src/lib/jwt.ts`
2. Return `unauthorizedResponse()` if `!userPayload`
3. Use `userPayload.userId` for database queries

### 3.4 JWT Implementation
**File:** `src/lib/jwt.ts`
- Algorithm: HS256
- Expiration: 7 days
- Secret: From `JWT_SECRET` env var
- Correctly implements token signing and verification

---

## 4. Validation Analysis

### 4.1 Zod Schema Usage

| Endpoint Category | Zod Validation | Coverage |
|------------------|---------------|----------|
| Auth | Yes | Signup, login, refresh |
| Workspaces | Partial | Create has validation |
| Startups | Yes | Full schema |
| Campaigns | Yes | Full schema |
| Content | Yes | Full schema |
| Tasks | Yes | Full schema |
| Studio | Yes | Prompt, enhance |
| Trends/Velocity | Yes | POST endpoint |

### 4.2 Validation Gaps
- `GET /api/v1/startups` - No query param validation
- `GET /api/v1/campaigns` - No query param validation
- `GET /api/v1/content` - No query param validation
- No pagination validation (page, limit, offset)

### 4.3 Input Sanitization
- Zod schemas prevent invalid data types
- String content not sanitized (XSS potential in stored content)
- No SQL injection protection beyond Supabase parameterization

---

## 5. Error Handling Analysis

### 5.1 Consistent Response Format
**File:** `src/lib/api-response.ts`

All endpoints use standardized responses:
```typescript
successResponse(data, message)      // 200
createdResponse(data, message)       // 201
errorResponse(msg, error, status)    // 400-500
unauthorizedResponse()              // 401
forbiddenResponse()                  // 403
notFoundResponse()                   // 404
serverErrorResponse()                // 500
```

### 5.2 Error Handling Coverage
All endpoints have proper try/catch blocks with console.error logging and graceful responses.

### 5.3 Issues
- Error messages may leak internal details (database errors)
- No structured error logging (just console.error)
- No error tracking integration (Sentry, etc.)

---

## 6. Database Query Analysis

### 6.1 Tables Accessed

| Table | Operations | Indexes Used |
|-------|------------|--------------|
| users | SELECT, INSERT | idx_users_email |
| workspaces | SELECT, INSERT, UPDATE | idx_workspaces_user_id |
| startups | SELECT, INSERT, UPDATE | idx_startups_workspace_id |
| campaigns | SELECT, INSERT, UPDATE | idx_campaigns_startup_id |
| content | SELECT, INSERT, UPDATE | idx_content_campaign_status |
| tasks | SELECT, INSERT, UPDATE | idx_tasks_campaign_status |
| analytics | SELECT, INSERT | idx_analytics_content_recorded |
| memory | SELECT, INSERT, UPDATE | idx_memory_workspace_category |
| integrations | SELECT, INSERT, UPDATE | idx_integrations_workspace_provider |
| global_trend_nodes | SELECT | - |
| content_velocity_tracking | SELECT, UPSERT | - |

### 6.2 N+1 Query Issues

1. **`GET /api/v1/analytics/startup/[startup_id]`**
   - Fetches campaigns list, then queries analytics for all content
   - If campaigns list is large, could be N+1

2. **`GET /api/v1/campaigns/[id]`**
   - Fetches campaign with nested startup/workspace
   - Then separately queries tasks
   - Then separately queries content
   - **3 sequential queries instead of JOIN**

3. **`GET /api/v1/content/[id]`**
   - Fetches content with nested relations
   - Then separately queries analytics
   - **2 sequential queries**

### 6.3 Soft Deletes
- All delete operations use soft delete (`deleted_at`)
- Queries filter `WHERE deleted_at IS NULL`

---

## 7. External Service Integration

### 7.1 AI Provider (OpenRouter)
**File:** `src/lib/ai/adapters/openrouter.ts`

| Feature | Status | Implementation |
|---------|--------|---------------|
| Provider Registration | Yes | Singleton pattern |
| Generate (non-streaming) | Yes | Via OpenRouter API |
| Stream Response | Yes | AsyncIterable implementation |
| Config Validation | Yes | Checks API key presence |
| Retry Logic | Yes | 3 retries with exponential backoff |
| Circuit Breaker | Yes | Via provider-health.ts |

### 7.2 Rate Limiting
**File:** `src/lib/rate-limit.ts`

| Config | Auth | Limit |
|--------|------|-------|
| auth | Login | 5/min |
| authSignup | Signup | 3/hour |
| authRefresh | Refresh | 10/min |

**Issues:**
- In-memory store (lost on restart)
- Not distributed (multiple instances = separate limits)
- No rate limiting on most API endpoints

---

## 8. Timeout & Retry Handling

### 8.1 Timeouts

| Component | Timeout | Status |
|-----------|---------|--------|
| Studio Prompt | 60s | Explicit |
| AI Provider | 60s default | Configurable |
| Database | Supabase default | Not configured |
| HTTP Client | Varies | Not explicit |

### 8.2 Retry Logic
- `withRetry()` function implemented
- Exponential backoff with jitter
- Configurable max retries (default 3)
- Retryable error detection

---

## 9. Rate Limiting Analysis

### 9.1 Current Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 5 | 1 minute |
| POST /auth/signup | 3 | 1 hour |
| POST /auth/refresh | 10 | 1 minute |

### 9.2 Missing Rate Limits

**CRITICAL:** Most endpoints have NO rate limiting:
- Content generation endpoints
- Analytics endpoints
- Data retrieval endpoints

This makes the API vulnerable to:
- Resource exhaustion
- Brute force attacks on other endpoints
- DoS attacks

---

## 10. Frontend → Backend Call Mapping

### 10.1 Login Page (`/auth/login`)
```typescript
POST /api/v1/auth/login → Creates session
```

### 10.2 Signup Page (`/auth/signup`)
```typescript
POST /api/v1/auth/signup → Creates account
```

### 10.3 Dashboard (`/dashboard`)
```typescript
GET /api/v1/auth/me → User info (sidebar)
(No other API calls - static content)
```

### 10.4 Studio (`/dashboard/studio`)
```typescript
POST /api/v1/studio/prompt → Content generation
```

### 10.5 Analytics (`/dashboard/analytics`)
```typescript
GET /api/v1/trends/velocity → Velocity data
```

### 10.6 Missing Frontend API Calls

**Dashboard, Planner, Plan pages** have no API calls implemented:
- Dashboard shows static "0" values
- Planner shows hardcoded sample data
- Plan page has no data fetching

---

## 11. Dead/Unreferenced Routes

### 11.1 Unused Endpoints

| Route | Usage |
|-------|-------|
| GET /api/v1/startups | No frontend calls |
| POST /api/v1/startups | No frontend calls |
| GET /api/v1/startups/[id] | No frontend calls |
| POST /api/v1/campaigns | No frontend calls |
| GET /api/v1/campaigns/[id] | No frontend calls |
| POST /api/v1/content | No frontend calls |
| GET /api/v1/content/[id] | No frontend calls |
| POST /api/v1/tasks | No frontend calls |
| GET /api/v1/tasks/[id] | No frontend calls |
| GET /api/v1/ai/provider | No frontend calls |
| GET /api/v1/analytics/startup/[id] | No frontend calls |
| POST /api/v1/analytics/sync | No frontend calls |
| GET /api/v1/trends/global | No frontend calls |
| GET /api/v1/subscription/check | No frontend calls |
| POST /api/v1/subscription/usage | No frontend calls |
| GET /api/v1/notifications | No frontend calls |
| GET /api/v1/memory/* | No frontend calls |
| POST /api/v1/memory/* | No frontend calls |
| GET /api/v1/integrations/[id] | No frontend calls |
| POST /api/v1/integrations/[id] | No frontend calls |

### 11.2 Summary
- **Total Endpoints:** 30+
- **Frontend Used:** ~5 endpoints
- **Dead Code Ratio:** ~75%

---

## 12. Missing Endpoints

### 12.1 UI Expected but Not Implemented

| Expected Feature | Status |
|------------------|--------|
| Get user's startups list | EXISTS but unused |
| Get user's campaigns list | EXISTS but unused |
| Get campaign content list | EXISTS but unused |
| Get content list for dashboard | MISSING |
| Dashboard stats aggregation | MISSING |
| Content with stats for dashboard | MISSING |

### 12.2 Dashboard Stats Needed

The dashboard shows these static values but needs real data:
```
- Content Created: 0
- Scheduled: 0
- Published: 0
- Engagement: 0%
```

**Required endpoints (MISSING):**
- `GET /api/v1/dashboard/stats` - Aggregated stats
- `GET /api/v1/content?status=published` - Published content count
- `GET /api/v1/content?status=scheduled` - Scheduled content count

---

## 13. Security Issues

### 13.1 Critical Issues

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| SEC-01 | **Mock analytics data** | `analytics/sync/route.ts` | Fake metrics reported as real |
| SEC-02 | **Hardcoded usage limits** | `subscription/check/route.ts` | No actual tracking |
| SEC-03 | **No API rate limiting** | Most endpoints | DoS vulnerability |
| SEC-04 | **In-memory rate limit store** | `rate-limit.ts` | Lost on restart, not distributed |

### 13.2 High Severity Issues

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| SEC-05 | **Permissive RLS policies** | `migrate/route.ts` | `FOR ALL USING (true)` allows any access |
| SEC-06 | **No password strength** | `auth/signup/route.ts` | Only checks length >= 8 |
| SEC-07 | **No email verification** | `auth/signup/route.ts` | Unverified accounts |
| SEC-08 | **Token refresh accepts expired** | `auth/refresh/route.ts` | Could allow token reuse |

### 13.3 Medium Severity Issues

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| SEC-09 | **No XSS sanitization** | Content endpoints | Stored XSS possible |
| SEC-10 | **No request body size limit** | All endpoints | Large payload DoS |
| SEC-11 | **No CORS configuration** | middleware.ts | Undefined behavior |
| SEC-12 | **Error details in responses** | All endpoints | Information disclosure |

### 13.4 Low Severity Issues

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| SEC-13 | **No audit logging** | All endpoints | No activity tracking |
| SEC-14 | **No structured logging** | All endpoints | Hard to analyze |
| SEC-15 | **JWT_SECRET throws on missing** | `jwt.ts` | Crash on startup without env |

---

## 14. Recommendations

### 14.1 Immediate Actions

1. **Remove mock analytics** - SEC-01
   - Replace `Math.random()` with real API calls
   - Or remove sync endpoint entirely

2. **Add rate limiting to all API endpoints** - SEC-03
   - Implement Redis-based rate limiting
   - Add limits to content generation endpoints

3. **Fix RLS policies** - SEC-05
   ```sql
   -- Replace "FOR ALL USING (true)" with proper user-based policies
   CREATE POLICY "Users can CRUD own workspaces" ON workspaces 
   FOR ALL USING (auth.uid() = user_id);
   ```

### 14.2 Short-term Improvements

4. **Implement real subscription tracking**
   - Store usage in database
   - Update `/subscription/check` to read from DB

5. **Add pagination** to list endpoints
   ```typescript
   // GET /api/v1/content?page=1&limit=20
   ```

6. **Implement dashboard stats endpoint**
   ```typescript
   GET /api/v1/dashboard/stats
   // Returns aggregated metrics for dashboard
   ```

7. **Add password strength requirements**
   ```typescript
   password: z.string()
     .min(8)
     .regex(/[A-Z]/)  // Uppercase
     .regex(/[a-z]/)  // Lowercase
     .regex(/[0-9]/)  // Number
     .regex(/[^A-Za-z0-9]/)  // Special
   ```

### 14.3 Long-term Improvements

8. **Implement token revocation list**
9. **Add comprehensive audit logging**
10. **Set up Sentry/error tracking**
11. **Add request validation middleware**
12. **Implement API versioning**
13. **Add WebSocket support for real-time updates**

---

## 15. Summary Statistics

| Metric | Value |
|--------|-------|
| Total Endpoints | 30 |
| Protected Endpoints | 25 |
| Public Endpoints | 5 |
| Endpoints with Validation | 18 |
| Endpoints with Rate Limiting | 3 |
| Endpoints with Proper Auth | 25 |
| Frontend Integration | ~5 (17%) |
| Critical Security Issues | 4 |
| High Security Issues | 4 |
| Medium Security Issues | 4 |
| N+1 Query Issues | 3 |

---

## Appendix A: File Locations

```
src/app/api/v1/
├── ai/provider/route.ts
├── analytics/
│   ├── startup/[startup_id]/route.ts
│   └── sync/route.ts
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── me/route.ts
│   ├── refresh/route.ts
│   └── signup/route.ts
├── campaigns/
│   ├── [id]/route.ts
│   └── route.ts
├── content/
│   ├── [id]/route.ts
│   └── route.ts
├── health/route.ts
├── integrations/[id]/route.ts
├── memory/
│   ├── [workspace_id]/[id]/route.ts
│   └── [workspace_id]/route.ts
├── migrate/route.ts
├── notifications/route.ts
├── startups/
│   ├── [id]/route.ts
│   └── route.ts
├── studio/
│   ├── enhance/route.ts
│   └── prompt/route.ts
├── subscription/
│   ├── check/route.ts
│   └── usage/route.ts
├── tasks/
│   ├── [id]/route.ts
│   └── route.ts
├── trends/
│   ├── global/route.ts
│   └── velocity/route.ts
└── workspaces/
    ├── [id]/route.ts
    └── route.ts
```

---

*End of API Audit Report*
