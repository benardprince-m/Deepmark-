'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Megaphone, BarChart3, Settings, Users, TrendingUp, DollarSign, Plus, ChevronDown, MoreHorizontal, Calendar, Clock, Target, BarChart2, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'workspace' },
  { href: '/dashboard/studio', label: 'Studio', icon: Megaphone, section: 'workspace' },
  { href: '/dashboard/planner', label: 'Planner', icon: Calendar, section: 'workspace' },
  { href: '/dashboard/plan', label: 'Marketing Plan', icon: Target, section: 'workspace' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, section: 'insights' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, section: 'settings' },
];

const stats = [
  { label: 'Revenue', value: '$23,902', change: '+12.5% vs last month', icon: DollarSign, color: '#22C55E' },
  { label: 'Active Users', value: '16,815', change: '+8.2% vs last month', icon: Users, color: '#3B82F6' },
  { label: 'New Users', value: '1,457', change: '+23.1% vs last month', icon: TrendingUp, color: '#22C55E' },
  { label: 'Members', value: '2,023', change: '+5.7% vs last month', icon: Target, color: '#EF4444' },
];

const upcomingContent = [
  { id: 1, title: 'Q4 Product Launch Campaign', type: 'Campaign', status: 'In Progress', date: '2024-12-15', progress: 65 },
  { id: 2, title: 'Holiday Email Sequence', type: 'Email', status: 'Scheduled', date: '2024-12-10', progress: 100 },
  { id: 3, title: 'Black Friday Social Blitz', type: 'Social', status: 'Draft', date: '2024-11-28', progress: 30 },
  { id: 4, title: 'Year-End Review Report', type: 'Report', status: 'Pending', date: '2024-12-20', progress: 10 },
  { id: 5, title: 'New Year Strategy Deck', type: 'Presentation', status: 'Draft', date: '2025-01-05', progress: 25 },
];

const statusColors = {
  'In Progress': '#3B82F6',
  'Scheduled': '#22C55E',
  'Draft': '#EF4444',
  'Pending': '#858585',
};

function BarChart({ data, maxValue = 100, height = 120 }) {
  return (
    <div className="flex items-end justify-around h-full gap-2 px-2">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ maxWidth: 48 }}>
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{
              height: `${(item.value / maxValue) * (height - 30)}px`,
              background: item.color,
              minHeight: '4px',
            }}
          />
          <span className="text-xs text-[#858585] font-medium" style={{ whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
          <span className="text-xs font-semibold text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function RingChart({ value = 65, size = 120, strokeWidth = 8, color = '#22C55E' }) {
  const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke="#262626"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{value}%</span>
        <span className="text-xs text-[#858585]">Completion</span>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sections = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'insights', label: 'Insights' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-[#262626] bg-[#0A0A0A] transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[#262626] px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#22C55E] flex items-center justify-center flex-shrink-0" />
            {!collapsed && <span className="text-lg font-semibold text-white">DeepMark</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id}>
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#525252]">
                  {section.label}
                </div>
              )}
              {navItems
                .filter((item) => item.section === section.id)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-[#1A1A1A] text-white'
                          : 'text-[#858585] hover:bg-[#1A1A1A] hover:text-white',
                        collapsed && 'justify-center'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-[#262626] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#858585] transition-colors hover:bg-[#1A1A1A] hover:text-white"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronDown
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                collapsed && 'rotate-180'
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function Header({ title, subtitle, action }) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#858585]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-[#22C55E] flex items-center justify-center" />
      </div>
    </header>
  );
}

function StatCard({ label, value, change, icon: Icon, color }) {
  return (
    <Card className="bg-[#121212] border-[#262626] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-[#858585]">
            <Icon className="h-4 w-4" style={{ color }} />
            <span>{label}</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-white truncate">{value}</div>
          <div className="mt-1 text-sm text-[#22C55E]">{change}</div>
        </div>
      </div>
    </Card>
  );
}

function UpcomingContentTable() {
  return (
    <Card className="bg-[#121212] border-[#262626] overflow-hidden">
      <div className="border-b border-[#262626] px-5 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Upcoming Content</h2>
        <Button variant="outline" size="sm" className="border-[#262626] text-[#858585] hover:text-white hover:border-[#3B82F6]">
          <Plus className="h-4 w-4 mr-1" />
          Add Content
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#262626]">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#525252]">Content</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#525252]">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#525252]">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#525252]">Due Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#525252]">Progress</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#525252]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {upcomingContent.map((item) => (
              <tr key={item.id} className="hover:bg-[#1A1A1A] transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-white truncate max-w-xs">{item.title}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1A1A1A] text-[#858585] border border-[#262626]">
                    {item.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${statusColors[item.status]}20`,
                      color: statusColors[item.status],
                      border: `1px solid ${statusColors[item.status]}40`,
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-[#858585]">
                  <Clock className="h-3.5 w-3.5 inline mr-1" />
                  {item.date}
                </td>
                <td className="px-5 py-4">
                  <div className="w-32 h-2 bg-[#262626] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.progress}%`,
                        background: item.progress === 100 ? '#22C55E' : '#3B82F6',
                      }}
                    />
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#525252] hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Home() {
  const barChartData = [
    { label: 'Mon', value: 45, color: '#3B82F6' },
    { label: 'Tue', value: 62, color: '#3B82F6' },
    { label: 'Wed', value: 78, color: '#22C55E' },
    { label: 'Thu', value: 55, color: '#3B82F6' },
    { label: 'Fri', value: 89, color: '#22C55E' },
    { label: 'Sat', value: 72, color: '#EF4444' },
    { label: 'Sun', value: 68, color: '#3B82F6' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Sidebar />

      <main className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300')}>
        <div className="flex-1 p-6 md:p-8 lg:p-10" style={{ marginLeft: '16rem' }}>
          {/* Header */}
          <Header
            title="Dashboard"
            subtitle="Overview of your marketing performance"
            action={
              <Button className="bg-[#22C55E] text-[#0A0A0A] hover:bg-[#16A34A]">
                <Plus className="h-4 w-4 mr-2" />
                New Content
              </Button>
            }
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Charts & Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Bar Chart + Ring Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Performance Bar Chart */}
              <Card className="bg-[#121212] border-[#262626] p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white">Weekly Performance</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#858585]">Last 7 days</span>
                    <ChevronDown className="h-4 w-4 text-[#525252]" />
                  </div>
                </div>
                <div className="h-40">
                  <BarChart data={barChartData} maxValue={100} height={140} />
                </div>
              </Card>

              {/* Campaign Completion Ring Chart */}
              <Card className="bg-[#121212] border-[#262626] p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white">Campaign Completion</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#858585]">Q4 Target</span>
                    <ChevronDown className="h-4 w-4 text-[#525252]" />
                  </div>
                </div>
                <div className="flex items-center justify-center h-48">
                  <RingChart value={65} size={160} strokeWidth={10} color="#22C55E" />
                </div>
              </Card>
            </div>

            {/* Right: Upcoming Content Table */}
            <div className="lg:col-span-1">
              <UpcomingContentTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}