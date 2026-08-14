// Client-side authentication utilities
// Uses httpOnly cookies for token storage (more secure than localStorage)
// localStorage kept as fallback for SSR compatibility

const TOKEN_KEY = 'deepmark_token';
const USER_KEY = 'deepmark_user';

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Save token to localStorage (fallback for SSR)
 * Note: This is kept for backward compatibility but cookies are preferred
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get token from localStorage (fallback for SSR)
 * Note: Prefer server-side cookie reading for production
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function saveUser(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Check if user is authenticated (checks localStorage as fallback)
 */
export function isAuthenticated(): boolean {
  return !!getUser();
}

/**
 * Logout - clears localStorage (cookie is cleared server-side)
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Get Authorization header for API requests
 * Uses cookie-based auth (handled automatically by browser)
 * Falls back to localStorage token for backward compatibility
 */
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Decode JWT token to check expiration (client-side)
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;

  try {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      return (decoded.exp as number) * 1000 < Date.now();
    }
  } catch {
    return true;
  }

  return false;
}

export function isTokenExpiringSoon(thresholdMs: number = 5 * 60 * 1000): boolean {
  const token = getToken();
  if (!token) return true;

  try {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      return (decoded.exp as number) * 1000 < Date.now() + thresholdMs;
    }
  } catch {
    return true;
  }

  return false;
}

/**
 * Refresh the authentication token
 * Uses cookie-based refresh which doesn't require sending token in body
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

/**
 * Get a valid token (refresh if needed)
 * For cookie-based auth, this mainly ensures the token is still valid
 */
export async function getValidToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  if (isTokenExpired()) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return getToken();
    }
    logout();
    return null;
  }

  return token;
}

/**
 * Check if the auth cookie is present
 * Useful for detecting if user is logged in server-side
 */
export async function checkAuthCookie(): Promise<boolean> {
  try {
    const response = await fetch('/api/v1/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Trigger re-authentication by redirecting to login
 * Use when cookie is not found but should be
 */
export function triggerReAuth(): void {
  if (typeof window !== 'undefined') {
    logout();
    window.location.href = '/auth/login';
  }
}

// Password validation helper
export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  return { valid: true };
}
