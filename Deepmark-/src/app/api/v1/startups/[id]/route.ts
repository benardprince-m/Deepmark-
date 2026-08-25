import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const updateStartupSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  target_audience: z.string().optional().nullable(),
  available_time_per_week: z.enum(['5', '10', '20', '40']).transform(Number).optional(),
  main_goal: z.enum(['awareness', 'leads', 'signups']).optional()
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getStartupWithAccess(startupId: string, userId: string) {
  const { data: startup } = await getSupabaseAdmin()
    .from('startups')
    .select('*, workspaces!inner(user_id)')
    .eq('id', startupId)
    .eq('workspaces.user_id', userId)
    .is('startups.deleted_at', null)
    .single();
  return startup;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const startup = await getStartupWithAccess(id, userPayload.userId);

    if (!startup) {
      return notFoundResponse('Startup not found');
    }

    // Get campaigns for this startup
    const { data: campaigns } = await getSupabaseAdmin()
      .from('campaigns')
      .select('*')
      .eq('startup_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return successResponse({
      startup,
      campaigns: campaigns || []
    }, 'Startup retrieved successfully');
  } catch (error) {
    console.error('Get startup error:', error);
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
    const startup = await getStartupWithAccess(id, userPayload.userId);
    if (!startup) {
      return notFoundResponse('Startup not found');
    }

    const body = await request.json();
    const validation = updateStartupSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { name, website, description, target_audience, available_time_per_week, main_goal } = validation.data;
    const now = new Date().toISOString();

    const { data: updatedStartup, error: updateError } = await getSupabaseAdmin()
      .from('startups')
      .update({
        name,
        website,
        description,
        target_audience,
        available_time_per_week: available_time_per_week as 5 | 10 | 20 | 40 | undefined,
        main_goal: main_goal as 'awareness' | 'leads' | 'signups' | undefined,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update startup error:', updateError);
      return serverErrorResponse('Failed to update startup');
    }

    return successResponse({ startup: updatedStartup }, 'Startup updated successfully');
  } catch (error) {
    console.error('Update startup error:', error);
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
    const startup = await getStartupWithAccess(id, userPayload.userId);
    if (!startup) {
      return notFoundResponse('Startup not found');
    }

    const now = new Date().toISOString();

    const { error: deleteError } = await getSupabaseAdmin()
      .from('startups')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id);

    if (deleteError) {
      console.error('Delete startup error:', deleteError);
      return serverErrorResponse('Failed to delete startup');
    }

    return successResponse({ success: true }, 'Startup deleted successfully');
  } catch (error) {
    console.error('Delete startup error:', error);
    return serverErrorResponse();
  }
}
