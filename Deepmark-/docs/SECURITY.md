# DeepMark Security Guidelines

## Authentication

### JWT Tokens
- Tokens expire after 7 days
- Tokens contain: `userId`, `email`, `workspaceId`
- Tokens signed with `JWT_SECRET` environment variable
- Tokens verified on every API request

### Password Requirements
- Minimum 8 characters
- Stored as bcrypt hash (cost factor 12)
- Never logged or exposed in responses

## API Security

### Authorization
- All API routes protected by JWT middleware
- Users can only access their own workspace data
- Row Level Security (RLS) enabled in Supabase

### Input Validation
- All inputs validated using Zod schemas
- SQL injection prevented via parameterized queries
- XSS prevented via React's built-in escaping

### Rate Limiting
- Auth endpoints: 10 requests/minute per IP
- AI generation: 20 requests/minute per user
- Read endpoints: 100 requests/minute per user

## Secrets Management

### Environment Variables (Never commit these)
```
JWT_SECRET=min-32-char-random-string
SUPABASE_SERVICE_ROLE_KEY=supabase-service-key
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key
GROQ_API_KEY=groq-api-key
OPENAI_API_KEY=openai-api-key (optional)
```

### GitHub Secrets
Add via: Repository → Settings → Secrets → Actions

### Railway Variables
Add via: Railway Dashboard → Project → Variables

## CORS Configuration

```typescript
// Allowed origins
const allowedOrigins = [
  'https://deepmark.app',
  'https://www.deepmark.app',
  'http://localhost:3000', // Development only
];
```

## Headers

All API responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Database Security

### Supabase
- Anon key used for client-side operations
- Service role key only in server-side API routes
- Row Level Security policies defined per table
- Connection pooling configured

### SQL Injection Prevention
- Always use parameterized queries
- Never concatenate user input into SQL
- Use Supabase client for all database operations

## Security Checklist

- [x] JWT authentication implemented
- [x] Password hashing (bcrypt)
- [x] Rate limiting on auth endpoints
- [x] Input validation (Zod)
- [x] SQL injection prevention
- [x] CORS configured
- [x] Security headers set
- [x] Row Level Security enabled
- [ ] 2FA support (future)
- [ ] Audit logging (future)
- [ ] IP allowlisting (future)
