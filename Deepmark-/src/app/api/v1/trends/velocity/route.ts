import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    // Get user's workspace
    const { data: workspaces } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('user_id', userPayload.userId)
      .limit(1);

    if (!workspaces || workspaces.length === 0) {
      return successResponse({ 
        velocity: [], 
        summary: { totalClicks: 0, totalSignups: 0, avgConversion: 0 },
        heatmap: []
      });
    }

    const workspaceId = workspaces[0].id;

    // Get velocity tracking data
    const { data, error } = await supabaseAdmin
      .from('content_velocity_tracking')
      .select(`
        *,
        content:content_id(title),
        source_trend:source_trend_id(region_name, niche, conversion_velocity_score)
      `)
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });

    if (error) {
      return errorResponse('Failed to fetch velocity data', 'db_error');
    }

    // Calculate summary
    const totalClicks = data?.reduce((acc, item) => acc + (item.link_clicks || 0), 0) || 0;
    const totalSignups = data?.reduce((acc, item) => acc + (item.signups || 0), 0) || 0;
    const avgConversion = totalClicks > 0 ? (totalSignups / totalClicks) * 100 : 0;

    // Build heatmap data (24h x 7 days)
    const heatmap: number[][] = [];
    for (let day = 0; day < 7; day++) {
      heatmap[day] = [];
      for (let hour = 0; hour < 24; hour++) {
        // Generate mock heatmap data from hourly_signals
        let signal = 0;
        if (data) {
          data.forEach(item => {
            const signals = item.hourly_signals || [];
            const idx = day * 24 + hour;
            if (signals[idx]) {
              signal += signals[idx];
            }
          });
        }
        heatmap[day][hour] = signal;
      }
    }

    // Get verified variants (conversion > 15%)
    const verifiedLeaderboard = (data || [])
      .filter(item => parseFloat(item.conversion_rate) >= 15)
      .sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate))
      .slice(0, 10);

    return successResponse({
      velocity: data || [],
      summary: { totalClicks, totalSignups, avgConversion },
      heatmap,
      verifiedLeaderboard,
    });
  } catch (error) {
    console.error('Velocity fetch error:', error);
    return errorResponse('Failed to fetch velocity data', 'server_error');
  }
}

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { content_id, source_trend_id, link_clicks, signups, hourly_signals } = body;

    // Get user's workspace
    const { data: workspaces } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('user_id', userPayload.userId)
      .limit(1);

    if (!workspaces || workspaces.length === 0) {
      return errorResponse('No workspace found', 'not_found', 404);
    }

    const workspaceId = workspaces[0].id;
    const clicks = link_clicks || 0;
    const convRate = clicks > 0 ? ((signups || 0) / clicks) * 100 : 0;
    const isVerified = convRate >= 15;

    // Upsert velocity tracking
    const { data, error } = await supabaseAdmin
      .from('content_velocity_tracking')
      .upsert({
        workspace_id: workspaceId,
        content_id,
        source_trend_id: source_trend_id || null,
        link_clicks: clicks,
        signups: signups || 0,
        conversion_rate: convRate.toFixed(2),
        is_verified_variant: isVerified,
        hourly_signals: hourly_signals || [],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workspace_id,content_id',
      })
      .select()
      .single();

    if (error) {
      return errorResponse('Failed to track velocity', 'db_error');
    }

    return successResponse({ 
      ...data, 
      is_verified_variant: isVerified,
    }, 'Velocity tracked successfully');
  } catch (error) {
    console.error('Velocity track error:', error);
    return errorResponse('Failed to track velocity', 'server_error');
  }
}
