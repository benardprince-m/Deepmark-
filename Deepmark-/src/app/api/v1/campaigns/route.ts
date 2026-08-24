import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { createdResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const createCampaignSchema = z.object({
  startup_id: z.string().uuid('Invalid startup ID'),
  name: z.string().min(1, 'Name is required').max(255),
  theme: z.string().min(1, 'Theme is required').max(255).optional(),
  goals: z.string().min(1, 'Goals are required').optional(),
  platforms: z.array(z.enum(['twitter', 'linkedin', 'tiktok'])).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createCampaignSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { startup_id, name, theme, goals, platforms, start_date, end_date } = validation.data;

    // Verify startup ownership
    const { data: startup } = await supabaseAdmin
      .from('startups')
      .select('*, workspaces!inner(user_id)')
      .eq('id', startup_id)
      .eq('workspaces.user_id', userPayload.userId)
      .is('startups.deleted_at', null)
      .single();

    if (!startup) {
      return errorResponse('Startup not found or access denied', 'forbidden');
    }

    const campaignId = uuidv4();
    const now = new Date().toISOString();
    const startDate = start_date || now.split('T')[0];
    const endDate = end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: campaign, error: insertError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        id: campaignId,
        startup_id,
        name,
        theme: theme || goals || 'General campaign',
        goals: goals || '',
        status: 'draft',
        start_date: startDate,
        end_date: endDate,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create campaign error:', insertError);
      return serverErrorResponse('Failed to create campaign');
    }

    // Auto-generate tasks based on available time
    const timePerWeek = startup.available_time_per_week || 10;
    const tasks = generateTasks(campaignId, timePerWeek, platforms || ['twitter']);

    if (tasks.length > 0) {
      await getSupabaseAdmin().from('tasks').insert(tasks);
    }

    return createdResponse({ campaign }, 'Campaign created successfully');
  } catch (error) {
    console.error('Create campaign error:', error);
    return serverErrorResponse();
  }
}

function generateTasks(campaignId: string, timePerWeek: number, platforms: string[]) {
  const tasks = [];
  const now = new Date();
  
  // Generate tasks based on available time
  if (timePerWeek >= 5) {
    tasks.push({
      id: uuidv4(),
      campaign_id: campaignId,
      title: 'Research competitor content',
      description: 'Analyze top 5 competitors and identify content patterns',
      status: 'todo',
      due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'high',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    });
  }

  if (timePerWeek >= 10) {
    platforms.forEach((platform, index) => {
      tasks.push({
        id: uuidv4(),
        campaign_id: campaignId,
        title: `Create ${platform} content`,
        description: `Create engaging ${platform} content based on campaign theme`,
        status: 'todo',
        due_date: new Date(now.getTime() + (14 + index * 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    });
  }

  if (timePerWeek >= 20) {
    tasks.push({
      id: uuidv4(),
      campaign_id: campaignId,
      title: 'Review analytics and iterate',
      description: 'Review performance metrics and adjust strategy',
      status: 'todo',
      due_date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'low',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    });
  }

  return tasks;
}
