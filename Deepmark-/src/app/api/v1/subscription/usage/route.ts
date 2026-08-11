import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Track usage and check limits
export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { action, type } = body;

    // Simple rate limiting for free tier
    // In production, check against actual database usage
    
    const freeTierLimits = {
      contentGenerations: 10,
      aiCalls: 50,
    };

    if (action === 'increment') {
      const limit = freeTierLimits[type as keyof typeof freeTierLimits] || 0;
      
      // Check if over limit (in production, get actual count from DB)
      // For now, allow all
      const currentUsage = 0;
      
      if (currentUsage >= limit && limit > 0) {
        return errorResponse(
          'Usage limit reached. Upgrade to Starter for unlimited!',
          'limit_reached',
          429
        );
      }

      return successResponse({
        allowed: true,
        remaining: limit - currentUsage - 1,
        limit,
      });
    }

    return errorResponse('Invalid action', 'invalid_action');
  } catch (error) {
    console.error('Usage tracking error:', error);
    return errorResponse('Failed to track usage', 'server_error');
  }
}
