'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, CalendarDays, ChevronDown, FileText, MoreHorizontal, Users } from 'lucide-react';

const metricCards = [
  { label: 'Content Created', value: '—', note: 'Connect your workspace data' },
  { label: 'Scheduled', value: '—', note: 'Planner data not connected' },
  { label: 'Published', value: '—', note: 'Publishing data not connected' },
  { label: 'Engagement', value: '—', note: 'No verified analytics yet' },
];

function EmptyChart() {
  return <div className="dm-chart" aria-label="Content performance chart awaiting verified data"><div className="dm-chart-y-axis" aria-hidden="true"><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span></div><div className="dm-chart-grid" aria-hidden="true"><span /><span /><span /><span /><span /><div className="dm-chart-empty"><BarChart3 size={22} strokeWidth={1.5} /><span>Verified performance data will appear here</span></div><div className="dm-chart-x-axis"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div></div>;
}

export default function DashboardPage() {
  const router = useRouter();
  return <>
    <div className="dm-page-title-row"><div><span className="dm-eyebrow">Workspace overview</span><h1>Dashboard</h1><p>See what is moving, what is waiting, and where DeepMark can help next.</p></div><button className="dm-primary-button" onClick={() => router.push('/dashboard/studio')}>New content <ArrowRight size={15} /></button></div>
    <div className="dm-toolbar"><div className="dm-view-switcher" role="tablist" aria-label="Time range"><button>Day</button><button>Week</button><button className="is-selected">Month</button><button>Year</button></div><button className="dm-date-button"><CalendarDays size={16} /><span>1 Sep 2026 – 30 Sep 2026</span><ChevronDown size={15} /></button></div>
    <section className="dm-metric-grid" aria-label="Workspace metrics">{metricCards.map((metric) => <article className="dm-metric-card" key={metric.label}><div className="dm-card-heading"><span>{metric.label}</span><span className="dm-metric-icon"><FileText size={17} strokeWidth={1.7} /></span></div><strong>{metric.value}</strong><p>{metric.note}</p></article>)}</section>
    <section className="dm-dashboard-grid"><article className="dm-panel dm-revenue-panel"><div className="dm-panel-heading"><div><h2>Content Overview</h2><p>Creation and publishing activity</p></div><button className="dm-select-button">All content <ChevronDown size={14} /></button></div><EmptyChart /></article><article className="dm-panel dm-growth-panel"><div className="dm-panel-heading"><div><h2>Workspace Growth</h2><p>Verified audience signals</p></div><button className="dm-more-button" aria-label="More options"><MoreHorizontal size={19} /></button></div><div className="dm-growth-empty"><div className="dm-growth-ring"><div><strong>—</strong><span>not connected</span></div></div><div className="dm-growth-note"><Users size={18} /><span>Connect an integration to see growth here.</span></div></div></article></section>
    <section className="dm-panel dm-upcoming-panel"><div className="dm-panel-heading dm-upcoming-heading"><div><h2>Upcoming Content</h2><p>Planned work from your content calendar</p></div><button className="dm-link-button" onClick={() => router.push('/dashboard/planner')}>View planner <ArrowRight size={16} /></button></div><div className="dm-empty-table"><div className="dm-empty-table-icon"><CalendarDays size={22} strokeWidth={1.6} /></div><strong>No upcoming content yet</strong><span>Create your first draft in Studio, then schedule it from Planner.</span><button className="dm-primary-button" onClick={() => router.push('/dashboard/studio')}>Create content <ArrowRight size={15} /></button></div></section>
    <div className="dm-dashboard-footer"><span>Showing verified workspace data only</span><span className="dm-footer-status"><span /> All systems operational</span></div>
  </>;
}
