import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorizedResponse();
  }

  // Create response with success message
  const response = successResponse({ success: true }, 'Logout successful');

  // Clear the httpOnly cookie
  response.cookies.set('deepmark_auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  });

  return response;
}
