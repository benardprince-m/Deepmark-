# DeepMark System Inventory

> Generated: 2026-08-13
> Version: 0.1.0

---

## Application Architecture Overview

**DeepMark** is a SaaS marketing platform that helps startups create, manage, and optimize content marketing campaigns across social media platforms (Twitter/X, LinkedIn, TikTok). The system features AI-powered content generation with automatic routing to optimal AI providers, comprehensive analytics tracking, and subscription-based access control.

---

## Framework & Runtime

| Component | Version | Notes |
|-----------|---------|-------|
| **Next.js** | 16.2.12 | App Router, TypeScript |
| **React** | 19.2.4 | Concurrent Features |
| **React DOM** | 19.2.4 | Server Components |
| **TypeScript** | ^5 | Strict mode enabled |
| **Node.js** | 20+ | Via @types/node |
| **Runtime** | Edge/Node | Via Next.js |

### Build & Tooling
- **Bundler**: Next.js built-in (Turbopack compatible)
- **Linter**: ESLint 9
- **CSS**: Tailwind CSS 4 + @tailwindcss/postcss
- **Package Manager**: npm

---

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **@sentry/nextjs** | ^10.69.0 | Error tracking & performance monitoring |
| **@supabase/supabase-js** | ^2.45.0 | PostgreSQL client with RLS support |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **class-variance-authority** | ^0.7.0 | Component variant system |
| **clsx** | ^2.1.1 | Conditional class names |
| **jose** | ^5.6.3 | JWT signing/verification (HS256) |
| **lucide-react** | ^0.408.0 | Icon library |
| **next** | 16.2.12 | React framework |
| **react** | 19.2.4 | UI library |
| **react-dom** | 19.2.4 | React DOM rendering |
| **react-globe.gl** | ^2.38.0 | 3D globe visualization for trends |
| **tailwind-merge** | ^2.4.0 | Tailwind class merging |
| **uuid** | ^10.0.0 | UUID generation |
| **zod** | ^3.23.8 | Schema validation |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **@tailwindcss/postcss** | ^4 | Tailwind CSS v4 PostCSS plugin |
| **@types/bcryptjs** | ^2.4.6 | bcrypt TypeScript types |
| **@types/node** | ^20 | Node.js type definitions |
| **@types/react** | ^19 | React type definitions |
| **@types/react-dom** | ^19 | React DOM types |
| **@types/uuid** | ^10.0.0 | UUID type definitions |
| **eslint** | ^9 | JavaScript/TypeScript linter |
| **eslint-config-next** | 16.2.12 | Next.js ESLint config |
| **pg** | ^8.22.0 | PostgreSQL client |
| **supabase** | ^2.111.0 | Supabase CLI tools |
| **tailwindcss** | ^4 | Utility-first CSS |
| **typescript** | ^5 | TypeScript compiler |

---

## Configuration Files

### next.config.ts
Minimal configuration - no custom images, redirects, or headers configured.

