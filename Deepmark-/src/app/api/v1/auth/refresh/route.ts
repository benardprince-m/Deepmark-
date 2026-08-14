import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken, signToken, JWT_EXPIRATION_SECONDS } from '@/lib/jwt';
import { unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { rateLimit, rateLimitConfigs, getClientIP, createAuthRateLimitKey } from '@/lib/rate-limit';

const refreshSchema = z.object({
  token: z.string().min(1, 'Token is required').optional()
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
    const body = await request.json().catch(() => ({}));
    const validation = refreshSchema.safeParse(body);

    // Get token from cookie or request body (for backward compatibility)
    let token = request.cookies.get('deepmark_auth_token')?.value;
    
    if (!token && validation.success && validation.data.token) {
      token = validation.data.token;
    }

    if (!token) {
      return unauthorizedResponse('No token provided');
    }

    // Verify the old token (handle expired tokens for refresh)
    const payload = await verifyToken(token);

    if (!payload) {
      return unauthorizedResponse('Invalid token');
    }

    // Generate new token with fresh expiration and email_verified status
    const newToken = await signToken({
      userId: payload.userId,
      email: payload.email,
      email_verified: payload.email_verified
    });

    // Create response with httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        data: { refreshed: true },
        message: 'Token refreshed successfully'
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        }
      }
    );

    // Set updated httpOnly cookie
    response.cookies.set('deepmark_auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: JWT_EXPIRATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return serverErrorResponse();
  }
}
