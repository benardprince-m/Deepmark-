'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import ThinkingAnimation from '@/components/thinking/ThinkingAnimation';

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
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // Load arbitrage data from globe if available
  useEffect(() => {
    const arbitrageHook = sessionStorage.getItem('arbitrage_hook');
    const arbitrageAngle = sessionStorage.getItem('arbitrage_angle');
    
    if (arbitrageHook || arbitrageAngle) {
      const enrichedPrompt = `Use this hook: "${arbitrageHook}". ${arbitrageAngle ? `Strategy: ${arbitrageAngle}.` : ''} ${prompt}`;
      setPrompt(enrichedPrompt);
      sessionStorage.removeItem('arbitrage_hook');
      sessionStorage.removeItem('arbitrage_angle');
    }
  }, []);

  const handleFirstToken = useCallback(() => {
    // Stop thinking animation when first token arrives
    setThinking(false);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setThinking(true);
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

      // Stop thinking animation
      setThinking(false);

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data.content);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setThinking(false);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F6F6F6', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#191919', marginBottom: 8 }}>Content Studio</h1>
        <p style={{ color: '#858585', marginBottom: 32 }}>Generate marketing content with AI • No AI-slop, only founder energy</p>

        {/* Content Type Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              style={{
                padding: 16,
                borderRadius: 10,
                border: `2px solid ${selectedType === type.id ? '#191919' : '#E8E8E8'}`,
                background: selectedType === type.id ? '#EEEEEE' : '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: '150ms ease',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{type.icon}</div>
              <div style={{ fontWeight: 600, color: '#191919', fontSize: 14 }}>{type.label}</div>
              <div style={{ fontSize: 11, color: '#858585', marginTop: 4 }}>{type.description}</div>
            </button>
          ))}
        </div>

        {/* Prompt Input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#525252', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What do you want to create?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create... e.g., 'Write a post about how AI is changing startup marketing'"
            style={{
              width: '100%',
              height: 120,
              padding: 14,
              border: '1px solid #E8E8E8',
              borderRadius: 10,
              fontSize: 14,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            width: '100%',
            padding: 14,
            background: '#191919',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !prompt.trim() ? 0.5 : 1,
          }}
        >
          {loading ? 'Generating with founder energy...' : 'Generate Content'}
        </button>

        {/* // Thinking Animation */}
        {(loading || thinking) && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <ThinkingAnimation
              isActive={thinking}
              onFirstToken={handleFirstToken}
              width={250}
              height={100}
            />
          </div>
        )}

        {/* Anti-AI-Slop Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: 11, color: '#858585' }}>Anti-AI-slop mode: Raw narratives, unique hooks, no templates</span>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 24, padding: 16, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 600, color: '#191919' }}>Generated Content</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                style={{ fontSize: 12, color: '#525252', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
            <div style={{ padding: 20, background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 10, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6 }}>
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
