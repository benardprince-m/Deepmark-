# DEEPMARK — FORENSIC AUDIT CHECKLIST

## Phase 0: Audit Discovery Tasks

### DOMAIN 01: ARCHITECTURE
- [ ] Inspect Next.js version and configuration
- [ ] Map application directory structure
- [ ] Identify server/client boundaries
- [ ] Document runtime requirements
- **Evidence:** package.json version, next.config.js settings
- **Verification:** Build succeeds, dev server starts

### DOMAIN 02: PRESENTATION
- [ ] List all page components
- [ ] Map navigation/routes
- [ ] Identify component hierarchy
- [ ] Check responsive design implementation
- **Evidence:** src/app/**/page.tsx files
- **Verification:** Pages render without errors

### DOMAIN 03: APPLICATION/API
- [ ] List all API routes
- [ ] Map endpoint → handler
- [ ] Identify request/response contracts
- [ ] Check validation logic
- **Evidence:** src/app/api/**/route.ts
- **Verification:** Endpoints return expected responses

### DOMAIN 04: IDENTITY
- [ ] Verify signup flow
- [ ] Verify login flow
- [ ] Check JWT generation
- [ ] Verify session persistence
- [ ] Check middleware protection
- **Evidence:** src/lib/jwt.ts, middleware.ts, auth API routes
- **Verification:** Unauthenticated requests blocked

### DOMAIN 05: AUTHORIZATION
- [ ] Verify RLS policies on all tables
- [ ] Check workspace isolation
- [ ] Verify user cannot access other workspaces
- [ ] Check API-level authorization
- **Evidence:** supabase/migrations/**/RLS policies
- **Verification:** Cross-workspace access denied

