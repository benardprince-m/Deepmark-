import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ startup_id: string }>;
}

async function verifyStartupAccess(startupId: string, userId: string) {
  const { data: startup } = await supabaseAdmin
    .from('startups')
    .select('id')
    .eq('id', startupId)
    .eq('workspaces.user_id', userId)
    .eq('workspaces.deleted_at', null)
    .is('startups.deleted_at', null)
    .single();
  return !!startup;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) {
    return unauthorizedResponse();
  }

  const { startup_id } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'all';
  const groupBy = searchParams.get('group_by') || 'platform';

  try {
    const hasAccess = await verifyStartupAccess(startup_id, userPayload.userId);
    if (!hasAccess) {
      return notFoundResponse('Startup not found');
    }

    // Get all campaigns for this startup
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .eq('startup_id', startup_id)
      .is('deleted_at', null);

    const campaignIds = campaigns?.map(c => c.id) || [];
    
    if (campaignIds.length === 0) {
      return successResponse({
        analytics: [],
        totals: { impressions: 0, engagement: 0, clicks: 0 },
        grouped: {}
      }, 'Analytics retrieved successfully');
    }

    // Build date filter
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Get all analytics for content in these campaigns
    let query = supabaseAdmin
      .from('analytics')
      .select('*')
      .in('content_id', campaignIds);

    if (dateFilter) {
      query = query.gte('recorded_at', dateFilter);
    }

    const { data: analytics } = await query;

    // Calculate totals
    const totals = {
      impressions: analytics?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0,
      engagement: analytics?.reduce((sum, a) => sum + (a.engagement || 0), 0) || 0,
      clicks: analytics?.reduce((sum, a) => sum + (a.clicks || 0), 0) || 0
    };

    // Group by specified field
    const grouped: Record<string, { impressions: number; engagement: number; clicks: number }> = {};
    
    analytics?.forEach(a => {
      const key = groupBy === 'day' ? a.recorded_at.split('T')[0] : groupBy === 'week' ? a.recorded_at.substring(0, 10) : groupBy === 'month' ? a.recorded_at.substring(0, 7) : a.platform;
      if (!grouped[key]) {
        grouped[key] = { impressions: 0, engagement: 0, clicks: 0 };
      }
      grouped[key].impressions += a.impressions || 0;
      grouped[key].engagement += a.engagement || 0;
      grouped[key].clicks += a.clicks || 0;
    });

    return successResponse({
      analytics: analytics || [],
      totals,
      grouped,
      period,
      groupBy
    }, 'Analytics retrieved successfully');
  } catch (error) {
    console.error('Get analytics error:', error);
    return serverErrorResponse();
  }
}
