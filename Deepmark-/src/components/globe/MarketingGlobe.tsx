'use client';

import { useState, useEffect, useRef } from 'react';

interface TrendNode {
  id: string;
  region_name: string;
  coordinates: { lat: number; lng: number };
  niche: string;
  strategy_data: { hook: string; angle: string };
  status_color: string;
}

interface IntelligenceCardProps {
  node: TrendNode;
  onClose: () => void;
  onPushToStudio: () => void;
}

function IntelligenceCard({ node, onClose, onPushToStudio }: IntelligenceCardProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#FFFFFF',
      borderRadius: 14,
      padding: 24,
      width: 320,
      maxWidth: '90vw',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#191919', marginBottom: 4 }}>{node.region_name}</h3>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: 6,
            background: node.status_color === '#22C55E' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: node.status_color,
          }}>
            {node.niche}
          </span>
        </div>
        <button onClick={onClose} style={{
          background: 'transparent',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          color: '#858585',
        }}>×</button>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Top Hook
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#191919', marginBottom: 12 }}>"{node.strategy_data.hook}"</p>
        
        <div style={{ fontSize: 12, fontWeight: 700, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Competitor Angle
        </div>
        <p style={{ fontSize: 14, color: '#525252' }}>{node.strategy_data.angle}</p>
      </div>

      <button
        onClick={onPushToStudio}
        style={{
          width: '100%',
          padding: '12px 20px',
          background: '#191919',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Push to Studio →
      </button>
    </div>
  );
}

export default function MarketingGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<TrendNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TrendNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [arbitragePlay, setArbitragePlay] = useState<TrendNode | null>(null);

  // Fetch global trends
  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch('/api/v1/trends/global');
        const data = await response.json();
        if (data.success) {
          setNodes(data.data);
          // Pick a random arbitrage play
          if (data.data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.data.length);
            setArbitragePlay(data.data[randomIndex]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  // Simple 2D globe visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.4;

      // Clear canvas with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw grid lines
      ctx.strokeStyle = '#1a1a1a';
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = centerY - (lat / 90) * radius;
        const xOffset = Math.cos((lat * Math.PI) / 180) * radius;
        ctx.beginPath();
        ctx.ellipse(centerX, y, xOffset, 20, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw meridians
      for (let lng = 0; lng < 360; lng += 30) {
        const x = centerX + Math.cos(((lng + rotation) * Math.PI) / 180) * radius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius);
        ctx.quadraticCurveTo(x, centerY, centerX, centerY + radius);
        ctx.stroke();
      }

      // Draw nodes
      nodes.forEach((node, index) => {
        const lng = node.coordinates.lng + rotation;
        const lat = node.coordinates.lat;
        
        const x = centerX + Math.cos((lng * Math.PI) / 180) * radius * Math.cos((lat * Math.PI) / 180);
        const y = centerY - radius * Math.sin((lat * Math.PI) / 180);
        
        // Check if node is on visible side of globe
        const z = Math.cos((lng * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180);
        if (z > 0) {
          const size = 4 + (index % 3) * 2;
          
          // Pulsing effect
          const pulse = Math.sin(Date.now() / 500 + index) * 1 + 1;
          
          // Draw node
          ctx.beginPath();
          ctx.arc(x, y, size * pulse, 0, Math.PI * 2);
          ctx.fillStyle = node.status_color;
          ctx.fill();
          
          // Glow effect
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
          gradient.addColorStop(0, node.status_color + '40');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      rotation += 0.1;
      animationId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes]);

  const handlePushToStudio = () => {
    if (arbitragePlay) {
      // Store in session and redirect
      sessionStorage.setItem('arbitrage_hook', arbitragePlay.strategy_data.hook);
      sessionStorage.setItem('arbitrage_angle', arbitragePlay.strategy_data.angle);
      window.location.href = '/dashboard/studio';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 400 }}>
      {/* Arbitrage Play Card */}
      {arbitragePlay && (
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          background: '#FFFFFF',
          borderRadius: 10,
          padding: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Arbitrage Play of the Day
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#191919' }}>
              {arbitragePlay.region_name}: "{arbitragePlay.strategy_data.hook}"
            </div>
          </div>
          <button
            onClick={handlePushToStudio}
            style={{
              padding: '8px 16px',
              background: '#191919',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Push to Studio
          </button>
        </div>
      )}

      {/* Globe Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
        onClick={() => {
          // Simple click - just show a random node's info
          if (nodes.length > 0) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            setSelectedNode(randomNode);
          }
        }}
      />

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#FFFFFF',
        }}>
          Loading Globe...
        </div>
      )}

      {/* Intelligence Card */}
      {selectedNode && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setSelectedNode(null)}
          />
          <IntelligenceCard
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onPushToStudio={() => {
              sessionStorage.setItem('arbitrage_hook', selectedNode.strategy_data.hook);
              sessionStorage.setItem('arbitrage_angle', selectedNode.strategy_data.angle);
              window.location.href = '/dashboard/studio';
            }}
          />
        </>
      )}
    </div>
  );
}
