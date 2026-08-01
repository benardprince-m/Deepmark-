import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, createdResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

const createMemorySchema = z.object({
  category: z.enum(['voice', 'positioning', 'preferences', 'results']),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  source: z.enum(['user_input', 'inferred', 'system']).default('user_input'),
  confidence: z.number().min(0).max(100).default(50)
});

interface RouteParams {
  params: Promise<{ workspace_id: string }>;
}

async function verifyWorkspaceAccess(workspaceId: string, userId: string) {
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();
  return !!workspace;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { workspace_id } = await params;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const hasAccess = await verifyWorkspaceAccess(workspace_id, userPayload.userId);
    if (!hasAccess) {
      return notFoundResponse('Workspace not found');
    }

    let query = supabaseAdmin
      .from('memory')
      .select('*')
      .eq('workspace_id', workspace_id)
      .is('deleted_at', null)
      .order('last_used', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: memories } = await query;

    return successResponse({
      memories: memories || [],
      count: memories?.length || 0
    }, 'Memories retrieved successfully');
  } catch (error) {
    console.error('Get memories error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { workspace_id } = await params;

  try {
    const hasAccess = await verifyWorkspaceAccess(workspace_id, userPayload.userId);
    if (!hasAccess) {
      return notFoundResponse('Workspace not found');
    }

    const body = await request.json();
    const validation = createMemorySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { category, title, content, source, confidence } = validation.data;
    const memoryId = uuidv4();
    const now = new Date().toISOString();

    const { data: memory, error: insertError } = await supabaseAdmin
      .from('memory')
      .insert({
        id: memoryId,
        workspace_id,
        category,
        title,
        content,
        source,
        confidence,
        last_used: now,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create memory error:', insertError);
      return serverErrorResponse('Failed to create memory');
    }

    return createdResponse({ memory }, 'Memory created successfully');
  } catch (error) {
    console.error('Create memory error:', error);
    return serverErrorResponse();
  }
}
