import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    // Default to free tier
    const tier = 'free';
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === tier);
    
    return successResponse({
      tier,
      plan: plan ? {
        name: plan.name,
        price: plan.price,
        limits: plan.limits,
      } : null,
      usage: {
        workspaces: 0,
        startups: 0,
        contentGenerations: 0,
        aiCalls: 0,
      },
      upgradeRequired: false,
      upgradeMessage: 'Upgrade to Starter for more features!',
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return errorResponse('Failed to check subscription', 'server_error');
  }
}
