import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';
import { errorResponse, serverErrorResponse } from '@/lib/api-response';
import { rateLimit, rateLimitConfigs, getClientIP, createAuthRateLimitKey } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitKey = createAuthRateLimitKey(ip, 'login');
  const rateLimitResult = rateLimit(rateLimitKey, rateLimitConfigs.auth);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many login attempts. Please try again later.'
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

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { email, password } = validation.data;

    // Find user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, email_verified')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    if (!user) {
      return errorResponse('Invalid email or password', 'invalid_credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 'invalid_credentials');
    }

    // Generate JWT with email_verified status
    const token = await signToken({ 
      userId: user.id, 
      email: user.email,
      email_verified: user.email_verified 
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: { id: user.id, email: user.email, email_verified: user.email_verified },
          token
        },
        message: 'Login successful'
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
    console.error('Login error:', error);
    return serverErrorResponse();
  }
}
