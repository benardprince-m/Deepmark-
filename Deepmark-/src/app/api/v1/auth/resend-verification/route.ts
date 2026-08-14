import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/api-response';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

const resendSchema = z.object({
  email: z.string().email('Invalid email address')
});

// Rate limit for resend attempts (stricter than signup)
const RESEND_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3
};

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitKey = `resend:${ip}`;
  const rateLimitResult = rateLimit(rateLimitKey, RESEND_RATE_LIMIT);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many resend requests. Please try again later.'
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

    const validation = resendSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { email } = validation.data;

    // Find user by email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, we return the same message
    if (!user) {
      return successResponse({
        message: 'If an account with this email exists and is unverified, a new verification email has been sent.'
      });
    }

    // If email already verified, return same success message
    if (user.email_verified) {
      return successResponse({
        message: 'If an account with this email exists and is unverified, a new verification email has been sent.'
      });
    }

    // Generate new verification token and hash it
    const verificationToken = uuidv4();
    const verificationTokenHash = await bcrypt.hash(verificationToken, 10);
    const now = new Date().toISOString();

    // Update user's verification token
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        verification_token: verificationTokenHash,
        verification_sent_at: now,
        updated_at: now
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Resend verification error:', updateError);
      return serverErrorResponse();
    }

    // Log verification link for development (actual email sending requires SMTP service)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify?token=${verificationToken}`;
    console.log('\n========== RESEND VERIFICATION ==========');
    console.log(`To: ${email}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log(`Token expires in: 24 hours`);
    console.log('==========================================\n');

    return successResponse({
      message: 'If an account with this email exists and is unverified, a new verification email has been sent.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return serverErrorResponse();
  }
}
