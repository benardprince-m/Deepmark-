'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout, getUser } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', section: 'workspace' },
  { href: '/dashboard/studio', label: 'Studio', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', section: 'workspace' },
  { href: '/dashboard/planner', label: 'Planner', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', section: 'workspace' },
  { href: '/dashboard/plan', label: 'Marketing Plan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', section: 'workspace' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', section: 'insights' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', section: 'settings' },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useMemo(() => getUser(), []);
  const isAuth = useMemo(() => isAuthenticated(), []);
  const [activeNav, setActiveNav] = useState('/dashboard');

  useEffect(() => {
    if (!isAuth) {
      router.push('/auth/login');
    }
  }, [isAuth, router]);

  useEffect(() => {
    setActiveNav(window.location.pathname);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleNav = (href: string) => {
    setActiveNav(href);
    router.push(href);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#F6F6F6'}}>
        <div style={{color: '#858585'}}>Loading...</div>
      </div>
    );
  }

  const sections = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'insights', label: 'Insights' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex" style={{background: '#F6F6F6', fontFamily: 'Inter, -apple-system, sans-serif'}}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#FFFFFF',
        borderRight: '1px solid #E8E8E8',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Logo */}
        <div style={{padding: '22px 20px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 32, height: 32, borderRadius: 8, background: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{fontSize: 14, fontWeight: 800, color: 'white'}}>D</span>
          </div>
          <span style={{fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: '#191919'}}>DeepMark</span>
        </div>

        {/* Navigation */}
        <nav style={{flex: 1, padding: '10px 0', overflowY: 'auto'}}>
          {sections.map((section) => (
            <div key={section.id}>
              <div style={{padding: '12px 20px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#858585'}}>
                {section.label}
              </div>
              {navItems.filter(item => item.section === section.id).map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 20px',
                    background: activeNav === item.href ? '#EEEEEE' : 'transparent',
                    border: 'none',
                    borderLeft: activeNav === item.href ? '2px solid #191919' : '2px solid transparent',
                    color: activeNav === item.href ? '#191919' : '#858585',
                    fontSize: 14,
                    fontWeight: activeNav === item.href ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: '150ms cubic-bezier(0, 0, 0.2, 1)'
                  }}
                >
                  <svg style={{width: 18, height: 18, flexShrink: 0}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{padding: '16px 12px', borderTop: '1px solid #E8E8E8'}}>
          <div 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 8,
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            <div style={{width: 32, height: 32, borderRadius: '50%', background: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{fontSize: 13, fontWeight: 700, color: 'white'}}>{user?.email?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <div style={{fontSize: 13, fontWeight: 600, color: '#191919'}}>{user?.email?.split('@')[0] || 'User'}</div>
              <div style={{fontSize: 11, color: '#858585'}}>Free plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header style={{height: 58, borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, background: '#FFFFFF', position: 'sticky', top: 0, zIndex: 100}}>
          <div style={{flex: 1, fontSize: 15, fontWeight: 600}}>Dashboard</div>
          <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            <button style={{padding: '9px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: '#191919', color: 'white', cursor: 'pointer'}}>
              + New Content
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{flex: 1, padding: 28, maxWidth: 1180}}>
          {/* Stats */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28}}>
            {[
              { label: 'Content Created', value: '0', change: '+0 this week' },
              { label: 'Scheduled', value: '0', change: 'No upcoming' },
              { label: 'Published', value: '0', change: '+0 this week' },
              { label: 'Engagement', value: '0%', change: 'No data yet' },
            ].map((stat, i) => (
              <div key={i} style={{background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 10, padding: 16}}>
                <div style={{fontSize: 12, fontWeight: 600, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6}}>{stat.label}</div>
                <div style={{fontSize: 28, fontWeight: 700, color: '#191919'}}>{stat.value}</div>
                <div style={{fontSize: 12, color: '#858585', marginTop: 4}}>{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Welcome Card */}
          <div style={{background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 14, padding: 32}}>
            <h2 style={{fontSize: 18, fontWeight: 700, marginBottom: 8}}>Welcome back, {user?.email?.split('@')[0] || 'Founder'}! 👋</h2>
            <p style={{color: '#858585', marginBottom: 20}}>Ready to create some amazing content? Head to the Studio to generate your first piece of marketing content.</p>
            <button 
              onClick={() => handleNav('/dashboard/studio')}
              style={{padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', background: '#191919', color: 'white', cursor: 'pointer'}}
            >
              Go to Studio →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
