import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ ws: string }>;
}

async function verifyWorkspaceAccess(workspaceId: string, userId: string) {
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();
  return !!workspace;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { ws: workspace_id } = await params;

  try {
    const hasAccess = await verifyWorkspaceAccess(workspace_id, userPayload.userId);
    if (!hasAccess) {
      return notFoundResponse('Workspace not found');
    }

    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('id, provider, status, scopes, connected_at, expires_at')
      .eq('workspace_id', workspace_id)
      .is('deleted_at', null)
      .order('connected_at', { ascending: false });

    return successResponse({
      integrations: integrations || [],
      count: integrations?.length || 0
    }, 'Integrations retrieved successfully');
  } catch (error) {
    console.error('Get integrations error:', error);
    return serverErrorResponse();
  }
}
