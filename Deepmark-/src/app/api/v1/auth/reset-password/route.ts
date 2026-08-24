import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/api-response';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/auth';

const resetPasswordSchema = z.object({
  token: z.string().uuid('Invalid token format'),
  new_password: z.string().min(8, 'Password must be at least 8 characters')
});

// Rate limit: 5 requests per hour per IP
const RESET_PASSWORD_CONFIG = {
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 5
};

// Token expiration time in milliseconds (1 hour)
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000;

// Uniform error message to prevent token enumeration
const INVALID_TOKEN_MESSAGE = 'Invalid or expired reset token';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitKey = `reset-password:${ip}`;
  const rateLimitResult = rateLimit(rateLimitKey, RESET_PASSWORD_CONFIG);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many password reset attempts. Please try again later.'
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

    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { token, new_password } = validation.data;

    // Validate password meets requirements
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return errorResponse(passwordValidation.message!, 'validation_error');
    }

    // Find all users with non-null reset tokens (stored as hash)
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, reset_token, reset_sent_at')
      .not('reset_token', 'is', null)
      .is('deleted_at', null);

    if (!users || users.length === 0) {
      return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
    }

    // Find the user by comparing hashed tokens
    let user = null;
    for (const u of users) {
      if (u.reset_token && await bcrypt.compare(token, u.reset_token)) {
        user = u;
        break;
      }
    }

    if (!user) {
      return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
    }

    // Check token expiration (1 hour)
    if (user.reset_sent_at) {
      const sentAt = new Date(user.reset_sent_at).getTime();
      const now = Date.now();
      const expiresAt = sentAt + RESET_TOKEN_EXPIRY;

      if (now > expiresAt) {
        // Clear expired token
        await supabaseAdmin
          .from('users')
          .update({ reset_token: null, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        return errorResponse(INVALID_TOKEN_MESSAGE, 'invalid_token');
      }
    }

    // Hash new password with bcrypt (cost 12)
    const newPasswordHash = await bcrypt.hash(new_password, 12);

    // Update password and clear reset token
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: newPasswordHash,
        reset_token: null,
        reset_sent_at: null,
        updated_at: now
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password reset update error:', updateError);
      return serverErrorResponse('Failed to reset password');
    }

    console.log(`\n========== PASSWORD RESET COMPLETE ==========`);
    console.log(`User: ${user.email} (${user.id})`);
    console.log(`Reset at: ${now}`);
    console.log('============================================\n');

    return successResponse({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return serverErrorResponse();
  }
}
