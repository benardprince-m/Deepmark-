import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getTaskWithAccess(taskId: string, userId: string) {
  const { data: task } = await getSupabaseAdmin()
    .from('tasks')
    .select('*, campaigns(*, startups(*, workspaces!inner(user_id)))')
    .eq('id', taskId)
    .eq('campaigns.startups.workspaces.user_id', userId)
    .single();
  return task;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }
  const { id } = await params;
  try {
    const task = await getTaskWithAccess(id, userPayload.userId);
    if (!task) {
      return notFoundResponse('Task not found');
    }
    return successResponse({ task }, 'Task retrieved successfully');
  } catch (error) {
    console.error('Get task error:', error);
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
    const task = await getTaskWithAccess(id, userPayload.userId);
    if (!task) {
      return notFoundResponse('Task not found');
    }
    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }
    const { title, description, status, due_date, priority } = validation.data;
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updated_at: now };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'done') updates.completed_at = now;
    }
    if (due_date !== undefined) updates.due_date = due_date;
    if (priority !== undefined) updates.priority = priority;
    const { data: updatedTask, error: updateError } = await getSupabaseAdmin()
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      console.error('Update task error:', updateError);
      return serverErrorResponse('Failed to update task');
    }
    return successResponse({ task: updatedTask }, 'Task updated successfully');
  } catch (error) {
    console.error('Update task error:', error);
    return serverErrorResponse();
  }
}
