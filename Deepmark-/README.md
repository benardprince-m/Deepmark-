# DeepMark - Marketing Execution Intelligence Platform

DeepMark is a Marketing Execution Intelligence Platform that helps founders execute marketing consistently through smart planning, AI-assisted content creation, scheduling, and analytics.

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with jose
- **Deployment**: Railway, GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/benardprince-m/Deepmark-.git
cd Deepmark-
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_min_32_chars
```

### Database Setup

1. Create a new Supabase project
2. Run the migration file at `supabase/migrations/001_initial_schema.sql`
3. Update your environment variables with Supabase credentials

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## API Documentation

### Authentication

- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/login` - Sign in
- `POST /api/v1/auth/logout` - Sign out
- `GET /api/v1/auth/me` - Get current user

### Workspaces

- `GET /api/v1/workspaces` - List workspaces
- `POST /api/v1/workspaces` - Create workspace
- `GET /api/v1/workspaces/:id` - Get workspace
- `PATCH /api/v1/workspaces/:id` - Update workspace
- `DELETE /api/v1/workspaces/:id` - Delete workspace

### Startups

- `POST /api/v1/startups` - Create startup
- `GET /api/v1/startups/:id` - Get startup
- `PATCH /api/v1/startups/:id` - Update startup
- `DELETE /api/v1/startups/:id` - Delete startup

### Campaigns

- `POST /api/v1/campaigns` - Create campaign (auto-generates tasks)
- `GET /api/v1/campaigns/:id` - Get campaign with tasks and content
- `PATCH /api/v1/campaigns/:id` - Update campaign
- `DELETE /api/v1/campaigns/:id` - Delete campaign

### Content

- `POST /api/v1/content` - Create content
- `GET /api/v1/content/:id` - Get content with analytics
- `PATCH /api/v1/content/:id` - Update content
- `DELETE /api/v1/content/:id` - Delete content

### Tasks

- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task
- `PATCH /api/v1/tasks/:id` - Update task

### Analytics

- `GET /api/v1/analytics/startup/:startup_id` - Get startup analytics
- `GET /api/v1/analytics/campaign/:campaign_id` - Get campaign analytics
- `POST /api/v1/analytics/sync` - Sync analytics from platforms

### Memory

- `GET /api/v1/memory/:workspace_id` - Get memories
- `POST /api/v1/memory/:workspace_id` - Create memory
- `PATCH /api/v1/memory/:id` - Update memory
- `DELETE /api/v1/memory/:id` - Delete memory

### Integrations

- `GET /api/v1/integrations/:workspace_id` - List integrations
- `POST /api/v1/integrations/:workspace_id/connect` - Connect integration
- `DELETE /api/v1/integrations/:id` - Disconnect integration

### Studio

- `POST /api/v1/studio/prompt` - Generate AI prompt
- `POST /api/v1/studio/enhance` - Enhance content

### Health

- `GET /api/v1/health` - Health check (no auth required)

## Deployment

### Railway

1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push to main

### GitHub Actions

The project includes CI/CD with GitHub Actions:
- Lint check
- Type check
- Build verification
- Auto-deploy to Railway on main branch

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, signup)
│   ├── (dashboard)/      # Dashboard pages
│   └── api/v1/           # API routes
├── components/
│   ├── layout/           # Layout components
│   └── ui/              # UI components
├── lib/
│   ├── api-response.ts   # API response helpers
│   ├── jwt.ts           # JWT utilities
│   ├── rate-limit.ts    # Rate limiting
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
└── types/
    ├── api.ts           # API types
    └── database.ts      # Database types
```

## License

MIT
