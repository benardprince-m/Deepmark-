import { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyToken, signToken } from '@/lib/jwt';
import { unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { rateLimit, rateLimitConfigs, getClientIP, createAuthRateLimitKey } from '@/lib/rate-limit';

const refreshSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitKey = createAuthRateLimitKey(ip, 'refresh');
  const rateLimitResult = rateLimit(rateLimitKey, rateLimitConfigs.authRefresh);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many refresh attempts. Please try again later.'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
        }
      }
    );
  }

  try {
    const body = await request.json();
    
    const validation = refreshSchema.safeParse(body);
    if (!validation.success) {
      return unauthorizedResponse('Invalid request');
    }

    const { token: oldToken } = validation.data;

    // Verify the old token (handle expired tokens for refresh)
    const payload = await verifyToken(oldToken);
    
    if (!payload) {
      return unauthorizedResponse('Invalid token');
    }

    // Generate new token with fresh expiration
    const newToken = await signToken({
      userId: payload.userId,
      email: payload.email
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: { token: newToken },
        message: 'Token refreshed successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        }
      }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return serverErrorResponse();
  }
}
