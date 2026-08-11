import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const { data, error } = await supabaseAdmin
      .from('global_trend_nodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse('Failed to fetch trends', 'db_error');
    }

    return successResponse(data || []);
  } catch (error) {
    console.error('Trends fetch error:', error);
    return errorResponse('Failed to fetch trends', 'server_error');
  }
}
