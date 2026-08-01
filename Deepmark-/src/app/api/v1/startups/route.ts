import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, createdResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const createStartupSchema = z.object({
  workspace_id: z.string().uuid('Invalid workspace ID'),
  name: z.string().min(1, 'Name is required').max(255),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  target_audience: z.string().optional().nullable(),
  available_time_per_week: z.enum(['5', '10', '20', '40']).transform(Number).optional(),
  main_goal: z.enum(['awareness', 'leads', 'signups']).optional()
});

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createStartupSchema.safeParse(body);
    
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { workspace_id, name, website, description, target_audience, available_time_per_week, main_goal } = validation.data;

    // Verify workspace ownership
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('id', workspace_id)
      .eq('user_id', userPayload.userId)
      .is('deleted_at', null)
      .single();

    if (!workspace) {
      return errorResponse('Workspace not found or access denied', 'forbidden');
    }

    const startupId = uuidv4();
    const now = new Date().toISOString();

    const { data: startup, error: insertError } = await supabaseAdmin
      .from('startups')
      .insert({
        id: startupId,
        workspace_id,
        name,
        website,
        description,
        target_audience,
        available_time_per_week: available_time_per_week as 5 | 10 | 20 | 40 | undefined,
        main_goal: main_goal as 'awareness' | 'leads' | 'signups' | undefined,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create startup error:', insertError);
      return serverErrorResponse('Failed to create startup');
    }

    return createdResponse({ startup }, 'Startup created successfully');
  } catch (error) {
    console.error('Create startup error:', error);
    return serverErrorResponse();
  }
}
