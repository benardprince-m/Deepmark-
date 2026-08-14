import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, successResponse } from '@/lib/api-response';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

// Rate limit: 3 requests per hour per IP
const FORGOT_PASSWORD_CONFIG = {
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 3
};

// Uniform error message to prevent email enumeration
const EMAIL_NOT_FOUND_MESSAGE = 'If an account with that email exists, a reset link has been sent';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitKey = `forgot-password:${ip}`;
  const rateLimitResult = rateLimit(rateLimitKey, FORGOT_PASSWORD_CONFIG);

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

    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { email } = validation.data;

    // Find user by email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return successResponse({ message: EMAIL_NOT_FOUND_MESSAGE });
    }

    // Generate secure reset token (UUID)
    const resetToken = uuidv4();

    // Hash token before storing (using bcrypt for consistency)
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const now = new Date().toISOString();

    // Store hashed token in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        reset_token: resetTokenHash,
        reset_sent_at: now,
        updated_at: now
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to store reset token:', updateError);
      return successResponse({ message: EMAIL_NOT_FOUND_MESSAGE });
    }

    // Log reset link (no real email sending)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    console.log('\n========== PASSWORD RESET ==========');
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`Token expires in: 1 hour`);
    console.log('====================================\n');

    return successResponse({ message: EMAIL_NOT_FOUND_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    return successResponse({ message: EMAIL_NOT_FOUND_MESSAGE });
  }
}
