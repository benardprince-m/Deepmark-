'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type MascotState = 'idle' | 'welcome' | 'listening' | 'searching' | 'reasoning' | 'solving' | 'complete' | 'error';

type DeepMarkMascotProps = {
  state?: MascotState;
  size?: number;
  interactive?: boolean;
  showOrb?: boolean;
  className?: string;
};

const PARTICLES = Array.from({ length: 18 }, (_, index) => {
  const angle = (index / 18) * Math.PI * 2;
  const radius = 46 + (index % 3) * 8;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    delay: `${(index % 6) * 110}ms`,
    size: index % 4 === 0 ? 3 : 2,
  };
});

export default function DeepMarkMascot({
  state = 'idle',
  size = 180,
  interactive = true,
  showOrb = false,
  className = '',
}: DeepMarkMascotProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const eyeOffset = useMemo(() => ({
    x: reducedMotion ? 0 : pointer.x * 3.5,
    y: reducedMotion ? 0 : pointer.y * 2.5,
  }), [pointer, reducedMotion]);

  const activeOrb = showOrb || ['searching', 'reasoning', 'solving'].includes(state);
  const signalColor = state === 'error' ? '#EF4444' : state === 'complete' ? '#22C55E' : '#F8FAFC';
  const motionClass = reducedMotion ? 'dm-reduced-motion' : '';

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  return (
    <div
      className={`dm-mascot-shell dm-state-${state} ${activeOrb ? 'dm-orb-active' : ''} ${motionClass} ${className}`}
      style={{ width: size, height: size }}
      aria-label={`DeepMark ${state}`}
      role="img"
    >
      <svg
        viewBox="0 0 180 180"
        width={size}
        height={size}
        className="dm-mascot-svg"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setPointer({ x: 0, y: 0 })}
      >
        <defs>
          <radialGradient id="dm-core" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={state === 'error' ? '#EF4444' : '#22C55E'} stopOpacity=".24" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </radialGradient>
          <filter id="dm-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <circle className="dm-orb-halo" cx="90" cy="90" r="70" fill="url(#dm-core)" />

        {PARTICLES.map((particle, index) => (
          <circle
            key={index}
            className="dm-orb-particle"
            cx={90 + particle.x}
            cy={90 + particle.y}
            r={particle.size}
            style={{ animationDelay: particle.delay }}
            fill={signalColor}
          />
        ))}

        <g className="dm-mascot-body">
          <path
            d="M90 27C56 27 35 48 35 83c0 36 20 61 55 70 35-9 55-34 55-70 0-35-21-56-55-56Z"
            fill="#0A0A0A"
            stroke="#F8FAFC"
            strokeWidth="2.5"
          />
          <path
            d="M51 65c5-14 17-23 31-25M129 65c-5-14-17-23-31-25"
            fill="none"
            stroke="#22C55E"
            strokeLinecap="round"
            strokeWidth="3"
            opacity=".8"
          />
          <g
            className="dm-eyes"
            transform={`translate(${eyeOffset.x} ${eyeOffset.y})`}
          >
            <path d="M56 79l18-10" stroke={signalColor} strokeLinecap="round" strokeWidth="7" />
            <path d="M124 69l-18 10" stroke={signalColor} strokeLinecap="round" strokeWidth="7" />
            <circle className="dm-eye-glow" cx="65" cy="75" r="15" fill={signalColor} opacity=".12" filter="url(#dm-soft-glow)" />
            <circle className="dm-eye-glow" cx="115" cy="75" r="15" fill={signalColor} opacity=".12" filter="url(#dm-soft-glow)" />
          </g>
          <path
            className="dm-mouth"
            d={state === 'complete' ? 'M77 106c8 7 18 7 26 0' : state === 'error' ? 'M78 111c8-5 16-5 24 0' : 'M82 108h16'}
            fill="none"
            stroke="#F8FAFC"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <circle cx="90" cy="139" r="2" fill="#22C55E" />
        </g>
      </svg>
    </div>
  );
}
