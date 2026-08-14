'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/lib/auth';

export default function SettingsPage() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState('account');
  const [workspaceName, setWorkspaceName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAdmin = user?.email === 'admin@deepmark.com';

  const handleSaveWorkspace = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'workspace', label: 'Workspace', icon: '🏢' },
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'api', label: 'API Keys', icon: '🔑' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : []),
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600 mb-8">Manage your account and workspace</p>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800">
                  Update Account
                </button>
              </div>
            )}

            {activeTab === 'workspace' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Workspace Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="My Workspace"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <button 
                  onClick={handleSaveWorkspace}
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Branding</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <p className="text-sm text-slate-500 mt-1">Enter a URL to your logo image</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#000000"
                      className="h-10 w-20 rounded-lg border border-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800">
                  Save Branding
                </button>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600">
                    API keys are managed in your Railway environment variables.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">OpenRouter API Key</label>
                  <input
                    type="password"
                    placeholder="sk-or-v1-..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">⚠️ Admin Access</h3>
                  <p className="text-sm text-red-700">
                    You have admin privileges. Be careful with these settings.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-2">Platform Settings</h3>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Enable Public Signups</span>
                    </label>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-2">AI Provider</h3>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                      <option>OpenRouter (Default)</option>
                      <option>OpenAI</option>
                      <option>Anthropic</option>
                    </select>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-2">Rate Limits</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-slate-600">Requests per minute</label>
                        <input type="number" defaultValue="60" className="w-full px-4 py-2 border border-slate-200 rounded-lg mt-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Save Admin Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
