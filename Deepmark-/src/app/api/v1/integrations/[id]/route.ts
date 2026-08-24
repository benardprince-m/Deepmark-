import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

interface RouteParams { params: Promise<{ id: string }>; }

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();
  const { id } = await params;
  const { data: integration } = await getSupabaseAdmin().from('integrations').select('id').eq('id', id).eq('workspaces.user_id', userPayload.userId).is('deleted_at', null).single();
  if (!integration) return notFoundResponse('Integration not found');
  const now = new Date().toISOString();
  await getSupabaseAdmin().from('integrations').update({ status: 'revoked', deleted_at: now, updated_at: now }).eq('id', id);
  return successResponse({ success: true }, 'Integration disconnected');
}