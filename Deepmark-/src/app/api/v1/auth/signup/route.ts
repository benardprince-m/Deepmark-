import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase';
import { signToken, JWT_EXPIRATION_SECONDS } from '@/lib/jwt';
import { createdResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { rateLimit, rateLimitConfigs, getClientIP, createAuthRateLimitKey } from '@/lib/rate-limit';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitKey = createAuthRateLimitKey(ip, 'signup');
  const rateLimitResult = rateLimit(rateLimitKey, rateLimitConfigs.authSignup);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many signup attempts. Please try again later.'
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

    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email_verified')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    if (existingUser) {
      return errorResponse('An account with this email already exists', 'user_exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token and hash it before storing
    const verificationToken = uuidv4();
    const verificationTokenHash = await bcrypt.hash(verificationToken, 10);
    const now = new Date().toISOString();
    const verificationSentAt = now;

    // Create user
    const userId = uuidv4();

    const { error: insertError } = await getSupabaseAdmin().from('users').insert({
      id: userId,
      email,
      password_hash: passwordHash,
      email_verified: false,
      verification_token: verificationTokenHash,
      verification_sent_at: verificationSentAt,
      created_at: now,
      updated_at: now
    });

    if (insertError) {
      console.error('User creation error:', insertError);
      return serverErrorResponse('Failed to create user');
    }

    // Create default workspace for the user
    const workspaceId = uuidv4();
    await getSupabaseAdmin().from('workspaces').insert({
      id: workspaceId,
      user_id: userId,
      name: 'My Workspace',
      created_at: now,
      updated_at: now
    });

    // Log verification link for development (actual email sending requires SMTP service)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify?token=${verificationToken}`;
    console.log('\n========== EMAIL VERIFICATION ==========');
    console.log(`To: ${email}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log(`Token expires in: 24 hours`);
    console.log('==========================================\n');

    // Generate JWT with email_verified=false (user is not yet verified)
    const token = await signToken({ userId, email, email_verified: false });

    // Create response with httpOnly cookie
    const response = createdResponse({
      user: { id: userId, email },
      emailVerificationRequired: true,
      message: 'User created successfully. Please verify your email to enable all features.'
    }, 'User created successfully');

    // Set httpOnly cookie
    response.cookies.set('deepmark_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: JWT_EXPIRATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return serverErrorResponse();
  }
}
