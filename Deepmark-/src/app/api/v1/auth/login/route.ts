import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  // Rate limiting: 5 attempts per minute per IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const limited = rateLimit(`login:${ip}`, { windowMs: 60000, maxRequests: 5 });
  
  if (!limited.allowed) {
    return errorResponse(
      'Too many login attempts. Please try again later.',
      'rate_limited',
      429
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
      .select('id, email, password_hash')
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

    // Generate JWT
    const token = await signToken({ userId: user.id, email: user.email });

    return successResponse({
      user: { id: user.id, email: user.email },
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse();
  }
}
