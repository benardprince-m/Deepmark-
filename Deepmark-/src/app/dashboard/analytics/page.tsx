'use client';

import { useState, useEffect } from 'react';
// Using httpOnly cookies - no need to pass token manually

interface VelocityData {
  id: string;
  content_id: string;
  link_clicks: number;
  signups: number;
  conversion_rate: string;
  is_verified_variant: boolean;
  hourly_signals: number[];
  content?: { title: string };
  source_trend?: { region_name: string; niche: string; conversion_velocity_score: number };
}

interface VelocitySummary {
  totalClicks: number;
  totalSignups: number;
  avgConversion: number;
}

interface HeatmapData {
  velocity: VelocityData[];
  summary: VelocitySummary;
  heatmap: number[][];
  verifiedLeaderboard: VelocityData[];
}

const HOURS = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getHeatmapColor(value: number, max: number): string {
  if (value === 0) return '#191919';
  const intensity = max > 0 ? value / max : 0;
  if (intensity > 0.8) return '#22C55E';
  if (intensity > 0.6) return '#059669';
  if (intensity > 0.4) return '#047857';
  if (intensity > 0.2) return '#064E3B';
  return '#022C22';
}

export default function AnalyticsPage() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/v1/trends/velocity', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch velocity:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getMaxHeatmap = (): number => {
    if (!data?.heatmap) return 1;
    return Math.max(...data.heatmap.flat(), 1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F6F6F6', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: 28, maxWidth: 1180 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginBottom: 24 }}>Velocity Analytics</h1>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#191919', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Clicks</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF' }}>{data?.summary.totalClicks || 0}</div>
          </div>
          <div style={{ background: '#191919', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Signups</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#22C55E' }}>{data?.summary.totalSignups || 0}</div>
          </div>
          <div style={{ background: '#191919', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Avg Conversion</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF' }}>{data?.summary.avgConversion.toFixed(1) || 0}%</div>
          </div>
        </div>

        {/* Velocity Heatmap Grid (24h x 7days) */}
        <div style={{ background: '#191919', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 20 }}>Conversion Heatmap (24h × 7 Days)</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#858585' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                <div style={{ width: 40 }} />
                {HOURS.map((h, i) => (
                  <div key={i} style={{ width: 20, fontSize: 8, color: '#858585', textAlign: 'center' }}>
                    {i % 4 === 0 ? h : ''}
                  </div>
                ))}
              </div>
              {DAYS.map((day, dayIdx) => (
                <div key={day} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                  <div style={{ width: 40, fontSize: 10, color: '#858585', display: 'flex', alignItems: 'center' }}>{day}</div>
                  {data?.heatmap?.[dayIdx]?.map((value, hourIdx) => (
                    <div
                      key={hourIdx}
                      style={{
                        width: 20,
                        height: 20,
                        background: getHeatmapColor(value, getMaxHeatmap()),
                        borderRadius: 2,
                      }}
                      title={`${day} ${HOURS[hourIdx]}: ${value} conversions`}
                    />
                  )) || Array(24).fill(0).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 20,
                        height: 20,
                        background: '#262626',
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Leaderboard */}
        <div style={{ background: '#191919', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#22C55E', marginBottom: 20 }}>
            ✓ Verified Variants (15%+ CVR)
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#858585' }}>Loading...</div>
          ) : data?.verifiedLeaderboard && data.verifiedLeaderboard.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.verifiedLeaderboard.map((item, idx) => (
                <div key={item.id} style={{ 
                  background: '#262626', 
                  borderRadius: 8, 
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    background: idx === 0 ? '#22C55E' : '#525252',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: idx === 0 ? '#000' : '#fff',
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
                      {item.content?.title || 'Untitled Content'}
                    </div>
                    {item.source_trend && (
                      <div style={{ fontSize: 12, color: '#858585' }}>
                        {item.source_trend.region_name} • {item.source_trend.niche}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#22C55E' }}>
                      {item.conversion_rate}%
                    </div>
                    <div style={{ fontSize: 10, color: '#858585' }}>CVR</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <p style={{ color: '#858585', marginBottom: 16 }}>No verified variants yet. Reach 15%+ CVR to appear here.</p>
              <a href="/dashboard/studio" style={{ color: '#22C55E', fontWeight: 600 }}>Go to Studio →</a>
            </div>
          )}
        </div>

        {/* Content Velocity */}
        <div style={{ background: '#191919', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 20 }}>Content Performance</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#858585' }}>Loading...</div>
          ) : data?.velocity && data.velocity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.velocity.map((item) => (
                <div key={item.id} style={{ 
                  background: '#262626', 
                  borderRadius: 8, 
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
                      {item.content?.title || 'Untitled Content'}
                    </div>
                    {item.source_trend && (
                      <div style={{ fontSize: 12, color: '#858585' }}>
                        From: {item.source_trend.region_name}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{item.link_clicks}</div>
                    <div style={{ fontSize: 10, color: '#858585' }}>Clicks</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{item.signups}</div>
                    <div style={{ fontSize: 10, color: '#858585' }}>Signups</div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '4px 12px',
                    background: parseFloat(item.conversion_rate) >= 15 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 6,
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#22C55E' }}>{item.conversion_rate}%</div>
                    <div style={{ fontSize: 10, color: '#858585' }}>CVR</div>
                  </div>
                  {item.is_verified_variant && (
                    <div style={{ 
                      padding: '4px 8px',
                      background: '#22C55E',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#000',
                    }}>
                      VERIFIED
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#858585', marginBottom: 16 }}>No content tracked yet.</p>
              <a href="/dashboard/studio" style={{ color: '#22C55E', fontWeight: 600 }}>Generate Content →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
