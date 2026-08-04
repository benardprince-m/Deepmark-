# ADR-001: Authentication Architecture

## Status
Accepted

## Date
2026-08-04

## Context
DeepMark uses JWT-based authentication with Supabase as the backend database. The system needs to handle user registration, login, logout, and token refresh securely.

## Decision
- Use JWT (HS256) for stateless authentication
- Store tokens in localStorage for client-side persistence
- Implement rate limiting on auth endpoints to prevent brute force attacks
- Provide token refresh endpoint for extending sessions

## Rate Limiting Configuration
- Login: 5 attempts per minute per IP
- Signup: 3 attempts per hour per IP
- Token Refresh: 10 attempts per minute per IP

## Token Lifecycle
1. User logs in → receives JWT (7-day expiration)
2. Client stores token in localStorage
3. Client includes token in Authorization header for API requests
4. Middleware validates token on protected routes
5. Client can refresh token via `/api/v1/auth/refresh` before expiration

## Consequences
### Positive
- Stateless authentication scales well
- Rate limiting prevents brute force attacks
- Token refresh provides seamless session extension

### Negative
- localStorage vulnerable to XSS attacks
- In-memory rate limiting doesn't work across multiple servers

## Alternatives Considered
- Session-based auth with httpOnly cookies → More secure but requires session storage
- Redis for rate limiting → Better for distributed systems but adds complexity
