'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error?.message || data.message || 'Signup failed');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
            Create your account
          </h1>
          <p className="text-sm text-[#858585] text-center mb-6">
            Start your marketing journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {success && (
              <div className="bg-[#28C76F]/10 border border-[#28C76F]/20 rounded-[10px] px-4 py-3 text-sm text-[#28C76F]">
                Account created. Redirecting to login...
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
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
                disabled={success}
                className="w-full h-11 px-4 bg-white border border-[#E8E8E8] rounded-[10px] text-[#191919] text-sm placeholder:text-[#858585] focus:outline-none focus:border-[#191919] focus:ring-[3px] focus:ring-[rgba(25,25,25,0.08)] transition-all disabled:opacity-50"
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
                placeholder="At least 8 characters"
                required
                minLength={8}
                disabled={success}
                className="w-full h-11 px-4 bg-white border border-[#E8E8E8] rounded-[10px] text-[#191919] text-sm placeholder:text-[#858585] focus:outline-none focus:border-[#191919] focus:ring-[3px] focus:ring-[rgba(25,25,25,0.08)] transition-all disabled:opacity-50"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#191919] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
                disabled={success}
                className="w-full h-11 px-4 bg-white border border-[#E8E8E8] rounded-[10px] text-[#191919] text-sm placeholder:text-[#858585] focus:outline-none focus:border-[#191919] focus:ring-[3px] focus:ring-[rgba(25,25,25,0.08)] transition-all disabled:opacity-50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full h-11 bg-[#191919] hover:bg-[#525252] text-white font-medium rounded-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : success ? 'Redirecting...' : 'Create account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-[#858585] text-center mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-[#191919] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
