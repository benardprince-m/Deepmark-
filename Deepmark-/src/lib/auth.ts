// Client-side authentication utilities
// Uses localStorage for token persistence

const TOKEN_KEY = 'deepmark_token';
const USER_KEY = 'deepmark_user';

export interface AuthUser {
  id: string;
  email: string;
}

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

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

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    if (decoded.exp) {
      return decoded.exp * 1000 < Date.now();
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
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    if (decoded.exp) {
      return decoded.exp * 1000 < Date.now() + thresholdMs;
    }
  } catch {
    return true;
  }
  
  return false;
}

export async function refreshToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    if (data.success && data.data?.token) {
      saveToken(data.data.token);
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export async function getValidToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;
  
  // If token is expired, try to refresh
  if (isTokenExpired()) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return getToken();
    }
    // If refresh failed, clear auth
    logout();
    return null;
  }
  
  return token;
}
