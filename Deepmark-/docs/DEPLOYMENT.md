# DeepMark Deployment Guide

## Overview

DeepMark is deployed on Railway with GitHub Actions for CI/CD.

## Infrastructure

| Service | Purpose |
|---------|---------|
| Railway | Hosting (Frontend + API) |
| GitHub Actions | CI/CD Pipeline |
| Supabase | Database |
| Groq API | AI Inference |
| Vercel (optional) | Alternative hosting |

## GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Railway
        uses: railway-deploy-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          service: deepmark
```

## Environment Variables

### GitHub Secrets (Required)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` (optional)

### Railway Variables
Same as GitHub secrets, plus:
- `NODE_ENV=production`
- `PORT=3000`

## Deployment Steps

### 1. Prepare Repository
```bash
git checkout -b deploy/setup
# Ensure all secrets are added to GitHub
git push origin deploy/setup
```

### 2. Configure Railway
1. Create new Railway project
2. Connect GitHub repository
3. Add environment variables
4. Deploy

### 3. Verify Deployment
1. Check Railway logs for errors
2. Test authentication flow
3. Test AI generation
4. Check all pages load

## Rollback

To rollback to previous deployment:
```bash
# Via Railway CLI
railway rollback

# Or via dashboard
# Railway Dashboard → Deployments → Select previous → Redeploy
```

## Monitoring

### Railway
- Logs: `railway logs`
- Status: Railway Dashboard

### Supabase
- Dashboard: supabase.com/dashboard
- Logs: Project → Logs

## Performance

### Optimization
- Static pages pre-rendered
- API routes serverless
- Images optimized via Next.js
- Fonts preloaded

### Caching
- Static assets: 1 year cache
- API: No cache (real-time data)
- ISR: 60 second revalidation where applicable

## Domains

| Environment | URL |
|-------------|-----|
| Production | https://deepmark.app |
| Staging | https://staging.deepmark.app |

## Troubleshooting

### Build fails
1. Check TypeScript errors: `npm run type-check`
2. Check lint errors: `npm run lint`
3. Verify environment variables set

### API returns 500
1. Check Railway logs
2. Verify Supabase connection
3. Check API key validity

### AI not working
1. Verify Groq API key
2. Check API quota
3. Check rate limits
