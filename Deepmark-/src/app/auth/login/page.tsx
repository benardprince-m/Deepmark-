'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveToken, saveUser } from '@/lib/auth';

interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error?.message || data.message || 'Login failed');
        return;
      }

      const result = data.data as LoginResponse;
      saveToken(result.token);
      saveUser(result.user);
      router.push('/dashboard');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/assets/logo/icon.svg" alt="DeepMark" className="h-10 w-10" />
            <span className="text-xl font-extrabold tracking-tight text-[#191919]">DeepMark</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
          <h1 className="text-xl font-semibold text-[#191919] text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[#858585] text-center mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#191919] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-11 px-4 bg-white border border-[#E8E8E8] rounded-[10px] text-[#191919] text-sm placeholder:text-[#858585] focus:outline-none focus:border-[#191919] focus:ring-[3px] focus:ring-[rgba(25,25,25,0.08)] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#191919] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={1}
                className="w-full h-11 px-4 bg-white border border-[#E8E8E8] rounded-[10px] text-[#191919] text-sm placeholder:text-[#858585] focus:outline-none focus:border-[#191919] focus:ring-[3px] focus:ring-[rgba(25,25,25,0.08)] transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#191919] hover:bg-[#525252] text-white font-medium rounded-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-sm text-[#858585] text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-[#191919] font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
