// Simple in-memory rate limiter
// For production, use Redis or a service like Upstash

import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt
  };
}

// Extract client IP from request
export function getClientIP(request: NextRequest): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback for local development
  return '127.0.0.1';
}

// Rate limit configurations
export const rateLimitConfigs = {
  auth: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 5  // 5 attempts per minute
  },
  authSignup: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 3  // 3 signups per hour
  },
  authRefresh: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 10  // 10 refreshes per minute
  },
  api: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 100  // 100 requests per minute
  }
};

// Create a rate limit key for auth endpoints
export function createAuthRateLimitKey(ip: string, endpoint: string): string {
  return `auth:${endpoint}:${ip}`;
}