### DOMAIN 06: DOMAIN LOGIC
- [ ] Identify business rules
- [ ] Check validation in business logic layer
- [ ] Verify edge case handling
- **Evidence:** src/lib/** business logic files
- **Verification:** Business rules enforced correctly

### DOMAIN 07: AI ORCHESTRATION
- [ ] Verify provider configuration
- [ ] Check model routing logic
- [ ] Inspect prompt construction
- [ ] Check system prompts
- [ ] Verify context assembly
- [ ] Check memory retrieval integration
- [ ] Verify token accounting
- [ ] Check streaming implementation
- [ ] Verify timeout handling
- [ ] Check retry logic
- [ ] Verify fallback behavior
- **Evidence:** src/lib/ai/** files
- **Verification:** AI generation works end-to-end

### DOMAIN 08: DATA ACCESS
- [ ] Verify Supabase client configuration
- [ ] Check query patterns
- [ ] Identify N+1 issues
- [ ] Check connection pooling
- **Evidence:** src/lib/supabase.ts
- **Verification:** Queries execute efficiently

### DOMAIN 09: INTEGRATIONS
- [ ] List all external service integrations
- [ ] Verify OAuth/API authentication
- [ ] Check credential storage
- [ ] Verify connection state
- [ ] Check token refresh
- **Evidence:** src/lib/** integration files
- **Verification:** Integrations authenticate successfully

### DOMAIN 10: ASYNC JOBS
- [ ] Identify background job infrastructure
- [ ] Check job queue implementation
- [ ] Verify job retry logic
- **Evidence:** Background job files
- **Verification:** Jobs execute and complete

### DOMAIN 11: CACHE
- [ ] Identify caching layer
- [ ] Check cache invalidation
- [ ] Verify cache hits/misses
- **Evidence:** src/lib/cache.ts or equivalent
- **Verification:** Cached data served correctly

### DOMAIN 12: PERSISTENCE
- [ ] Verify all data stored correctly
- [ ] Check database migrations applied
- [ ] Verify data integrity
- **Evidence:** supabase/migrations/**, database state
- **Verification:** Data persists across restarts

### DOMAIN 13: OBSERVABILITY
- [ ] Verify logging implementation
- [ ] Check error tracking (Sentry)
- [ ] Verify metrics collection
- [ ] Check audit logging
- **Evidence:** src/lib/observability/**, src/lib/logger.ts
- **Verification:** Logs appear in monitoring

### DOMAIN 14: SECURITY
- [ ] Check for exposed secrets
- [ ] Verify HTTPS enforced
- [ ] Check SQL injection prevention
- [ ] Verify XSS protection
- [ ] Check CSRF tokens
- [ ] Verify rate limiting
- [ ] Check input validation
- **Evidence:** API routes, middleware, env handling
- **Verification:** Security tests pass

### DOMAIN 15: INFRASTRUCTURE
- [ ] Verify Railway configuration
- [ ] Check build configuration
- [ ] Verify environment setup
- **Evidence:** railway.json, next.config.js, Dockerfile
- **Verification:** Deployment succeeds

### DOMAIN 16: ACCESSIBILITY
- [ ] Check semantic HTML
- [ ] Verify keyboard navigation
- [ ] Check focus states
- [ ] Verify ARIA labels
- [ ] Check color contrast
- [ ] Verify reduced motion support
- **Evidence:** Component code
- **Verification:** a11y audit passes

### DOMAIN 17: LEGAL/COMPLIANCE
- [ ] Verify Terms of Service exists
- [ ] Check Privacy Policy exists
- [ ] Verify cookie controls
- [ ] Check data deletion flow
- [ ] Verify data export capability
- **Evidence:** Legal pages, user settings
- **Verification:** Legal pages accessible

### DOMAIN 18: BILLING/ENTITLEMENTS
- [ ] Verify pricing configuration
- [ ] Check subscription management
- [ ] Verify usage limits enforced
- [ ] Check paywall implementation
- [ ] Verify Stripe integration
- **Evidence:** Subscription API routes, UI components
- **Verification:** Paywalls enforced correctly

### DOMAIN 19: MEMORY
- [ ] Verify memory storage schema
- [ ] Check memory creation flow
- [ ] Verify retrieval logic
- [ ] Check ranking/scoring
- [ ] Verify workspace isolation
- **Evidence:** Memory API routes, src/lib/memory/**
- **Verification:** Memory persists and retrieves correctly

### DOMAIN 20: RESEARCH ENGINE
- [ ] Verify research capability exists
- [ ] Check data sources
- [ ] Verify result storage
- [ ] Check workspace association
- **Evidence:** Research API routes
- **Verification:** Research completes successfully

### DOMAIN 21: UX CONSISTENCY
- [ ] Check design system consistency
- [ ] Verify component patterns
- [ ] Check color usage
- [ ] Verify typography consistency
- **Evidence:** Component files, tailwind config
- **Verification:** UI appears consistent

### DOMAIN 22: PERFORMANCE
- [ ] Check bundle size
- [ ] Verify code splitting
- [ ] Check image optimization
- [ ] Verify API response times
- [ ] Check database query efficiency
- **Evidence:** Build output, network tab
- **Verification:** Performance benchmarks met

### DOMAIN 23: RELIABILITY
- [ ] Verify timeout handling
- [ ] Check retry logic
- [ ] Verify error states
- [ ] Check loading states
- [ ] Verify graceful degradation
- **Evidence:** API routes, components
- **Verification:** Failures handled gracefully

### DOMAIN 24: TESTING
- [ ] List test files
- [ ] Check test coverage
- [ ] Verify CI/CD tests
- **Evidence:** **/*.test.ts, *.spec.ts files
- **Verification:** Tests pass

### DOMAIN 25: DOCUMENTATION
- [ ] Verify README exists
- [ ] Check API documentation
- [ ] Verify deployment documentation
- **Evidence:** README.md, docs/**
- **Verification:** Documentation accessible

---

## Critical Verification Traces Required

### Authentication Trace
UI → Button click → API route → JWT verification → Database query → Response

### Content Generation Trace
UI → Generate button → API route → JWT verification → Prompt construction → AI provider → Response → UI update

### Memory Trace
UI → Save memory → API route → JWT verification → Database insert → Confirmation

### Subscription Trace
UI → Upgrade button → Stripe checkout → Webhook → Database update → UI update

---

## Status Definitions

- **IMPLEMENTED:** Verified working implementation exists
- **PARTIAL:** Implementation exists but incomplete
- **MISSING:** Required capability has no implementation
- **BROKEN:** Implementation fails or misbehaves
- **UNVERIFIED:** Claimed but insufficient evidence
