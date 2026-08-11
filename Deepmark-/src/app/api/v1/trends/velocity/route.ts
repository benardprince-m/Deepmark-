import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

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
      return successResponse({ velocity: [], summary: { totalClicks: 0, totalSignups: 0, avgConversion: 0 } });
    }

    const workspaceId = workspaces[0].id;

    // Get velocity tracking data
    const { data, error } = await supabaseAdmin
      .from('content_velocity_tracking')
      .select(`
        *,
        content:content_id(title),
        source_trend:source_trend_id(region_name, niche)
      `)
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });

    if (error) {
      return errorResponse('Failed to fetch velocity data', 'db_error');
    }

    // Calculate summary
    const summary = data?.reduce((acc, item) => ({
      totalClicks: acc.totalClicks + (item.clicks || 0),
      totalSignups: acc.totalSignups + (item.signups || 0),
      avgConversion: 0, // Calculate from data
    }), { totalClicks: 0, totalSignups: 0, avgConversion: 0 });

    if (summary && data) {
      summary.avgConversion = data.length > 0 
        ? data.reduce((sum, item) => sum + parseFloat(item.conversion_rate || '0'), 0) / data.length
        : 0;
    }

    return successResponse({
      velocity: data || [],
      summary: summary || { totalClicks: 0, totalSignups: 0, avgConversion: 0 },
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
    const { content_id, source_trend_id, clicks, signups } = body;

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
    const conversionRate = clicks > 0 ? ((signups / clicks) * 100).toFixed(2) : '0.00';

    // Upsert velocity tracking
    const { data, error } = await supabaseAdmin
      .from('content_velocity_tracking')
      .upsert({
        workspace_id: workspaceId,
        content_id,
        source_trend_id: source_trend_id || null,
        clicks: clicks || 0,
        signups: signups || 0,
        conversion_rate: conversionRate,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workspace_id,content_id',
      })
      .select()
      .single();

    if (error) {
      return errorResponse('Failed to track velocity', 'db_error');
    }

    return successResponse(data, 'Velocity tracked successfully');
  } catch (error) {
    console.error('Velocity track error:', error);
    return errorResponse('Failed to track velocity', 'server_error');
  }
}
