'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe to avoid SSR issues and reduce initial bundle
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface TrendNode {
  id: string;
  region_name: string;
  coordinates: { lat: number; lng: number };
  niche: string;
  strategy_data: { hook: string; angle: string };
  status_color: string;
}

interface NodeData {
  id: string;
  lat: number;
  lng: number;
  region_name: string;
  niche: string;
  hook: string;
  angle: string;
  color: string;
  size: number;
}

export default function MarketingGlobe() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [arbitragePlay, setArbitragePlay] = useState<NodeData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Fetch global trends
  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch('/api/v1/trends/global');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const mappedNodes: NodeData[] = data.data.map((node: TrendNode) => ({
            id: node.id,
            lat: node.coordinates.lat,
            lng: node.coordinates.lng,
            region_name: node.region_name,
            niche: node.niche,
            hook: node.strategy_data.hook,
            angle: node.strategy_data.angle,
            color: node.status_color,
            size: 0.5,
          }));
          setNodes(mappedNodes);
          
          // Pick a random arbitrage play
          const randomIndex = Math.floor(Math.random() * mappedNodes.length);
          setArbitragePlay(mappedNodes[randomIndex]);
        }
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  // Handle resize for mobile optimization
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: Math.min(containerRef.current.offsetWidth, 500),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize globe controls
  useEffect(() => {
    if (globeRef.current) {
      const globe = globeRef.current;
      
      // Enable controls
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = true;
      globe.controls().minDistance = 150;
      globe.controls().maxDistance = 300;
      
      // Initial camera position
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, [nodes]);

  const handleNodeClick = useCallback((node: NodeData) => {
    if (globeRef.current) {
      // Smooth zoom to node
      globeRef.current.pointOfView(
        { lat: node.lat, lng: node.lng, altitude: 1.5 },
        1000
      );
    }
    setSelectedNode(node);
  }, []);

  const handlePushToStudio = useCallback((node?: NodeData) => {
    const data = node || arbitragePlay;
    if (data) {
      sessionStorage.setItem('arbitrage_hook', data.hook);
      sessionStorage.setItem('arbitrage_angle', data.angle);
      window.location.href = '/dashboard/studio';
    }
  }, [arbitragePlay]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: dimensions.height,
        background: '#000000',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* 3D Globe */}
      {!loading && nodes.length > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          
          // Globe styling - pitch black with dark charcoal
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundColor="#000000"
          
          // Atmosphere
          atmosphereColor="#1a1a1a"
          atmosphereAltitude={0.15}
          
          // Points (nodes)
          pointsData={nodes as object[]}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.02}
          pointColor={(d: object) => (d as NodeData).color}
          pointRadius={(d: object) => 0.3 + ((d as NodeData).size || 0.5) * 0.3}
          pointLabel={() => ''}
          onPointClick={(d: object) => handleNodeClick(d as NodeData)}
          
          // Mobile optimizations
          animateIn={true}
          
          // Disable expensive features for mobile
          enablePointerInteraction={true}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          color: '#858585',
          fontFamily: 'Inter, sans-serif',
        }}>
          Loading Globe...
        </div>
      )}

      {/* Arbitrage Play Card - Above Globe */}
      {arbitragePlay && (
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          background: '#191919',
          borderRadius: 10,
          padding: 14,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Arbitrage Play of the Day
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
              {arbitragePlay.region_name}: "{arbitragePlay.hook}"
            </div>
          </div>
          <button
            onClick={() => handlePushToStudio()}
            style={{
              padding: '8px 14px',
              background: '#22C55E',
              color: '#000000',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Push to Studio →
          </button>
        </div>
      )}

      {/* Intelligence Card Overlay */}
      {selectedNode && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 100,
            }}
            onClick={() => setSelectedNode(null)}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#191919',
            borderRadius: '20px 20px 0 0',
            padding: 24,
            zIndex: 101,
            maxHeight: '60vh',
            overflow: 'auto',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                  {selectedNode.region_name}
                </h3>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: selectedNode.color === '#22C55E' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: selectedNode.color,
                }}>
                  {selectedNode.niche}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 28,
                  cursor: 'pointer',
                  color: '#858585',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            
            {/* Intelligence Content */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Top Performing Hook
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', marginBottom: 16, lineHeight: 1.4 }}>
                "{selectedNode.hook}"
              </p>
              
              <div style={{ fontSize: 11, fontWeight: 700, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Active Competitor Angles
              </div>
              <p style={{ fontSize: 14, color: '#E0E0E0', marginBottom: 16, lineHeight: 1.5 }}>
                {selectedNode.angle}
              </p>
              
              <div style={{ fontSize: 11, fontWeight: 700, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Local Psychology Shift
              </div>
              <p style={{ fontSize: 14, color: '#E0E0E0', lineHeight: 1.5 }}>
                Consumers in {selectedNode.region_name} are responding to value-first messaging over brand recognition.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handlePushToStudio(selectedNode)}
              style={{
                width: '100%',
                padding: 14,
                background: '#22C55E',
                color: '#000000',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Push to Studio →
            </button>
          </div>
        </>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        display: 'flex',
        gap: 16,
        fontSize: 11,
        color: '#858585',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
          High Converting
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
          Saturated
        </div>
      </div>
    </div>
  );
}
