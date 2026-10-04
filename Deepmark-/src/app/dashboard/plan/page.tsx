'use client';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
export default function PlanPage() {
  return <div className="dm-route-page"><div className="dm-page-title-row"><div><span className="dm-eyebrow">Workspace</span><h1>Marketing Plan</h1><p>Turn your startup memory into a focused, usable go-to-market plan.</p></div><Link href="/dashboard/studio" className="dm-primary-button">Start in Studio <ArrowRight size={15} /></Link></div><section className="dm-route-empty"><div className="dm-route-empty-icon"><Compass size={23} /></div><h2>No plan has been generated</h2><p>DeepMark will build this view from your startup context once the planning flow is connected. We will not fill it with generic goals pretending to be your strategy.</p><Link href="/dashboard/studio" className="dm-link-button">Open Studio <ArrowRight size={16} /></Link></section></div>;
}
