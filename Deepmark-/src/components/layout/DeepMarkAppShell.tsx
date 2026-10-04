'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import {
  BarChart3, Bell, Box, CircleHelp, Folder, GitBranch, LayoutDashboard,
  ListChecks, LogOut, Megaphone, Mic2, Search, Settings, ChevronDown,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone, disabled: true },
      { href: '/dashboard/content', label: 'Content', icon: Folder, disabled: true },
      { href: '/dashboard/studio', label: 'Studio', icon: Mic2 },
      { href: '/dashboard/tasks', label: 'Tasks', icon: ListChecks, disabled: true },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/integrations', label: 'Integrations', icon: GitBranch, disabled: true },
      { href: '/dashboard/memory', label: 'Memory', icon: Box, disabled: true },
    ],
  },
];

function BrandMark() {
  return <div className="dm-brand-mark" aria-hidden="true"><span /><span /></div>;
}

export default function DeepMarkAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useMemo(() => getUser(), []);
  const isAuth = useMemo(() => isAuthenticated(), []);
  const displayName = user?.email?.split('@')[0] || 'Founder';
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!isAuth) router.push('/auth/login');
  }, [isAuth, router]);

  if (!isAuth) return <div className="dm-dashboard-loading">Loading workspace…</div>;

  return (
    <div className="dm-dashboard-shell">
      <aside className="dm-dashboard-sidebar">
        <div className="dm-sidebar-brand"><BrandMark /><span>DeepMark</span></div>
        <nav className="dm-dashboard-nav" aria-label="Workspace navigation">
          {navGroups.map((group) => (
            <div className="dm-nav-group" key={group.label}>
              <div className="dm-nav-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return <button className={`dm-nav-item${active ? ' is-active' : ''}${item.disabled ? ' is-disabled' : ''}`} key={item.href} onClick={() => !item.disabled && router.push(item.href)} title={item.disabled ? 'Coming soon' : undefined}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.disabled && <span className="dm-nav-soon">Soon</span>}</button>;
              })}
            </div>
          ))}
        </nav>
        <div className="dm-sidebar-bottom">
          <button className={`dm-nav-item${pathname === '/dashboard/settings' ? ' is-active' : ''}`} onClick={() => router.push('/dashboard/settings')}><Settings size={18} strokeWidth={1.8} /><span>Settings</span></button>
          <button className="dm-nav-item"><CircleHelp size={18} strokeWidth={1.8} /><span>Help Center</span></button>
          <button className="dm-nav-item dm-logout" onClick={() => { logout(); router.push('/auth/login'); }}><LogOut size={18} strokeWidth={1.8} /><span>Log out</span></button>
        </div>
      </aside>
      <main className="dm-dashboard-main">
        <header className="dm-dashboard-header">
          <h1>DeepMark</h1>
          <div className="dm-header-actions">
            <button className="dm-search" type="button" aria-label="Search"><Search size={18} strokeWidth={1.8} /><span>Search anything…</span><kbd>⌘ K</kbd></button>
            <button className="dm-icon-button" aria-label="Notifications"><Bell size={19} strokeWidth={1.8} /></button>
            <button className="dm-profile" type="button"><span className="dm-avatar">{initials}</span><span className="dm-profile-copy"><strong>{displayName}</strong><small>DeepMark workspace</small></span><ChevronDown size={16} /></button>
          </div>
        </header>
        <div className="dm-dashboard-content">{children}</div>
      </main>
    </div>
  );
}
