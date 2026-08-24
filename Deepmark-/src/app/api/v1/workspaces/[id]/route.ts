import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional()
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getWorkspaceWithAccess(workspaceId: string, userId: string) {
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();
  return workspace;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  
  try {
    const workspace = await getWorkspaceWithAccess(id, userPayload.userId);
    
    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    // Get workspace stats
    const { count: startupsCount } = await supabaseAdmin
      .from('startups')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', id)
      .is('deleted_at', null);

    const { count: campaignsCount } = await supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('startup_id', id)
      .is('deleted_at', null);

    return successResponse({
      workspace,
      stats: {
        startups: startupsCount || 0,
        campaigns: campaignsCount || 0
      }
    }, 'Workspace retrieved successfully');
  } catch (error) {
    console.error('Get workspace error:', error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const workspace = await getWorkspaceWithAccess(id, userPayload.userId);
    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const body = await request.json();
    const validation = updateWorkspaceSchema.safeParse(body);
    
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { name } = validation.data;
    const now = new Date().toISOString();

    const { data: updatedWorkspace, error: updateError } = await supabaseAdmin
      .from('workspaces')
      .update({ name, updated_at: now })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update workspace error:', updateError);
      return serverErrorResponse('Failed to update workspace');
    }

    return successResponse({ workspace: updatedWorkspace }, 'Workspace updated successfully');
  } catch (error) {
    console.error('Update workspace error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const workspace = await getWorkspaceWithAccess(id, userPayload.userId);
    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const now = new Date().toISOString();

    // Soft delete
    const { error: deleteError } = await supabaseAdmin
      .from('workspaces')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id);

    if (deleteError) {
      console.error('Delete workspace error:', deleteError);
      return serverErrorResponse('Failed to delete workspace');
    }

    return successResponse({ success: true }, 'Workspace deleted successfully');
  } catch (error) {
    console.error('Delete workspace error:', error);
    return serverErrorResponse();
  }
}
