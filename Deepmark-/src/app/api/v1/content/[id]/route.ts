import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const updateContentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  type: z.enum(['post', 'carousel', 'image_prompt', 'video_prompt']).optional(),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  scheduled_for: z.string().datetime().optional().nullable(),
  platform: z.enum(['twitter', 'linkedin', 'tiktok']).optional().nullable()
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getContentWithAccess(contentId: string, userId: string) {
  const { data: content } = await supabaseAdmin
    .from('content')
    .select('*, campaigns(*, startups(*, workspaces!inner(user_id)))')
    .eq('id', contentId)
    .eq('campaigns.startups.workspaces.user_id', userId)
    .is('content.deleted_at', null)
    .single();
  return content;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }
  const { id } = await params;
  try {
    const content = await getContentWithAccess(id, userPayload.userId);
    if (!content) {
      return notFoundResponse('Content not found');
    }
    const { data: analytics } = await supabaseAdmin
      .from('analytics')
      .select('*')
      .eq('content_id', id)
      .order('recorded_at', { ascending: false });
    return successResponse({ content, analytics: analytics || [] }, 'Content retrieved successfully');
  } catch (error) {
    console.error('Get content error:', error);
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
    const content = await getContentWithAccess(id, userPayload.userId);
    if (!content) {
      return notFoundResponse('Content not found');
    }
    const body = await request.json();
    const validation = updateContentSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }
    const { title, content: contentText, type, status, scheduled_for, platform } = validation.data;
    const now = new Date().toISOString();
    const { data: updatedContent, error: updateError } = await supabaseAdmin
      .from('content')
      .update({ title, content: contentText, type, status, scheduled_for, platform, updated_at: now })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      console.error('Update content error:', updateError);
      return serverErrorResponse('Failed to update content');
    }
    return successResponse({ content: updatedContent }, 'Content updated successfully');
  } catch (error) {
    console.error('Update content error:', error);
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
    const content = await getContentWithAccess(id, userPayload.userId);
    if (!content) {
      return notFoundResponse('Content not found');
    }
    const now = new Date().toISOString();
    const { error: deleteError } = await supabaseAdmin
      .from('content')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id);
    if (deleteError) {
      console.error('Delete content error:', deleteError);
      return serverErrorResponse('Failed to delete content');
    }
    return successResponse({ success: true }, 'Content deleted successfully');
  } catch (error) {
    console.error('Delete content error:', error);
    return serverErrorResponse();
  }
}
