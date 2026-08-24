import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const updateMemorySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  confidence: z.number().min(0).max(100).optional(),
  category: z.enum(['voice', 'positioning', 'preferences', 'results']).optional()
});

interface RouteParams {
  params: Promise<{ workspace_id: string; id: string }>;
}

async function getMemoryWithAccess(memoryId: string, userId: string) {
  const { data: memory } = await supabaseAdmin
    .from('memory')
    .select('*, workspaces!inner(user_id)')
    .eq('id', memoryId)
    .eq('workspaces.user_id', userId)
    .is('memory.deleted_at', null)
    .single();
  return memory;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }
  const { id } = await params;
  try {
    const memory = await getMemoryWithAccess(id, userPayload.userId);
    if (!memory) {
      return notFoundResponse('Memory not found');
    }
    return successResponse({ memory }, 'Memory retrieved successfully');
  } catch (error) {
    console.error('Get memory error:', error);
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
    const memory = await getMemoryWithAccess(id, userPayload.userId);
    if (!memory) {
      return notFoundResponse('Memory not found');
    }
    const body = await request.json();
    const validation = updateMemorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }
    const { title, content, confidence, category } = validation.data;
    const now = new Date().toISOString();
    const { data: updatedMemory, error: updateError } = await supabaseAdmin
      .from('memory')
      .update({ title, content, confidence, category, updated_at: now })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      console.error('Update memory error:', updateError);
      return serverErrorResponse('Failed to update memory');
    }
    return successResponse({ memory: updatedMemory }, 'Memory updated successfully');
  } catch (error) {
    console.error('Update memory error:', error);
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
    const memory = await getMemoryWithAccess(id, userPayload.userId);
    if (!memory) {
      return notFoundResponse('Memory not found');
    }
    const now = new Date().toISOString();
    const { error: deleteError } = await supabaseAdmin
      .from('memory')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id);
    if (deleteError) {
      console.error('Delete memory error:', deleteError);
      return serverErrorResponse('Failed to delete memory');
    }
    return successResponse({ success: true }, 'Memory deleted successfully');
  } catch (error) {
    console.error('Delete memory error:', error);
    return serverErrorResponse();
  }
}
