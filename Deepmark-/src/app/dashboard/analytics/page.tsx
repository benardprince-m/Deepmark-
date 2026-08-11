'use client';

import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

interface VelocityData {
  id: string;
  content_title: string;
  clicks: number;
  signups: number;
  conversion_rate: string;
  verified_variant: boolean;
  source_trend?: { region_name: string; niche: string };
}

interface VelocitySummary {
  totalClicks: number;
  totalSignups: number;
  avgConversion: number;
}

function HeatmapCell({ value, max, label }: { value: number; max: number; label: string }) {
  const intensity = max > 0 ? value / max : 0;
  const bgColor = intensity > 0.7 ? '#22C55E' : intensity > 0.3 ? '#fbbf24' : '#f3f4f6';
  const textColor = intensity > 0.5 ? '#ffffff' : '#191919';
  
  return (
    <div style={{
      background: bgColor,
      color: textColor,
      padding: 12,
      borderRadius: 8,
      textAlign: 'center',
      minWidth: 80,
    }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 10, color: intensity > 0.5 ? 'rgba(255,255,255,0.8)' : '#858585' }}>{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [velocity, setVelocity] = useState<VelocityData[]>([]);
  const [summary, setSummary] = useState<VelocitySummary>({ totalClicks: 0, totalSignups: 0, avgConversion: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVelocity() {
      try {
        const token = getToken();
        const response = await fetch('/api/v1/trends/velocity', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setVelocity(data.data.velocity);
          setSummary(data.data.summary);
        }
      } catch (error) {
        console.error('Failed to fetch velocity:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVelocity();
  }, []);

  const maxClicks = Math.max(...velocity.map(v => v.clicks), 1);
  const maxSignups = Math.max(...velocity.map(v => v.signups), 1);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F6F6', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: 28, maxWidth: 1180 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#191919', marginBottom: 24 }}>Velocity Analytics</h1>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Clicks</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#191919' }}>{summary.totalClicks}</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Signups</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#22C55E' }}>{summary.totalSignups}</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Avg Conversion</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#191919' }}>{summary.avgConversion.toFixed(1)}%</div>
          </div>
        </div>

        {/* Velocity Heatmap */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191919', marginBottom: 20 }}>Velocity Heatmap</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#858585' }}>Loading...</div>
          ) : velocity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <p style={{ color: '#858585', marginBottom: 16 }}>No velocity data yet. Publish content to start tracking.</p>
              <a href="/dashboard/studio" style={{ color: '#191919', fontWeight: 600 }}>Go to Studio →</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {velocity.map((item) => (
                <div key={item.id} style={{ background: '#F6F6F6', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#191919', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.content_title || 'Untitled'}
                  </div>
                  {item.source_trend && (
                    <div style={{ fontSize: 11, color: '#858585', marginBottom: 12 }}>
                      {item.source_trend.region_name} • {item.source_trend.niche}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <HeatmapCell value={item.clicks} max={maxClicks} label="Clicks" />
                    <HeatmapCell value={item.signups} max={maxSignups} label="Signups" />
                  </div>
                  <div style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>
                    {item.conversion_rate}% CVR
                    {item.verified_variant && <span style={{ marginLeft: 8 }}>✓ Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191919', marginBottom: 20 }}>Conversion Funnel</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 40, background: '#191919', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
              Impressions
            </div>
            <div style={{ color: '#858585' }}>→</div>
            <div style={{ flex: 0.5, height: 40, background: '#525252', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
              Clicks
            </div>
            <div style={{ color: '#858585' }}>→</div>
            <div style={{ flex: 0.25, height: 40, background: '#22C55E', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
              Conv
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
