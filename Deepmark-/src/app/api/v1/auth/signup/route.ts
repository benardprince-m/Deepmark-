import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';
import { createdResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export async function POST(request: NextRequest) {
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
      .select('id')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    if (existingUser) {
      return errorResponse('User with this email already exists', 'user_exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    const { error: insertError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now
    });

    if (insertError) {
      console.error('User creation error:', insertError);
      return serverErrorResponse('Failed to create user');
    }

    // Create default workspace for the user
    const workspaceId = uuidv4();
    await supabaseAdmin.from('workspaces').insert({
      id: workspaceId,
      user_id: userId,
      name: 'My Workspace',
      created_at: now,
      updated_at: now
    });

    // Generate JWT
    const token = await signToken({ userId, email });

    return createdResponse({
      user: { id: userId, email },
      token
    }, 'User created successfully');
  } catch (error) {
    console.error('Signup error:', error);
    return serverErrorResponse();
  }
}
