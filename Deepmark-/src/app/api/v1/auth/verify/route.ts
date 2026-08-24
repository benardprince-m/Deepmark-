import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { rateLimit, rateLimitConfigs, getClientIP } from '@/lib/rate-limit';

const verifySchema = z.object({
  token: z.string().uuid('Invalid token format')
});

// Token expiration time in milliseconds (24 hours)
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

// Generic error message to prevent email enumeration
const INVALID_TOKEN_MESSAGE = 'Invalid or expired verification token';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitKey = `verify:${ip}`;
  const rateLimitResult = rateLimit(rateLimitKey, rateLimitConfigs.authSignup);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many verification attempts. Please try again later.'
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

    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
    }

    const { token } = validation.data;

    // Find all users with non-null verification tokens (stored as hash)
    // We need to iterate since bcrypt comparison is done in application code
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified, verification_token, verification_sent_at')
      .not('verification_token', 'is', null)
      .is('deleted_at', null);

    if (!users || users.length === 0) {
      return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
    }

    // Find the user by comparing hashed tokens
    let user = null;
    for (const u of users) {
      if (u.verification_token && await bcrypt.compare(token, u.verification_token)) {
        user = u;
        break;
      }
    }

    if (!user) {
      return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
    }

    // Check if already verified - return same error to prevent enumeration
    if (user.email_verified) {
      return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
    }

    // Check token expiration
    if (user.verification_sent_at) {
      const sentAt = new Date(user.verification_sent_at).getTime();
      const now = Date.now();
      const expiresAt = sentAt + VERIFICATION_TOKEN_EXPIRY;

      if (now > expiresAt) {
        // Clear expired token
        await supabaseAdmin
          .from('users')
          .update({ verification_token: null, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        
        return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
      }
    }

    // Mark email as verified and clear the token
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        updated_at: now
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Email verification update error:', updateError);
      return serverErrorResponse('Failed to verify email');
    }

    console.log(`\n========== EMAIL VERIFIED ==========`);
    console.log(`User: ${user.email} (${user.id})`);
    console.log(`Verified at: ${now}`);
    console.log(`====================================\n`);

    return successResponse({
      message: 'Email verified successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Verification error:', error);
    return serverErrorResponse();
  }
}
