// Thinking Panel Types

export type ThinkingStage = 
  | 'idle'
  | 'understanding'
  | 'retrieving_memory'
  | 'selecting_skills'
  | 'building_prompt'
  | 'selecting_provider'
  | 'calling_provider'
  | 'validating_response'
  | 'returning_result'
  | 'error';

export interface ThinkingStep {
  stage: ThinkingStage;
  label: string;
  description?: string;
  progress?: number; // 0-100 for indeterminate progress
  timestamp: number;
}

export interface ThinkingState {
  isActive: boolean;
  currentStage: ThinkingStage;
  steps: ThinkingStep[];
  startTime?: number;
  endTime?: number;
  error?: string;
}

export const THINKING_STAGES: Record<ThinkingStage, { label: string; description: string }> = {
  idle: {
    label: 'Ready',
    description: 'Waiting for input'
  },
  understanding: {
    label: 'Understanding',
    description: 'Parsing your request and identifying intent'
  },
  retrieving_memory: {
    label: 'Retrieving Memory',
    description: 'Fetching relevant context from your workspace'
  },
  selecting_skills: {
    label: 'Selecting Skills',
    description: 'Identifying applicable execution skills'
  },
  building_prompt: {
    label: 'Building Prompt',
    description: 'Constructing the optimal prompt with full context'
  },
  selecting_provider: {
    label: 'Selecting Provider',
    description: 'Choosing the best AI provider for this task'
  },
  calling_provider: {
    label: 'Generating',
    description: 'Calling AI provider and receiving response'
  },
  validating_response: {
    label: 'Validating',
    description: 'Verifying response quality and format'
  },
  returning_result: {
    label: 'Complete',
    description: 'Presenting results'
  },
  error: {
    label: 'Error',
    description: 'An error occurred during processing'
  }
};
