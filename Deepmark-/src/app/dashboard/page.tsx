'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout, getUser } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/studio', label: 'Studio', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  { href: '/dashboard/planner', label: 'Planner', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useMemo(() => getUser(), []);
  const isAuth = useMemo(() => isAuthenticated(), []);

  useEffect(() => {
    if (!isAuth) {
      router.push('/auth/login');
    }
  }, [isAuth, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-[#858585]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E8E8E8] bg-white flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#E8E8E8]">
          <img src="/assets/logo/icon.svg" alt="DeepMark" className="h-8 w-8" />
          <span className="ml-3 text-base font-extrabold tracking-tight text-[#191919]">DeepMark</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-[#858585] hover:text-[#191919] hover:bg-[#EEEEEE] transition-all"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </a>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#E8E8E8]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#191919] flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#191919] truncate">
                {user?.email || 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm font-medium text-[#858585] hover:text-[#191919] hover:bg-[#EEEEEE] transition-all"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="h-16 border-b border-[#E8E8E8] flex items-center justify-between px-8 bg-white">
          <h1 className="text-lg font-semibold text-[#191919]">Dashboard</h1>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Welcome Card */}
          <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-8 mb-6">
            <h2 className="text-2xl font-bold text-[#191919] mb-2">
              Welcome to DeepMark
            </h2>
            <p className="text-[#858585]">
              Marketing that works. While you do.
            </p>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Total Revenue - Dark Card */}
            <div className="bg-[#191919] text-white rounded-[10px] p-6">
              <p className="text-[11px] uppercase tracking-wider text-[#858585] mb-2">Total Revenue</p>
              <p className="text-3xl font-extrabold mb-2">$12,450</p>
              <p className="text-sm text-[#28C76F] flex items-center gap-1">
                <span>↑</span> 12.5%
              </p>
            </div>

            {/* Active Users */}
            <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
              <p className="text-[11px] uppercase tracking-wider text-[#858585] mb-2">Active Users</p>
              <p className="text-3xl font-extrabold text-[#191919] mb-2">1,234</p>
              <p className="text-sm text-[#28C76F] flex items-center gap-1">
                <span>↑</span> 8.3%
              </p>
            </div>

            {/* New Users */}
            <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
              <p className="text-[11px] uppercase tracking-wider text-[#858585] mb-2">New Users</p>
              <p className="text-3xl font-extrabold text-[#191919] mb-2">89</p>
              <p className="text-sm text-[#858585] flex items-center gap-1">
                <span>→</span> 0%
              </p>
            </div>

            {/* Total Members */}
            <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
              <p className="text-[11px] uppercase tracking-wider text-[#858585] mb-2">Total Members</p>
              <p className="text-3xl font-extrabold text-[#191919] mb-2">3,456</p>
              <p className="text-sm text-[#28C76F] flex items-center gap-1">
                <span>↑</span> 4.2%
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
            <h3 className="text-lg font-semibold text-[#191919] mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <button className="h-10 px-4 bg-[#191919] hover:bg-[#525252] text-white font-medium rounded-[10px] transition-all">
                Create Content
              </button>
              <button className="h-10 px-4 border border-[#E8E8E8] hover:bg-[#EEEEEE] text-[#191919] font-medium rounded-[10px] transition-all">
                View Analytics
              </button>
              <button className="h-10 px-4 border border-[#E8E8E8] hover:bg-[#EEEEEE] text-[#191919] font-medium rounded-[10px] transition-all">
                Plan Content
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
