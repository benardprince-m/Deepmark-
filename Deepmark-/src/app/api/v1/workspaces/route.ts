import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, createdResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255)
});

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    const { data: workspaces } = await getSupabaseAdmin()
      .from('workspaces')
      .select('*')
      .eq('user_id', userPayload.userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return successResponse({ workspaces: workspaces || [] }, 'Workspaces retrieved successfully');
  } catch (error) {
    console.error('Get workspaces error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createWorkspaceSchema.safeParse(body);
    
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { name } = validation.data;
    const workspaceId = uuidv4();
    const now = new Date().toISOString();

    const { data: workspace, error: insertError } = await getSupabaseAdmin()
      .from('workspaces')
      .insert({
        id: workspaceId,
        user_id: userPayload.userId,
        name,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create workspace error:', insertError);
      return serverErrorResponse('Failed to create workspace');
    }

    return createdResponse({ workspace }, 'Workspace created successfully');
  } catch (error) {
    console.error('Create workspace error:', error);
    return serverErrorResponse();
  }
}
