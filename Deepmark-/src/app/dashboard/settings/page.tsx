'use client';

import { getUser } from '@/lib/auth';

export default function SettingsPage() {
  const user = getUser();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Workspace</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mb-8 mt-2 text-slate-600">Account and workspace persistence is not connected in this version.</p>
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
            <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input id="email" type="email" value={user?.email || 'Unavailable'} disabled className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600" readOnly />
          </section>
          <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Workspace settings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Workspace naming, branding, API-key management, and admin controls are intentionally unavailable until their server-backed save paths are implemented. No pretend “Saved” state is shown.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
