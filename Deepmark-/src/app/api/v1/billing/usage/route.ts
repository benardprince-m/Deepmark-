import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id, plan, plan_status, plan_updated_at, subscription_current_period_end')
      .eq('user_id', userPayload.userId)
      .eq('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const plan = (workspace.plan as 'free' | 'starter' | 'pro' | 'enterprise') || 'free';
    const planDetails = SUBSCRIPTION_PLANS.find(p => p.id === plan);

    const { count: workspacesUsed } = await supabaseAdmin
      .from('workspaces')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userPayload.userId)
      .is('deleted_at', null);

    const { count: startupsUsed } = await supabaseAdmin
      .from('startups')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userPayload.userId)
      .is('deleted_at', null);

    const { count: contentGenerated } = await supabaseAdmin
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userPayload.userId)
      .is('deleted_at', null);

    const limits = planDetails?.limits || {
      workspaces: 1,
      startups: 1,
      contentGenerations: 10,
      aiCallsPerMonth: 50,
    };

    const usage = {
      workspaces: workspacesUsed || 0,
      startups: startupsUsed || 0,
      contentGenerations: contentGenerated || 0,
    };

    const remaining = {
      workspaces: limits.workspaces === -1 ? -1 : Math.max(0, limits.workspaces - (workspacesUsed || 0)),
      startups: limits.startups === -1 ? -1 : Math.max(0, limits.startups - (startupsUsed || 0)),
      contentGenerations: limits.contentGenerations === -1 ? -1 : Math.max(0, limits.contentGenerations - (contentGenerated || 0)),
    };

    const upgradeRequired = remaining.workspaces === 0 || remaining.startups === 0 || remaining.contentGenerations === 0;

    return successResponse({
      plan,
      planStatus: workspace.plan_status || 'active',
      planDetails: planDetails ? {
        name: planDetails.name,
        price: planDetails.price,
        limits,
      } : null,
      usage,
      remaining,
      subscriptionEndsAt: workspace.subscription_current_period_end,
      planUpdatedAt: workspace.plan_updated_at,
      upgradeRequired,
      upgradeMessage: upgradeRequired ? 'Upgrade to a higher plan to continue.' : null,
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return serverErrorResponse('Failed to get usage information');
  }
}
