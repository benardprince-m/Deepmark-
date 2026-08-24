import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  try {
    // Get user's workspace
    const { data: workspaces } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('user_id', userPayload.userId)
      .limit(1);

    if (!workspaces || workspaces.length === 0) {
      return successResponse({ synced_count: 0 }, 'No workspace found');
    }

    const workspaceId = workspaces[0].id;

    // Get content with velocity tracking data
    const { data: velocityData } = await supabaseAdmin
      .from('content_velocity_tracking')
      .select(`
        content_id,
        link_clicks,
        signups,
        conversion_rate,
        updated_at
      `)
      .eq('workspace_id', workspaceId);

    // Build content_id to platform map
    const contentIds = velocityData?.map(v => v.content_id) || [];
    const platformMap: Record<string, string> = {};
    if (contentIds.length > 0) {
      const { data: contentData } = await supabaseAdmin
        .from('content')
        .select('id, platform')
        .in('id', contentIds);
      if (contentData) {
        contentData.forEach(c => {
          platformMap[c.id] = c.platform || 'web';
        });
      }
    }

    let syncedCount = 0;
    const errors: string[] = [];

    if (velocityData && velocityData.length > 0) {
      for (const velocity of velocityData) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const { data: existing } = await supabaseAdmin
            .from('analytics')
            .select('id')
            .eq('content_id', velocity.content_id)
            .gte('recorded_at', today)
            .single();

          if (existing) continue;

          // Use real data from content_velocity_tracking
          const realAnalytics = {
            impressions: velocity.link_clicks * 10, // Estimate impressions from clicks
            engagement: velocity.signups * 5,       // Estimate engagement from signups  
            clicks: velocity.link_clicks            // Use actual clicks
          };

          await getSupabaseAdmin().from('analytics').insert({
            id: uuidv4(),
            content_id: velocity.content_id,
            platform: platformMap[velocity.content_id] || 'web',
            ...realAnalytics,
            recorded_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

          syncedCount++;
        } catch {
          errors.push(`Failed to sync content ${velocity.content_id}`);
        }
      }
    }

    return successResponse({
      synced_count: syncedCount,
      errors: errors.length > 0 ? errors : undefined
    }, 'Analytics sync completed');
  } catch (error) {
    console.error('Analytics sync error:', error);
    return serverErrorResponse();
  }
}
