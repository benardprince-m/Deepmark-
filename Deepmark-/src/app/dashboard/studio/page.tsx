'use client';

import { useState } from 'react';
import { getToken } from '@/lib/auth';

const contentTypes = [
  { id: 'post', label: 'LinkedIn Post', icon: '📝', description: 'Engaging LinkedIn content' },
  { id: 'carousel', label: 'Carousel', icon: '🎠', description: 'Multi-slide content' },
  { id: 'thread', label: 'X Thread', icon: '🐦', description: 'Twitter thread format' },
  { id: 'video', label: 'Video Script', icon: '🎬', description: 'Short video content' },
];

export default function StudioPage() {
  const [selectedType, setSelectedType] = useState('post');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    setResult('');

    try {
      const token = getToken();
      const response = await fetch('/api/v1/studio/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: selectedType,
          user_input: prompt,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data.content);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Content Studio</h1>
        <p className="text-slate-600 mb-8">Generate marketing content with AI</p>

        {/* Content Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedType === type.id
                  ? 'border-black bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <h3 className="font-semibold text-slate-900">{type.label}</h3>
              <p className="text-sm text-slate-500">{type.description}</p>
            </button>
          ))}
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            What do you want to create?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create... e.g., 'Write a post about how AI is changing startup marketing'"
            className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full md:w-auto px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Generated Content</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Copy
              </button>
            </div>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
