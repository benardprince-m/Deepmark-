import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  theme: z.string().optional(),
  goals: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getCampaignWithAccess(campaignId: string, userId: string) {
  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('*, startups(*, workspaces!inner(user_id))')
    .eq('id', campaignId)
    .eq('startups.workspaces.user_id', userId)
    .is('campaigns.deleted_at', null)
    .single();
  return campaign;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const campaign = await getCampaignWithAccess(id, userPayload.userId);

    if (!campaign) {
      return notFoundResponse('Campaign not found');
    }

    // Get tasks for this campaign
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('campaign_id', id)
      .order('due_date', { ascending: true });

    // Get content for this campaign
    const { data: content } = await supabaseAdmin
      .from('content')
      .select('*')
      .eq('campaign_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return successResponse({
      campaign,
      tasks: tasks || [],
      content: content || []
    }, 'Campaign retrieved successfully');
  } catch (error) {
    console.error('Get campaign error:', error);
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
    const campaign = await getCampaignWithAccess(id, userPayload.userId);
    if (!campaign) {
      return notFoundResponse('Campaign not found');
    }

    const body = await request.json();
    const validation = updateCampaignSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { name, theme, goals, status, start_date, end_date } = validation.data;
    const now = new Date().toISOString();

    const { data: updatedCampaign, error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({
        name,
        theme,
        goals,
        status,
        start_date,
        end_date,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update campaign error:', updateError);
      return serverErrorResponse('Failed to update campaign');
    }

    return successResponse({ campaign: updatedCampaign }, 'Campaign updated successfully');
  } catch (error) {
    console.error('Update campaign error:', error);
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
    const campaign = await getCampaignWithAccess(id, userPayload.userId);
    if (!campaign) {
      return notFoundResponse('Campaign not found');
    }

    const now = new Date().toISOString();

    const { error: deleteError } = await supabaseAdmin
      .from('campaigns')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id);

    if (deleteError) {
      console.error('Delete campaign error:', deleteError);
      return serverErrorResponse('Failed to delete campaign');
    }

    return successResponse({ success: true }, 'Campaign deleted successfully');
  } catch (error) {
    console.error('Delete campaign error:', error);
    return serverErrorResponse();
  }
}
