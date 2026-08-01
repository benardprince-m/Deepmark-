import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const connectSchema = z.object({
  provider: z.enum(['twitter', 'linkedin', 'tiktok']),
  oauth_code: z.string().min(1)
});

interface RouteParams { params: Promise<{ workspace_id: string }>; }

export async function POST(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();
  const { workspace_id } = await params;
  const { data: workspace } = await supabaseAdmin.from('workspaces').select('id').eq('id', workspace_id).eq('user_id', userPayload.userId).is('deleted_at', null).single();
  if (!workspace) return notFoundResponse('Workspace not found');
  const body = await request.json();
  const validation = connectSchema.safeParse(body);
  if (!validation.success) return errorResponse(validation.error.errors[0].message, 'validation_error');
  const { provider } = validation.data;
  const { data: existing } = await supabaseAdmin.from('integrations').select('id').eq('workspace_id', workspace_id).eq('provider', provider).is('deleted_at', null).single();
  const now = new Date().toISOString();
  if (existing) {
    const { data: updated } = await supabaseAdmin.from('integrations').update({ access_token: `mock_${provider}_${uuidv4()}`, status: 'active', updated_at: now }).eq('id', existing.id).select().single();
    return successResponse({ integration: { id: updated?.id, provider, status: 'active' } }, 'Integration updated');
  }
  const { data: created } = await supabaseAdmin.from('integrations').insert({ id: uuidv4(), workspace_id, provider, access_token: `mock_${provider}_${uuidv4()}`, status: 'active', scopes: [], connected_at: now, updated_at: now }).select().single();
  return successResponse({ integration: { id: created?.id, provider, status: 'active' } }, 'Integration connected');
}