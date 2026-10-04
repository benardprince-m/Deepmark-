'use client';
import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
export default function PlannerPage() {
  return <div className="dm-route-page"><div className="dm-page-title-row"><div><span className="dm-eyebrow">Workspace</span><h1>Content Planner</h1><p>Organize the next pieces of work once publishing connections are ready.</p></div><Link href="/dashboard/studio" className="dm-primary-button">Create draft <ArrowRight size={15} /></Link></div><section className="dm-route-empty"><div className="dm-route-empty-icon"><CalendarDays size={23} /></div><h2>No scheduled content yet</h2><p>DeepMark does not invent upcoming posts. Create a draft in Studio and scheduling will appear here when a publishing integration is connected.</p><Link href="/dashboard/studio" className="dm-link-button">Open Studio <ArrowRight size={16} /></Link></section></div>;
}
