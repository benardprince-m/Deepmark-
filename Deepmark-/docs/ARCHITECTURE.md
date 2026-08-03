# DeepMark Architecture

## Overview

DeepMark is a Marketing Operating System built with a modern, scalable architecture.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Groq API (Claude inference), OpenAI API (optional) |
| **Auth** | JWT with Supabase |
| **Hosting** | Railway |
| **CI/CD** | GitHub Actions |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Next.js App (Frontend)                   │  │
│  │  - Landing Page                                      │  │
│  │  - Auth Pages (Login, Signup)                       │  │
│  │  - Dashboard                                         │  │
│  │  - Studio, Planner, Analytics                        │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js Routes)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │Campaigns │  │ Content  │  │Analytics│  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │ Routes │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Supabase     │  │    Groq API     │  │   Social APIs   │
│   (Database)    │  │  (AI Inference) │  │ (Twitter, etc.) │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Directory Structure

```
deepmark/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── studio/
│   │   ├── planner/
│   │   ├── analytics/
│   │   └── api/v1/               # API routes
│   │       ├── auth/
│   │       ├── campaigns/
│   │       ├── content/
│   │       └── analytics/
│   ├── components/
│   │   ├── ui/                  # Base components
│   │   └── layout/              # Layout components
│   ├── lib/
│   │   ├── auth.ts              # Auth utilities
│   │   ├── jwt.ts               # JWT handling
│   │   └── supabase.ts          # Supabase client
│   └── styles/
│       └── tokens.css            # Design tokens
├── public/
│   └── assets/logo/             # Logo SVGs
└── docs/
    └── ARCHITECTURE.md
```

## API Design

### Authentication Flow

1. User submits email/password
2. Server validates credentials against Supabase Auth
3. Server generates JWT token
4. Token returned to client
5. Client stores token in localStorage
6. Subsequent requests include `Authorization: Bearer <token>`

### API Response Format

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message"
  }
}
```

## Data Flow

### User Creates Campaign

1. User fills campaign form in Dashboard
2. Frontend sends POST to `/api/v1/campaigns`
3. API validates JWT, extracts user ID
4. API inserts campaign into Supabase
5. Returns created campaign with ID
6. Frontend updates UI

### AI Content Generation

1. User inputs content intent in Studio
2. Frontend sends POST to `/api/v1/studio/generate`
3. API calls Groq API with optimized prompt
4. Groq returns generated content
5. API stores generation in Supabase
6. Returns content to frontend

## Security

- All API routes protected by JWT middleware
- CORS configured for allowed origins
- Rate limiting on auth endpoints
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

## Scalability

- Serverless architecture (Railway/Next.js)
- Database connection pooling via Supabase
- CDN for static assets
- API route caching where appropriate
