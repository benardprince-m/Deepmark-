# DeepMark - Blockers & Issues Log

## Blocker 1: Supabase Tables Not Initialized
**Date:** 2026-08-04
**Severity:** 🔴 HIGH - Blocks many Day 1-2 tasks
**Impact:** Cannot verify auth, storage, or database features
**Required:** 
- `SUPABASE_SERVICE_ROLE_KEY` 
- `JWT_SECRET`

**Workaround:** 
- Tasks 1.1 (brand fix), 1.6 (health check basic) can proceed
- Cannot test auth endpoints, RLS, or storage until resolved

**Resolution:** User must provide Supabase service role key and JWT secret
