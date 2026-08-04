import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';
import { getProviderStatus } from '@/lib/ai/registry';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  
  if (!userPayload) {
    return unauthorizedResponse();
  }
  
  try {
    const status = await getProviderStatus();
    return successResponse(status, 'Provider status retrieved');
  } catch (error) {
    console.error('Provider status error:', error);
    return successResponse({
      active: 'openrouter',
      available: [{
        name: 'openrouter',
        displayName: 'OpenRouter',
        configured: false,
      }],
    }, 'Using default provider');
  }
}
