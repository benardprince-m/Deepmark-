import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);

  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified, created_at, updated_at')
      .eq('id', userPayload.userId)
      .is('deleted_at', null)
      .single();

    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({ user }, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    return serverErrorResponse();
  }
}
