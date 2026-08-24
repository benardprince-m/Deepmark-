import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { createdResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const createTaskSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional().nullable(),
  due_date: z.string(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { campaign_id, title, description, due_date, priority } = validation.data;

    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .eq('id', campaign_id)
      .eq('startups.workspaces.user_id', userPayload.userId)
      .eq('startups.deleted_at', null)
      .eq('startups.workspaces.deleted_at', null)
      .is('campaigns.deleted_at', null)
      .single();

    if (!campaign) {
      return errorResponse('Campaign not found or access denied', 'forbidden');
    }

    const taskId = uuidv4();
    const now = new Date().toISOString();

    const { data: task, error: insertError } = await supabaseAdmin
      .from('tasks')
      .insert({
        id: taskId,
        campaign_id,
        title,
        description,
        status: 'todo',
        due_date,
        priority,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create task error:', insertError);
      return serverErrorResponse('Failed to create task');
    }

    return createdResponse({ task }, 'Task created successfully');
  } catch (error) {
    console.error('Create task error:', error);
    return serverErrorResponse();
  }
}
