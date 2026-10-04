'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  FileText,
  Folder,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  Mic2,
  MoreHorizontal,
  Search,
  Settings,
  Users,
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

const metricCards = [
  { label: 'Content Created', value: '—', note: 'Connect your workspace data' },
  { label: 'Scheduled', value: '—', note: 'Planner data not connected' },
  { label: 'Published', value: '—', note: 'Publishing data not connected' },
  { label: 'Engagement', value: '—', note: 'No verified analytics yet' },
];

function BrandMark() {
  return (
    <div className="dm-brand-mark" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

function NavIcon({ icon: Icon }: { icon: typeof LayoutDashboard }) {
  return <Icon size={18} strokeWidth={1.8} />;
}

function EmptyChart() {
  return (
    <div className="dm-chart" aria-label="Content performance chart awaiting verified data">
      <div className="dm-chart-y-axis" aria-hidden="true">
        <span>—</span><span>—</span><span>—</span><span>—</span><span>—</span>
      </div>
      <div className="dm-chart-grid" aria-hidden="true">
        <span /><span /><span /><span /><span />
        <div className="dm-chart-empty">
          <BarChart3 size={22} strokeWidth={1.5} />
          <span>Verified performance data will appear here</span>
        </div>
        <div className="dm-chart-x-axis"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useMemo(() => getUser(), []);
  const isAuth = useMemo(() => isAuthenticated(), []);
  const displayName = user?.email?.split('@')[0] || 'Founder';
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!isAuth) router.push('/auth/login');
  }, [isAuth, router]);

  if (!isAuth) {
    return <div className="dm-dashboard-loading">Loading workspace…</div>;
  }

  const navigate = (href: string, disabled?: boolean) => {
    if (!disabled) router.push(href);
  };

  return (
    <div className="dm-dashboard-shell">
      <aside className="dm-dashboard-sidebar">
        <div className="dm-sidebar-brand">
          <BrandMark />
          <span>DeepMark</span>
        </div>

        <nav className="dm-dashboard-nav" aria-label="Workspace navigation">
          {navGroups.map((group) => (
            <div className="dm-nav-group" key={group.label}>
              <div className="dm-nav-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <button
                    className={`dm-nav-item${active ? ' is-active' : ''}${item.disabled ? ' is-disabled' : ''}`}
                    key={item.href}
                    onClick={() => navigate(item.href, item.disabled)}
                    title={item.disabled ? 'Coming soon' : undefined}
                  >
                    <NavIcon icon={Icon} />
                    <span>{item.label}</span>
                    {item.disabled && <span className="dm-nav-soon">Soon</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="dm-sidebar-bottom">
          <button className="dm-nav-item" onClick={() => router.push('/dashboard/settings')}>
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </button>
          <button className="dm-nav-item">
            <CircleHelp size={18} strokeWidth={1.8} />
            <span>Help Center</span>
          </button>
          <button className="dm-nav-item dm-logout" onClick={() => { logout(); router.push('/auth/login'); }}>
            <LogOut size={18} strokeWidth={1.8} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="dm-dashboard-main">
        <header className="dm-dashboard-header">
          <h1>Dashboard</h1>
          <div className="dm-header-actions">
            <button className="dm-search" type="button" aria-label="Search">
              <Search size={18} strokeWidth={1.8} />
              <span>Search anything…</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="dm-icon-button" aria-label="Notifications"><Bell size={19} strokeWidth={1.8} /></button>
            <button className="dm-profile" type="button">
              <span className="dm-avatar">{initials}</span>
              <span className="dm-profile-copy"><strong>{displayName}</strong><small>DeepMark Inc.</small></span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <div className="dm-dashboard-content">
          <div className="dm-toolbar">
            <div className="dm-view-switcher" role="tablist" aria-label="Time range">
              <button>Day</button><button>Week</button><button className="is-selected">Month</button><button>Year</button>
            </div>
            <button className="dm-date-button"><CalendarDays size={16} /><span>1 Sep 2026 – 30 Sep 2026</span><ChevronDown size={15} /></button>
          </div>

          <section className="dm-metric-grid" aria-label="Workspace metrics">
            {metricCards.map((metric) => (
              <article className="dm-metric-card" key={metric.label}>
                <div className="dm-card-heading"><span>{metric.label}</span><span className="dm-metric-icon"><FileText size={17} strokeWidth={1.7} /></span></div>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </article>
            ))}
          </section>

          <section className="dm-dashboard-grid">
            <article className="dm-panel dm-revenue-panel">
              <div className="dm-panel-heading"><div><h2>Content Overview</h2><p>Creation and publishing activity</p></div><button className="dm-select-button">All content <ChevronDown size={14} /></button></div>
              <EmptyChart />
            </article>
            <article className="dm-panel dm-growth-panel">
              <div className="dm-panel-heading"><div><h2>Workspace Growth</h2><p>Verified audience signals</p></div><button className="dm-more-button" aria-label="More options"><MoreHorizontal size={19} /></button></div>
              <div className="dm-growth-empty"><div className="dm-growth-ring"><div><strong>—</strong><span>not connected</span></div></div><div className="dm-growth-note"><Users size={18} /><span>Connect an integration to see growth here.</span></div></div>
            </article>
          </section>

          <section className="dm-panel dm-upcoming-panel">
            <div className="dm-panel-heading dm-upcoming-heading"><div><h2>Upcoming Content</h2><p>Planned work from your content calendar</p></div><button className="dm-link-button" onClick={() => router.push('/dashboard/planner')}>View planner <ArrowRight size={16} /></button></div>
            <div className="dm-empty-table"><div className="dm-empty-table-icon"><CalendarDays size={22} strokeWidth={1.6} /></div><strong>No upcoming content yet</strong><span>Create your first draft in Studio, then schedule it from Planner.</span><button className="dm-primary-button" onClick={() => router.push('/dashboard/studio')}>Create content <ArrowRight size={15} /></button></div>
          </section>

          <div className="dm-dashboard-footer"><span>Showing verified workspace data only</span><span className="dm-footer-status"><span /> All systems operational</span></div>
        </div>
      </main>
    </div>
  );
}
