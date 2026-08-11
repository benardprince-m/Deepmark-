'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type ThinkingPhase = 'search' | 'analyze' | 'generate' | 'complete' | 'error' | 'idle';

interface ThinkingAnimationProps {
  isActive: boolean;
  onFirstToken?: () => void;
  width?: number;
  height?: number;
}

const PHASE_DURATION = {
  search: 1500,
  analyze: 2000,
  generate: 1500,
};

const PHASE_LABELS = {
  search: '🔍 Searching Global Globe...',
  analyze: '🧠 Analyzing Regional Hooks...',
  generate: '✍️ Injecting Anti-Slop Differentiation...',
};

export default function ThinkingAnimation({
  isActive,
  onFirstToken,
  width = 200,
  height = 80,
}: ThinkingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const ballRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, active: false });
  const phaseRef = useRef<ThinkingPhase>('idle');
  const [phase, setPhase] = useState<ThinkingPhase>('idle');
  const [label, setLabel] = useState('');
  const [error, setError] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false
  );

  const easeOutQuad = (t: number) => t * (2 - t);
  const easeInQuad = (t: number) => t * t;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    
    // Calculate current phase based on elapsed time
    let currentPhase: ThinkingPhase = 'search';
    let phaseProgress = 0;
    let totalProgress = 0;

    if (phaseRef.current === 'complete' || phaseRef.current === 'error') {
      currentPhase = phaseRef.current;
    } else if (phaseRef.current !== 'idle') {
      let accumulated = 0;
      
      // Search phase
      if (elapsed < PHASE_DURATION.search) {
        currentPhase = 'search';
        phaseProgress = elapsed / PHASE_DURATION.search;
        totalProgress = phaseProgress * 0.25;
      } else {
        accumulated += PHASE_DURATION.search;
        
        // Analyze phase
        if (elapsed < accumulated + PHASE_DURATION.analyze) {
          currentPhase = 'analyze';
          phaseProgress = (elapsed - accumulated) / PHASE_DURATION.analyze;
          totalProgress = 0.25 + phaseProgress * 0.35;
        } else {
          accumulated += PHASE_DURATION.analyze;
          
          // Generate phase
          if (elapsed < accumulated + PHASE_DURATION.generate) {
            currentPhase = 'generate';
            phaseProgress = (elapsed - accumulated) / PHASE_DURATION.generate;
            totalProgress = 0.6 + phaseProgress * 0.4;
          } else {
            currentPhase = 'complete';
            totalProgress = 1;
          }
        }
      }
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const paddleWidth = 24;
    const paddleHeight = 4;
    const paddleY = centerY;
    
    // Paddle positions (slight angle to form / and \)
    const leftPaddleX = centerX - 50;
    const rightPaddleX = centerX + 50;
    
    // Ball physics
    const phase = currentPhase as string;
    if (!ballRef.current.active && phase !== 'idle' && phase !== 'complete' && phase !== 'error') {
      ballRef.current = {
        x: centerX,
        y: 0,
        vx: (Math.random() - 0.5) * 2,
        vy: 3,
        active: true,
      };
    }

    // Update ball position with gravity and bounce
    if (ballRef.current.active && phase !== 'idle' && phase !== 'complete' && phase !== 'error') {
      const ball = ballRef.current;
      
      // Apply gravity
      ball.vy += 0.15;
      
      // Apply velocity
      ball.x += ball.vx;
      ball.y += ball.vy;
      
      // Left paddle bounce
      if (ball.x < leftPaddleX + paddleWidth / 2 && ball.x > leftPaddleX - paddleWidth / 2) {
        if (ball.y > paddleY - 15 && ball.y < paddleY + 15) {
          ball.x = leftPaddleX + paddleWidth / 2 + 1;
          ball.vx = Math.abs(ball.vx) * 0.95 + Math.random() * 0.5;
          ball.vy = -Math.abs(ball.vy) * 0.9 + (Math.random() - 0.5) * 2;
        }
      }
      
      // Right paddle bounce
      if (ball.x > rightPaddleX - paddleWidth / 2 && ball.x < rightPaddleX + paddleWidth / 2) {
        if (ball.y > paddleY - 15 && ball.y < paddleY + 15) {
          ball.x = rightPaddleX - paddleWidth / 2 - 1;
          ball.vx = -Math.abs(ball.vx) * 0.95 - Math.random() * 0.5;
          ball.vy = -Math.abs(ball.vy) * 0.9 + (Math.random() - 0.5) * 2;
        }
      }
      
      // Boundary bounce
      if (ball.y > canvas.height - 10) {
        ball.y = canvas.height - 10;
        ball.vy = -ball.vy * 0.8;
      }
      
      // Reset ball if it goes off sides
      if (ball.x < 0 || ball.x > canvas.width || ball.y < 0) {
        ball.x = centerX;
        ball.y = 0;
        ball.vx = (Math.random() - 0.5) * 2;
        ball.vy = 3;
      }
      
      // Trigger first token callback on generate phase
      if (currentPhase === 'generate' && phaseProgress > 0.3 && onFirstToken) {
        onFirstToken();
      }
    }

    // Calculate glow intensity (0 to 1)
    const glowIntensity = currentPhase === 'error' ? 1 : easeOutQuad(totalProgress);
    
    // Determine colors
    const nodeColor = currentPhase === 'error' ? '#EF4444' : '#22C55E';
    const glowColor = currentPhase === 'error' ? 'rgba(239, 68, 68,' : 'rgba(34, 197, 94,';
    
    // Draw glows
    const drawGlow = (x: number, y: number, size: number, intensity: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `${glowColor}${intensity * 0.8})`);
      gradient.addColorStop(0.5, `${glowColor}${intensity * 0.3})`);
      gradient.addColorStop(1, `${glowColor}0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw left paddle ( / )
    ctx.save();
    ctx.translate(leftPaddleX, paddleY);
    ctx.rotate(-0.2);
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 10 + glowIntensity * 20;
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.roundRect(-paddleWidth / 2, -paddleHeight / 2, paddleWidth, paddleHeight, 2);
    ctx.fill();
    ctx.restore();

    // Draw right paddle ( \ )
    ctx.save();
    ctx.translate(rightPaddleX, paddleY);
    ctx.rotate(0.2);
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 10 + glowIntensity * 20;
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.roundRect(-paddleWidth / 2, -paddleHeight / 2, paddleWidth, paddleHeight, 2);
    ctx.fill();
    ctx.restore();

    // Draw ball with glow
    if (ballRef.current.active) {
      drawGlow(ballRef.current.x, ballRef.current.y, 30 + glowIntensity * 20, glowIntensity);
      
      ctx.shadowColor = nodeColor;
      ctx.shadowBlur = 15 + glowIntensity * 25;
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, 6 + glowIntensity * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Continue animation
    if (phase !== 'complete' && phase !== 'error' && phase !== 'idle') {
      animationRef.current = requestAnimationFrame(draw);
    }

    // Update React state for label
    if (currentPhase !== phaseRef.current) {
      setPhase(currentPhase);
      if (PHASE_LABELS[currentPhase as keyof typeof PHASE_LABELS]) {
        setLabel(PHASE_LABELS[currentPhase as keyof typeof PHASE_LABELS]);
      }
      if (currentPhase === 'error') {
        setError(true);
      }
    }
  }, [onFirstToken]);

  useEffect(() => {
    if (isActive && !prefersReducedMotion.current) {
      // Start animation
      phaseRef.current = 'search';
      startTimeRef.current = Date.now();
      ballRef.current = { x: 0, y: 0, vx: 0, vy: 0, active: false };
      setPhase('search');
      setLabel(PHASE_LABELS.search);
      setError(false);
      
      animationRef.current = requestAnimationFrame(draw);
    } else if (!isActive) {
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      phaseRef.current = 'idle';
      ballRef.current = { x: 0, y: 0, vx: 0, vy: 0, active: false };
      setPhase('idle');
      setLabel('');
      setError(false);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, draw]);

  // Listen for reduced motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Reduced motion fallback
  if (prefersReducedMotion.current) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 8 
      }}>
        <div style={{ 
          fontFamily: 'Inter, monospace', 
          fontSize: 32, 
          fontWeight: 700,
          color: isActive ? '#22C55E' : '#525252',
        }}>
          //
        </div>
        {label && (
          <div style={{ 
            fontSize: 12, 
            color: '#858585',
            textAlign: 'center',
          }}>
            {label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 12 
    }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
        }}
      />
      {label && (
        <div style={{ 
          fontSize: 12, 
          color: error ? '#EF4444' : '#858585',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          transition: 'color 0.3s ease',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
