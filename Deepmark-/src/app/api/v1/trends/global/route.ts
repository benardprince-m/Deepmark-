import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const { data, error } = await supabaseAdmin
      .from('global_trend_nodes')
      .select('*')
      .order('conversion_velocity_score', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return errorResponse('Failed to fetch trends', 'db_error');
    }

    // Transform data to match frontend expectations
    const transformedData = (data || []).map((node) => ({
      id: node.id,
      region_name: node.region_name,
      city_name: node.city_name,
      coordinates: { lat: node.latitude, lng: node.longitude },
      niche: node.niche,
      strategy_data: {
        hook: Array.isArray(node.hook_structures) ? node.hook_structures[0] : node.hook_structures,
        angle: Array.isArray(node.competitor_angles) ? node.competitor_angles[0] : node.competitor_angles,
      },
      hook_structures: node.hook_structures,
      competitor_angles: node.competitor_angles,
      consumer_psychology: node.consumer_psychology,
      conversion_velocity_score: node.conversion_velocity_score,
      status_color: node.status_color,
    }));

    return successResponse(transformedData);
  } catch (error) {
    console.error('Trends fetch error:', error);
    return errorResponse('Failed to fetch trends', 'server_error');
  }
}
