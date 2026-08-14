import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'deepmark_auth_token';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  maxAge?: number;
  domain?: string;
}

/**
 * Server-side function to set auth cookie
 * Must be called in a Server Component or Route Handler
 */
export async function setAuthCookie(
  token: string,
  expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days default
): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds,
  });
}

/**
 * Server-side function to get auth cookie
 * Must be called in a Server Component or Route Handler
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(AUTH_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * Server-side function to remove auth cookie
 * Must be called in a Server Component or Route Handler
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Get cookie options for different environments
 */
export function getCookieOptions(expiresInSeconds?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds,
  };
}
