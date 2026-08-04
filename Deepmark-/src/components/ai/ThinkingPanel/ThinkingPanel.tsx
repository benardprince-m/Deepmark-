'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { ThinkingStage, ThinkingState, THINKING_STAGES } from './types';

// Context for sharing thinking state
interface ThinkingContextValue {
  state: ThinkingState;
  startThinking: () => void;
  setStage: (stage: ThinkingStage, description?: string) => void;
  completeThinking: () => void;
  errorThinking: (error: string) => void;
  resetThinking: () => void;
}

const ThinkingContext = createContext<ThinkingContextValue | null>(null);

export function useThinking() {
  const context = useContext(ThinkingContext);
  if (!context) {
    throw new Error('useThinking must be used within a ThinkingProvider');
  }
  return context;
}

interface ThinkingProviderProps {
  children: ReactNode;
  onThinkingChange?: (state: ThinkingState) => void;
}

export function ThinkingProvider({ children, onThinkingChange }: ThinkingProviderProps) {
  const [state, setState] = useState<ThinkingState>({
    isActive: false,
    currentStage: 'idle',
    steps: [],
    startTime: undefined,
    endTime: undefined,
    error: undefined
  });

  const startThinking = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStage: 'understanding',
      steps: [{
        stage: 'understanding',
        label: 'Understanding',
        timestamp: now
      }],
      startTime: now,
      endTime: undefined,
      error: undefined
    }));
  }, []);

  const setStage = useCallback((stage: ThinkingStage, description?: string) => {
    setState(prev => {
      if (!prev.isActive) return prev;
      
      const now = Date.now();
      const newSteps = [...prev.steps];
      
      // Add new step
      newSteps.push({
        stage,
        label: THINKING_STAGES[stage]?.label || stage,
        description: description || THINKING_STAGES[stage]?.description,
        timestamp: now
      });
      
      return {
        ...prev,
        currentStage: stage,
        steps: newSteps
      };
    });
  }, []);

  const completeThinking = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      isActive: false,
      currentStage: 'returning_result',
      steps: [...prev.steps, {
        stage: 'returning_result',
        label: 'Complete',
        timestamp: now
      }],
      endTime: now
    }));
  }, []);

  const errorThinking = useCallback((error: string) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      isActive: false,
      currentStage: 'error',
      steps: [...prev.steps, {
        stage: 'error',
        label: 'Error',
        description: error,
        timestamp: now
      }],
      endTime: now,
      error
    }));
  }, []);

  const resetThinking = useCallback(() => {
    setState({
      isActive: false,
      currentStage: 'idle',
      steps: [],
      startTime: undefined,
      endTime: undefined,
      error: undefined
    });
  }, []);

  // Notify parent of state changes
  useEffect(() => {
    onThinkingChange?.(state);
  }, [state, onThinkingChange]);

  return (
    <ThinkingContext.Provider value={{
      state,
      startThinking,
      setStage,
      completeThinking,
      errorThinking,
      resetThinking
    }}>
      {children}
    </ThinkingContext.Provider>
  );
}

// Visual representation of thinking stages
export function ThinkingIndicator({ state }: { state: ThinkingState }) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | undefined>(state.startTime);
  
  // Update elapsed time
  useEffect(() => {
    startTimeRef.current = state.startTime;
    if (state.startTime && state.isActive) {
      const interval = setInterval(() => {
        if (startTimeRef.current) {
          setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (state.endTime && state.startTime) {
      const finalElapsed = Math.round((state.endTime - state.startTime) / 1000);
      // Use requestAnimationFrame to avoid synchronous setState
      const frameId = requestAnimationFrame(() => {
        setElapsed(finalElapsed);
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [state.startTime, state.endTime, state.isActive]);

  if (state.currentStage === 'idle') {
    return null;
  }

  const isError = state.currentStage === 'error';
  const isComplete = state.currentStage === 'returning_result';
  const isActive = state.isActive;

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Spinner for active states */}
      {isActive && (
        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
      )}
      
      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full ${
        isError ? 'bg-red-500' : 
        isComplete ? 'bg-[#28C76F]' : 
        'bg-black animate-pulse'
      }`} />
      
      {/* Current stage label */}
      <span className={isError ? 'text-red-600' : 'text-black'}>
        {THINKING_STAGES[state.currentStage]?.label || state.currentStage}
      </span>
      
      {/* Time elapsed */}
      {elapsed > 0 && (
        <span className="text-[#858585]">
          ({elapsed}s)
        </span>
      )}
    </div>
  );
}

// Progress bar for thinking stages
export function ThinkingProgress({ state }: { state: ThinkingState }) {
  const stages: ThinkingStage[] = [
    'understanding',
    'retrieving_memory',
    'selecting_skills',
    'building_prompt',
    'selecting_provider',
    'calling_provider',
    'validating_response',
    'returning_result'
  ];

  const currentIndex = stages.indexOf(state.currentStage);
  const progress = state.currentStage === 'error' ? 100 : 
    state.currentStage === 'idle' ? 0 :
    ((currentIndex / (stages.length - 1)) * 100);

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1 bg-[#E8E8E8] rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            state.currentStage === 'error' ? 'bg-red-500' : 'bg-black'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      {/* Stage labels */}
      <div className="flex justify-between mt-1">
        {stages.slice(0, 5).map((stage, idx) => (
          <span 
            key={stage}
            className={`text-[10px] ${
              idx <= currentIndex ? 'text-black' : 'text-[#B0B0B0]'
            }`}
          >
            {THINKING_STAGES[stage].label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Complete thinking panel UI
export function ThinkingPanel({ state }: { state: ThinkingState }) {
  if (state.currentStage === 'idle' && state.steps.length === 0) {
    return null;
  }

  return (
    <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-black">DeepMark is thinking...</h3>
        <ThinkingIndicator state={state} />
      </div>
      
      {/* Progress */}
      <ThinkingProgress state={state} />
      
      {/* Steps */}
      {state.steps.length > 0 && (
        <div className="mt-4 space-y-2">
          {state.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                idx === state.steps.length - 1 
                  ? (state.currentStage === 'error' ? 'bg-red-500' : 'bg-black')
                  : 'bg-[#28C76F]'
              }`} />
              <div>
                <span className="font-medium text-black">{step.label}</span>
                {step.description && (
                  <p className="text-[#858585] text-xs">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Error message */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {state.error}
        </div>
      )}
    </div>
  );
}

export default ThinkingPanel;
