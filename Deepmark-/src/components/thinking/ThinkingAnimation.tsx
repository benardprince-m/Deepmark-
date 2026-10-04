'use client';

import { useEffect, useRef, useState } from 'react';
import DeepMarkMascot from '@/components/motion/DeepMarkMascot';

type ThinkingPhase = 'searching' | 'reasoning' | 'solving' | 'complete' | 'error' | 'idle';

type ThinkingAnimationProps = {
  isActive: boolean;
  onFirstToken?: () => void;
  width?: number;
  height?: number;
};

const PHASES: Array<{ name: ThinkingPhase; duration: number; label: string }> = [
  { name: 'searching', duration: 1500, label: 'Searching startup memory' },
  { name: 'reasoning', duration: 2200, label: 'Connecting the useful signals' },
  { name: 'solving', duration: 1600, label: 'Shaping the next move' },
];

export default function ThinkingAnimation({ isActive, onFirstToken, width = 250, height = 140 }: ThinkingAnimationProps) {
  const [phase, setPhase] = useState<ThinkingPhase>('idle');
  const [label, setLabel] = useState('');
  const startedAt = useRef<number | null>(null);
  const tokenSent = useRef(false);

  useEffect(() => {
    if (!isActive) {
      startedAt.current = null;
      tokenSent.current = false;
      return;
    }

    startedAt.current = performance.now();
    tokenSent.current = false;
    let frame = 0;

    const tick = (now: number) => {
      let remaining = now - (startedAt.current ?? now);
      let next = PHASES[PHASES.length - 1];
      for (const candidate of PHASES) {
        if (remaining <= candidate.duration) {
          next = candidate;
          break;
        }
        remaining -= candidate.duration;
      }
      setPhase(next.name);
      setLabel(next.label);
      if (next.name === 'solving' && remaining > next.duration * 0.35 && !tokenSent.current) {
        tokenSent.current = true;
        onFirstToken?.();
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, onFirstToken]);

  const active = isActive && phase !== 'idle';
  return (
    <div className="dm-thinking" style={{ width, minHeight: height }} aria-live="polite">
      <DeepMarkMascot state={active ? phase : 'idle'} size={Math.min(width, 150)} showOrb={active} />
      {active && <span className="dm-thinking-label">{label}<span className="dm-thinking-dots">...</span></span>}
    </div>
  );
}
