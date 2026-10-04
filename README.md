# DeepMark

DeepMark is an AI-powered startup marketing and growth intelligence system, built for early-stage founders. It is not a content generator bolted onto a scheduler. It is a system designed to understand a specific startup — its positioning, audience, market, and what actually works — and to become a more capable operating partner over time.

The final slogan is deliberately not locked. Do not invent or hard-code one anywhere.

## What DeepMark is

- A research-informed strategy system for startup marketing
- A persistent, workspace-isolated memory of each startup (the Memory Brain)
- A trend intelligence surface (the Globe) backed by real data
- An orchestration system coordinating research, memory, reasoning, generation, review, scheduling, and analytics
- A product that reveals its activity through a "thinking" surface with the signature DeepMark `//` animation

## What DeepMark is not

- A generic ChatGPT wrapper
- A generic content writer
- A dashboard full of vanity metrics
- A social media scheduler with AI sprinkled on top
- A decorative AI interface
- A competitor-copying machine
- A black-box system with no useful user-facing context
- A product whose best intelligence is locked behind pricing
- An over-engineered infrastructure project with no product value

## Core intelligence engine

```
Validation -> Memory -> Research -> Strategy -> Generation -> Review
-> Scheduling -> Analytics -> Memory Update -> (next decision)
```

The loop is closed: performance data feeds memory, memory informs strategy, strategy informs generation.

## Moats

1. **Orchestration** — coordinating research, memory, reasoning, generation, tools, integrations, and feedback rather than treating an LLM call as the product.
2. **Understanding** — an increasingly detailed model of the startup, founder, positioning, audience, market, content history, and performance.
3. **Prompt Engine** — dynamically constructed, context-aware instructions rather than static prompts.
4. **Memory** — persistent startup-specific knowledge that compounds in value over time.
5. **Research** — DeepMark initially learns from evidence instead of pretending it already knows what will work.
6. **Feedback** — performance influences future strategy and memory.

## Beta-defining surfaces

Two surfaces are mandatory for beta — they are not "future someday" features:

- **Memory Brain** — an interactive memory graph with foundational nodes (existing before they are populated), dynamically generated nodes, relationships between concepts, selectable node -> zoom/focus -> memory-card drawer, workspace-isolated. No cross-workspace contamination, ever.
- **Globe** — an interactive intelligence globe for geographic trend discovery: region -> videos / sounds / campaigns / topics, backed by real trend data. A spinning Earth without intelligence behind it is not a feature.

The thinking surface with the Pong-inspired `//` animation (gravity/eased physics, stops at first token, glow intensifies with depth) is part of the locked experience.

## Design system (locked)

- Monochrome foundation: `#0D0D0D`, `#0A0A0A`, `#111111`; surfaces `#121212`, `#171717`; borders `#262626`
- Functional green `#22C55E`: success, positive deltas, successful state
- Functional red `#EF4444`: failure, destructive action, negative delta
- Blue `#3B82F6`: reserved for the memory/neural intelligence signal
- Zero purple. Zero emojis. Color is functional, never decorative chrome.
- Typography: Inter / Geist family — high density, tight hierarchy, editorial-technical feel
- Icons: Lucide. Restrained radius, subtle elevation, strong alignment.
- The double-slash `//` is the brand mark.
- Reference collages (1131-1134) are the visual north star; the currently deployed UI is not considered finished.

## Beta roadmap (locked, Phase 0-6)

0. **Stabilize** — deployment, routes, auth, sessions, RLS, authorization, DB integrity, API errors, production config, real analytics, remove fake/placeholder data. *(Currently active phase.)*
1. **Core Reliability** — generation reliability, timeouts, retries, provider failures, loading/error states, async execution, observability, logging, critical tests.
2. **Beta-Defining Intelligence Surfaces** — Memory Brain (vault, foundational + dynamic nodes, relationships, memory cards, graph, persistence, selection/focus) and Globe (3D, DeepMark treatment, location interaction, niche trend discovery, real trend data, content/campaign/sound signals).
3. **Experience Lock** — thinking surface, `//` animation, loading/empty/error states, navigation, memory and globe transitions, accessibility, responsive behavior, visual consistency.
4. **Connectivity** — only beta-required integrations.
5. **Commercial** — Stripe validation, pricing, entitlements, usage/session model, billing, legal, admin, support.
6. **Beta Gate** — Security, then Reliability/Performance, then UX/Accessibility, then a production smoke test (fresh user, auth, second-workspace isolation, generation, memory persistence, globe data). The Orchestrator makes the final decision based on evidence.

## Infrastructure stance (locked Oct 4, 2026)

The project is bootstrapped. Until there is revenue:

- No paid hosting platforms (Railway etc.) and no managed database services (Supabase Pro etc.) for now.
- Develop against environment variables and free sandboxes/tiers.
- Deployment and infrastructure decisions are deferred to Phase 5 (Commercial), not Phase 0.
- The codebase keeps the Supabase client architecture; the cost stance is about where things run, not about ripping out code.