### tsconfig.json
- Target: ES2017
- Path Alias: @/* maps to ./src/*
- Strict mode: enabled

### postcss.config.mjs
- Plugin: @tailwindcss/postcss
- CSS Framework: Tailwind CSS v4

### railway.json
- Builder: NIXPACKS
- Replicas: 1
- Restart Policy: ON_FAILURE, max 10 retries

### .env.example
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET
- NEXT_PUBLIC_APP_NAME

---

## Database Configuration

### Provider
| Component | Value |
|-----------|-------|
| **Database Provider** | Supabase (PostgreSQL) |
| **Supabase URL** | NEXT_PUBLIC_SUPABASE_URL (env var) |
| **Anon Key** | NEXT_PUBLIC_SUPABASE_ANON_KEY (env var, client-safe) |
| **Service Role Key** | SUPABASE_SERVICE_ROLE_KEY (env var, server-only) |

### Database Schema (14 tables)

#### Core Tables
| Table | Purpose |
|-------|---------|
| **users** | User accounts with subscription fields |
| **workspaces** | Multi-tenant workspaces |
| **startups** | Startup profiles |
| **campaigns** | Marketing campaigns |
| **content** | Generated content |
| **tasks** | Campaign tasks |
| **integrations** | Social platform integrations |

#### Analytics & Logging Tables
| Table | Purpose |
|-------|---------|
| **analytics** | Content metrics |
| **memory** | AI context memory |
| **notifications** | User notifications |
| **audit_logs** | Security audit trail |
| **provider_usage_logs** | AI cost tracking |
| **error_logs** | Error tracking |
| **usage_logs** | Usage metering |
| **workspace_settings** | Per-workspace configuration |

#### Global Trend Data
| Table | Purpose |
|-------|---------|
| **global_trend_nodes** | Regional trend data |
| **content_velocity_tracking** | Content performance metrics |

### Row Level Security (RLS)
All tables have RLS enabled with policies enforcing workspace-based access.

---

## Authentication

### Provider
| Component | Value |
|-----------|-------|
| **Auth Type** | JWT (HS256) |
| **Token Library** | jose |
| **Token Expiry** | 7 days |
| **Password Hashing** | bcrypt (cost factor 12) |

### Auth Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/v1/auth/signup | POST | User registration |
| /api/v1/auth/login | POST | User login |
| /api/v1/auth/logout | POST | User logout |
| /api/v1/auth/refresh | POST | Token refresh |
| /api/v1/auth/me | GET | Get current user |

### Middleware
- Public routes: /api/v1/auth/*, /api/v1/health
- Protected routes: All /api/v1/* (except public)
- JWT verification on every protected request

---

## AI Providers

### Primary Provider
| Provider | Status | Default Model |
|----------|--------|--------------|
| **OpenRouter** | Configured | google/gemma-4-26b-a4b-it:free |

### Provider Configuration
- **API Key**: OPENROUTER_API_KEY (env var)
- **Base URL**: https://openrouter.ai/api/v1
- **Fallback Model**: google/gemma-4-26b-a4b-it:free (free tier)

### AI Features
| Feature | Implementation |
|---------|----------------|
| Content Generation | /api/v1/studio/prompt |
| Content Enhancement | /api/v1/studio/enhance |
| Provider Routing | src/lib/ai/provider-router.ts |
| Health Monitoring | src/lib/ai/provider-health.ts |
| Circuit Breaker | Implemented per provider |
| Retry Logic | Exponential backoff with jitter |
| Memory Engine | src/lib/ai/memory-engine/client.ts |
| Quota Management | src/lib/ai/quota-manager.ts |

### Token Pricing (per 1M tokens)
| Provider | Input | Output |
|----------|-------|--------|
| openrouter | $0.50 | $1.50 |
| openai | $2.50 | $10.00 |
| anthropic | $3.00 | $15.00 |
| google | $1.25 | $5.00 |
| ollama | $0.00 | $0.00 |

---

## External Services

| Service | Purpose |
|---------|---------|
| **Supabase** | Database, Auth |
| **OpenRouter** | AI/LLM |
| **Sentry** | Error Tracking (optional) |
| **Railway** | Deployment |
| **Stripe** | Payments (planned) |

---

## API Routes

### Total: 36 API routes

#### Authentication (5 routes)
- /api/v1/auth/signup, /api/v1/auth/login, /api/v1/auth/logout, /api/v1/auth/refresh, /api/v1/auth/me

#### Resources - CRUD Operations (14 routes)
- /api/v1/workspaces (+ /[id])
- /api/v1/startups (+ /[id])
- /api/v1/campaigns (+ /[id])
- /api/v1/content (+ /[id])
- /api/v1/tasks (+ /[id])

#### AI Studio (3 routes)
- /api/v1/studio/prompt, /api/v1/studio/enhance, /api/v1/ai/provider

#### Analytics & Trends (4 routes)
- /api/v1/analytics/startup/[id], /api/v1/analytics/sync, /api/v1/trends/global, /api/v1/trends/velocity

#### Integrations (3 routes)
- /api/v1/integrations/[ws], /api/v1/integrations/[id]

#### Memory (2 routes)
- /api/v1/memory/[workspace_id] (+ /[id])

#### Subscription (2 routes)
- /api/v1/subscription/check, /api/v1/subscription/usage

#### System (3 routes)
- /api/v1/health, /api/v1/notifications, /api/v1/migrate

---

## Component Structure

### Total: 20 components

#### Layout Components (2)
- Header: src/components/layout/header.tsx
- Sidebar: src/components/layout/sidebar.tsx

#### UI Components (8)
- Button (4 variants), Card (4 sub-components), Input, Textarea, Select, Modal, Skeleton, Toast

#### AI Components (2)
- ThinkingPanel: src/components/ai/ThinkingPanel/
- ThinkingAnimation: src/components/thinking/ThinkingAnimation.tsx

#### Visualization (1)
- MarketingGlobe: src/components/globe/MarketingGlobe.tsx (3D globe)

---

## Library Modules

### Core Libraries
| Module | Path | Purpose |
|--------|------|---------|
| supabase | src/lib/supabase.ts | Supabase client initialization |
| jwt | src/lib/jwt.ts | JWT sign/verify operations |
| auth | src/lib/auth.ts | Client-side auth utilities |
| utils | src/lib/utils.ts | cn() utility for class merging |
| rate-limit | src/lib/rate-limit.ts | In-memory rate limiter |
| subscription | src/lib/subscription.ts | Subscription plan definitions |
| api-response | src/lib/api-response.ts | Standardized API responses |
| api | src/lib/api.ts | Client-side API helper |

### AI Modules (src/lib/ai/)
types.ts, interface.ts, registry.ts, provider-router.ts, provider-health.ts, quota-manager.ts, retry.ts, memory-quality.ts, production.ts

#### AI Adapters (src/lib/ai/adapters/)
base.ts, openrouter.ts

#### AI Memory Engine (src/lib/ai/memory-engine/)
client.ts, types.ts

### Observability (src/lib/observability/)
index.ts, sentry.ts, usage.ts, audit-logger.ts

---

## Migrations

### Supabase Migrations (6 files)

| Migration | Description |
|-----------|-------------|
| 001_initial_schema.sql | Core schema, 10 tables, RLS policies |
| 002_add_notifications.sql | Notifications table |
| 003_production_observability.sql | Audit logs, usage logs, error logs |
| 004_subscription_system.sql | Subscription tiers, usage limits |
| 005_retention_engines.sql | Global trend nodes, velocity tracking |
| MANUAL_MIGRATION.sql | Additional manual changes |

---

## Type Definitions

### API Types (src/types/api.ts)
ApiResponse<T>, ApiError, ApiResult<T>, AuthTokens, PaginatedResponse<T>

### Database Types (src/types/database.ts)
User, Workspace, Startup, Integration, Campaign, Content, Task, Analytics, Memory

---

## Subscription Plans

| Tier | Price | Workspaces | Startups | Content Gen | AI Calls |
|------|-------|------------|----------|-------------|----------|
| Free | $0 | 1 | 1 | 10/mo | 50/mo |
| Starter | $29/mo | 3 | 5 | 100/mo | 500/mo |
| Pro | $79/mo | 10 | Unlimited | Unlimited | Unlimited |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Unlimited |

---

## Global Trend Nodes

Seed data: Nairobi (Fintech, 94), London (B2B Tech, 88), San Francisco (AI, 96), Tokyo (E-Commerce, 72)

---

## Deployment Configuration

### Platform
- Provider: Railway
- Builder: Nixpacks
- Replicas: 1
- Restart Policy: On failure, max 10 retries

### Environment Variables Required
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, OPENROUTER_API_KEY, DEFAULT_MODEL (optional), SENTRY_DSN (optional)

---

## File Statistics

| Metric | Count |
|--------|-------|
| Total Source Files | 86 |
| API Routes | 36 |
| Components | 20 |
| Library Files | 30+ |
| Database Migrations | 6 |
| Database Tables | 14 |

---

## Import Dependencies (Architecture Tracing)

### Client-Side Imports
src/components/* -> @/lib/utils, @/components/ui/*
src/lib/auth.ts -> localStorage (token persistence)

### Server-Side Imports
src/lib/supabase.ts -> @supabase/supabase-js
src/lib/jwt.ts -> jose
src/lib/auth.ts -> ./jwt
src/app/api/*/route.ts -> @/lib/supabase, @/lib/jwt, @/lib/api-response, @/lib/rate-limit, bcryptjs, uuid, zod

### AI Module Imports
src/lib/ai/* -> ./types, ./interface, ./provider-health, ../observability
src/lib/ai/adapters/openrouter.ts -> ./base

### Observability Imports
src/lib/observability/* -> @sentry/nextjs, @supabase/supabase-js

---

*Document generated by system inventory analysis*
