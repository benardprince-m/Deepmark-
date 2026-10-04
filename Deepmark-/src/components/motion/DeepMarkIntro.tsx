'use client';

import { useEffect, useState } from 'react';
import DeepMarkMascot from './DeepMarkMascot';

type DeepMarkIntroProps = {
  onComplete: () => void;
};

export default function DeepMarkIntro({ onComplete }: DeepMarkIntroProps) {
  const [phase, setPhase] = useState<'awakening' | 'orb' | 'resolve' | 'done'>('awakening');
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(() => onComplete(), 900);
      return () => window.clearTimeout(timer);
    }

    const timers = [
      window.setTimeout(() => setPhase('orb'), 1800),
      window.setTimeout(() => setPhase('resolve'), 5000),
      window.setTimeout(() => setPhase('done'), 6600),
      window.setTimeout(onComplete, 7000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [onComplete, reducedMotion]);

  if (phase === 'done') return null;

  return (
    <div className={`dm-intro ${phase === 'orb' || phase === 'resolve' ? 'dm-intro-orbing' : ''} ${reducedMotion ? 'dm-reduced-motion' : ''}`}>
      <div className="dm-intro-grid" />
      <div className="dm-intro-mark">
        <DeepMarkMascot
          state={phase === 'resolve' ? 'complete' : phase === 'orb' ? 'reasoning' : 'welcome'}
          size={220}
          showOrb={phase === 'orb' || phase === 'resolve'}
        />
        <div className="dm-intro-copy">
          <span className="dm-intro-kicker">DEEP<span>MARK</span></span>
          <span className="dm-intro-tagline">Memory for the next move.</span>
        </div>
      </div>
      <button className="dm-intro-skip" onClick={onComplete} type="button">Skip intro</button>
    </div>
  );
}
