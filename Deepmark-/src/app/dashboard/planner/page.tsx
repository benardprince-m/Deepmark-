'use client';

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Content Planner</h1>
        <p className="text-slate-600 mb-8">Schedule and organize your content</p>

        <div className="p-6 border border-slate-200 rounded-xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">📆 Upcoming Content</h2>
          <div className="space-y-3">
            <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">Monday</p>
              <p className="font-medium">LinkedIn Post: Product Launch</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">Wednesday</p>
              <p className="font-medium">X Thread: Industry Insights</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">Friday</p>
              <p className="font-medium">Video Script: Tutorial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
