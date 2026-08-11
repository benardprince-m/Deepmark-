'use client';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-slate-600 mb-8">Track your content performance</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-6 border border-slate-200 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Engagements</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Clicks</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="p-6 border border-slate-200 rounded-xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <p className="text-slate-500">Analytics data will appear here as your content gets engagement.</p>
        </div>
      </div>
    </div>
  );
}