## Non-negotiables

- Workspace isolation: every data query is workspace-scoped. No cross-workspace data leakage, ever.
- No `USING (true)` RLS bypass policies. The only intentional public-read policy is `global_trend_nodes` (for the Globe), documented in `supabase/migrations/006_fix_rls_bypass.sql`.
- Real data only: no fake analytics or placeholder numbers in production surfaces. (Known Phase 0 debt: hardcoded dashboard values in `src/app/page.tsx` — `$23,902` / `16,815` — must be replaced with real data before beta.)
- Model-agnostic AI layer.
- Evidence standard: every important engineering claim is classified **Observed** (directly confirmed), **Inferred** (strongly suggested, not directly confirmed), or **Unknown** (requires investigation). A green commit is not proof that a feature works.
- Never trust a document claiming "complete" — runtime evidence wins.

## Commit policy

One commit per completed, confirmed task or step — keeping related changes coupled within the same commit when they must ship together. Commit messages use conventional prefixes (`fix:`, `docs:`, `feat:`, `chore:`).

## Repository map

- The Next.js application lives in the nested `Deepmark-/` directory (i.e. `Deepmark-/Deepmark-/` from the repo root).
- Database migrations live in `Deepmark-/supabase/migrations/`.
- `main` is the only branch. Old experiment branches were deliberately deleted; do not resurrect them (notably the abandoned light-mode/green-`#28C76F` experiment).
- Known historical defect: an Aug 24-25 bulk-replace corrupted string literals. The migrate route URL was the confirmed instance; treat other strings touched by those commits with suspicion.

## System architecture — the 12 layers of DeepMark

1. **Frontend** — the Next.js App Router UI: the pages (Dashboard, Scheduler/Calendar, Studio, Globe, Chat, Memory, Settings) rendered in the locked design system.
2. **API** — the `/api/v1` routes: request validation, response envelopes, error handling. The only way in and out.
3. **Backend / execution engine** — server-side orchestration: task execution, async jobs, retries, scheduling.
4. **Auth & sessions** — signup, email verification, password reset, httpOnly cookies, JWT sessions.
5. **Database** — Postgres on the Supabase architecture: core tables, migrations in `supabase/migrations/`.
6. **Security & isolation** — RLS with workspace isolation (no `USING (true)`), secret/token handling, rate limits.
7. **Memory (Brain)** — the Memory Brain: memory engine, persistence, foundational + dynamic nodes, the memory graph.
8. **Intelligence & reasoning** — the orchestrator, prompt engine, AI reasoning layer, model-agnostic provider switching.
9. **Research & trends** — trend detection, Globe data, regional adoption, signal filtering.
10. **Content pipeline** — generation, review, sanitizing, scheduling, publishing.
11. **Analytics & feedback** — real analytics only, engagement mapping, weekly optimization, the learning loop back into memory.
12. **Integrations** — social connects, plugins, MCP. Post-launch scope (Phase 4+).

## Agent protocol (read this before working on the repo)

If you are an AI agent (OpenHands, Vibe, Claude, or any other) starting work on this repository:

1. **Read this README fully.** It is the canonical onboarding document.
2. **Register yourself and log your work in `AGENT_LOG.md`** at the repo root: who you are, what you did, when, and whether each action was inside or outside the roadmap above. Do this at the end of every session — not after every change.
3. **Follow the evidence standard** (Observed / Inferred / Unknown). Never claim a feature works without runtime evidence.
4. **Authority hierarchy**, in descending order: (a) Benard's latest explicit decision in conversation, (b) the approved DeepMark Master Document, (c) the State of Union (engineering reality), (d) Specification / Operating System docs (implementation detail), (e) older prompts and pitches. If an older document conflicts, the newer authority wins.
5. **Never resurrect superseded decisions** (old pricing tiers, 7-step campaign flow, light-mode experiments, etc.) without asking the orchestrator first.
6. **Respect the non-negotiables** above — workspace isolation and no RLS bypass are constitutional.
7. The canonical development workflow is **Builder -> Reviewer -> Verifier -> Orchestrator**: one agent builds, another tries to break it, a third verifies it works, and the orchestrator decides based on evidence. No agent should automatically trust another agent.
8. When uncertain, investigate. When implemented, verify. When verified, document. When valuable, preserve it in memory.

## Document status

Locked: intelligence loop, memory/globe as beta-defining surfaces, thinking experience, visual system, evidence-based engineering, phased roadmap, bootstrapping infrastructure stance.

Not locked (do not finalize without Benard): final slogan, exact pricing, usage/session economics, commercial entitlements, research and trend-data providers, prompt-compression technique, final integration scope, final infrastructure choices, accessibility certification requirements.
