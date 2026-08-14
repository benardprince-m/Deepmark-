import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required'); })()
);

// Token expiration time in seconds (7 days)
export const JWT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;

export const JWT_EXPIRATION = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  email_verified: boolean;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // First try to get from cookie
  const cookieToken = request.cookies.get('deepmark_auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fallback to Authorization header for backward compatibility
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}
