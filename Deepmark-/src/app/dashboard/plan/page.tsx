'use client';

import { useState } from 'react';

export default function PlanPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Marketing Plan</h1>
        <p className="text-slate-600 mb-8">AI-generated marketing strategy for your startup</p>

        <div className="grid gap-6">
          <div className="p-6 border border-slate-200 rounded-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">📋 Strategy Overview</h2>
            <div className="space-y-4 text-slate-600">
              <p>Your comprehensive marketing plan will appear here after generation.</p>
              <p>Include: goals, target audience, channels, timeline, and metrics.</p>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">🎯 Goals</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Define primary objective</li>
              <li>Set measurable KPIs</li>
              <li>Timeline milestones</li>
            </ul>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">📅 Content Calendar</h2>
            <p className="text-slate-600">Plan your content publishing schedule</p>
          </div>
        </div>
      </div>
    </div>
  );
}
