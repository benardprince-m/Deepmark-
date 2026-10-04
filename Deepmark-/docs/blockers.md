# DeepMark — Current blockers and verification notes

This file records **repository-level** blockers only. It does not contain project URLs, API keys, tokens, or instructions to run untracked SQL against a live database.

## Current blockers

### Vercel build configuration

The application compiles and type-checks, but Next.js route collection imports server modules that require `JWT_SECRET`. Vercel must define a strong production `JWT_SECRET` before `npm run build` can complete. Configure it in the Vercel project environment for the relevant deployment targets; never commit the value.

The production environment also needs the variables in `.env.example`, including Supabase, Stripe, and `NEXT_PUBLIC_APP_URL`. AI generation is intentionally unconfigured in the current deployment.

### External-service verification

The repository contains Supabase migrations 001–009, Stripe handlers, and AI provider adapters. Source presence does not prove that the live Supabase project has the migrations, policies, grants, Stripe webhooks, or provider keys configured. Verify those separately in the deployment environment before calling the product production-ready.

## Resolved repository blockers

- The unsafe legacy migration route was removed from `src/app/api/v1/migrate/`.
- The stale root mock dashboard was replaced by the DeepMark landing experience.
- The old Pong thinking animation was replaced by the mascot/orb motion system.
- Starter public SVG assets and confirmed orphaned UI components were removed during the repository cleanup pass.

## Safe verification procedure

1. Confirm the deployment environment has all required variables from `.env.example`.
2. Run `npm ci`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` on the commit being deployed.
3. Confirm the Supabase project reports migrations 001–009 as applied and review RLS policies/grants for the current schema.
4. Confirm Stripe webhook signing and return routes with test-mode events.
5. Treat AI generation as unavailable until a provider is deliberately selected and configured.

If a new blocker is found, record the date, exact environment, observed error, and verification command here without adding secrets.
