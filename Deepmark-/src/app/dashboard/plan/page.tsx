'use client';

import Link from 'next/link';

export default function PlanPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Workspace</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Marketing Plan</h1>
        <p className="mb-8 mt-2 text-slate-600">Your startup strategy will appear here after the planning flow is connected.</p>
        <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No plan has been generated</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">This route no longer shows generic goals as if they were your strategy. Add startup memory and use the Studio while plan generation is being connected.</p>
          <Link href="/dashboard/studio" className="mt-6 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Open Studio</Link>
        </section>
      </div>
    </main>
  );
}
