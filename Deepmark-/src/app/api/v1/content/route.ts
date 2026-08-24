import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { createdResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const createContentSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  type: z.enum(['post', 'carousel', 'image_prompt', 'video_prompt']),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  scheduled_for: z.string().datetime().optional().nullable(),
  platform: z.enum(['twitter', 'linkedin', 'tiktok']).optional().nullable()
});

async function verifyCampaignAccess(campaignId: string, userId: string) {
  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('startups.workspaces.user_id', userId)
    .eq('startups.deleted_at', null)
    .eq('startups.workspaces.deleted_at', null)
    .is('campaigns.deleted_at', null)
    .single();
  return !!campaign;
}

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createContentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { campaign_id, type, title, content, scheduled_for, platform } = validation.data;

    const hasAccess = await verifyCampaignAccess(campaign_id, userPayload.userId);
    if (!hasAccess) {
      return errorResponse('Campaign not found or access denied', 'forbidden');
    }

    const contentId = uuidv4();
    const now = new Date().toISOString();

    const { data: newContent, error: insertError } = await supabaseAdmin
      .from('content')
      .insert({
        id: contentId,
        campaign_id,
        type,
        title,
        content,
        status: scheduled_for ? 'scheduled' : 'draft',
        scheduled_for,
        platform,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create content error:', insertError);
      return serverErrorResponse('Failed to create content');
    }

    return createdResponse({ content: newContent }, 'Content created successfully');
  } catch (error) {
    console.error('Create content error:', error);
    return serverErrorResponse();
  }
}
