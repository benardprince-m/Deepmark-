import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();
  // Return mock notifications - in production, query from notifications table
  return successResponse({
    notifications: [
      { id: '1', type: 'info', message: 'Welcome to DeepMark!', read: false, created_at: new Date().toISOString() }
    ],
    unread_count: 1
  }, 'Notifications retrieved');
}