import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return unauthorizedResponse();
  }

  // For JWT-based auth, logout is handled client-side by removing the token
  // Server-side we just confirm the logout request is from an authenticated user
  return successResponse({ success: true }, 'Logout successful');
}
