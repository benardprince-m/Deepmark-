/**
 * DeepMark Memory Quality Gates
 * Memory scoring, quality assessment, and pruning
 */

import { logger, metrics } from '../observability';

export interface MemoryEntry {
  id: string;
  workspace_id: string;
  type: 'preference' | 'context' | 'history' | 'correction' | 'insight';
  key: string;
  value: string;
  score: number;
  access_count: number;
  last_accessed: number;
  created_at: number;
  updated_at: number;
  importance: number; // 0-1
  relevance_decay: number; // How quickly this becomes less relevant
  metadata?: Record<string, unknown>;
}

export interface MemoryScore {
  total: number;
  breakdown: {
    relevance: number;
    accuracy: number;
    recency: number;
    importance: number;
    usage: number;
  };
  suggestions: string[];
}

export interface QualityGateResult {
  passed: boolean;
  score: number;
  reasons: string[];
  suggestedActions: ('improve' | 'prune' | 'merge' | 'expand')[];
}

// Scoring weights
const SCORING_WEIGHTS = {
  relevance: 0.25,    // How relevant to current context
  accuracy: 0.25,     // How accurate/correct the memory is
  recency: 0.15,      // How recently accessed
  importance: 0.20,   // User-defined or inferred importance
  usage: 0.15,        // How frequently accessed
};

// Thresholds
const QUALITY_THRESHOLDS = {
  minScore: 0.3,      // Minimum score to keep
  pruneScore: 0.15,   // Below this = prune
  mergeScore: 0.4,    // Below this = consider merging
  expandScore: 0.7,    // Above this = candidate for expansion
};

/**
 * Calculate quality score for a memory entry
 */
export function scoreMemory(
  memory: MemoryEntry,
  currentContext?: {
    topic?: string;
    recentKeys?: string[];
    timeSinceLastAccess?: number;
  }
): MemoryScore {
  const breakdown = {
    relevance: 0,
    accuracy: 0,
    recency: 0,
    importance: 0,
    usage: 0,
  };

  const suggestions: string[] = [];

  // Relevance: Based on current context
  if (currentContext?.topic && memory.key.includes(currentContext.topic)) {
    breakdown.relevance = 1.0;
  } else if (currentContext?.recentKeys?.includes(memory.key)) {
    breakdown.relevance = 0.8;
  } else if (memory.access_count > 0) {
    breakdown.relevance = 0.5;
  } else {
    breakdown.relevance = 0.2;
  }

  // Accuracy: Based on metadata quality
  const meta = memory.metadata as Record<string, unknown> | undefined;
  if (meta?.verified) {
    breakdown.accuracy = 1.0;
  } else if ((meta?.correction_count as number) > 0) {
    breakdown.accuracy = Math.max(0.3, 1 - ((meta?.correction_count as number) || 0) * 0.2);
  } else {
    breakdown.accuracy = 0.7; // Default assumption
  }

  // Recency: Based on last access time
  const now = Date.now();
  const ageHours = (now - memory.last_accessed) / (1000 * 60 * 60);
  // 30 days full relevance window
  const _relevanceHours = 24 * 30;
  
  if (ageHours < 1) {
    breakdown.recency = 1.0;
  } else if (ageHours < 24) {
    breakdown.recency = 0.9;
  } else if (ageHours < 168) { // 1 week
    breakdown.recency = 0.7;
  } else if (ageHours < 720) { // 30 days
    breakdown.recency = 0.5 * (1 - ageHours / 720);
  } else {
    breakdown.recency = 0.1;
  }

  // Importance: Based on user-defined importance and type
  breakdown.importance = memory.importance;
  
  // Adjust based on type
  if (memory.type === 'preference') breakdown.importance *= 1.2;
  if (memory.type === 'correction') breakdown.importance *= 1.1;
  if (memory.type === 'insight') breakdown.importance *= 0.9;
  
  breakdown.importance = Math.min(1, breakdown.importance);

  // Usage: Based on access frequency
  if (memory.access_count > 10) {
    breakdown.usage = 1.0;
  } else if (memory.access_count > 5) {
    breakdown.usage = 0.8;
  } else if (memory.access_count > 2) {
    breakdown.usage = 0.6;
  } else if (memory.access_count > 0) {
    breakdown.usage = 0.4;
  } else {
    breakdown.usage = 0.2; // Never accessed
  }

  // Calculate total score
  const total =
    breakdown.relevance * SCORING_WEIGHTS.relevance +
    breakdown.accuracy * SCORING_WEIGHTS.accuracy +
    breakdown.recency * SCORING_WEIGHTS.recency +
    breakdown.importance * SCORING_WEIGHTS.importance +
    breakdown.usage * SCORING_WEIGHTS.usage;

  // Generate suggestions
  if (total < QUALITY_THRESHOLDS.minScore) {
    suggestions.push('Memory score below minimum threshold');
  }
  if (breakdown.accuracy < 0.5) {
    suggestions.push('Low accuracy score - verify information');
  }
  if (breakdown.relevance < 0.3) {
    suggestions.push('Low relevance - may need context update');
  }
  if (breakdown.usage < 0.3 && memory.access_count > 0) {
    suggestions.push('Low usage - consider consolidating with similar memories');
  }

  return {
    total: Math.round(total * 100) / 100,
    breakdown,
    suggestions,
  };
}

/**
 * Evaluate if a memory passes quality gates
 */
export function evaluateQualityGate(
  memory: MemoryEntry,
  context?: {
    topic?: string;
    recentKeys?: string[];
  }
): QualityGateResult {
  const score = scoreMemory(memory, context);
  
  const reasons: string[] = [];
  const suggestedActions: ('improve' | 'prune' | 'merge' | 'expand')[] = [];

  // Check thresholds
  if (score.total >= QUALITY_THRESHOLDS.expandScore) {
    suggestedActions.push('expand');
    reasons.push('High quality - candidate for expansion');
  }
  
  if (score.total >= QUALITY_THRESHOLDS.minScore && score.total < QUALITY_THRESHOLDS.mergeScore) {
    suggestedActions.push('merge');
    reasons.push('Moderate quality - consider merging with similar entries');
  }
  
  if (score.total < QUALITY_THRESHOLDS.minScore && score.total >= QUALITY_THRESHOLDS.pruneScore) {
    suggestedActions.push('improve');
    reasons.push('Below minimum - needs improvement');
  }
  
  if (score.total < QUALITY_THRESHOLDS.pruneScore) {
    suggestedActions.push('prune');
    reasons.push('Very low score - recommend pruning');
  }

  // Add score-based reasons
  if (score.breakdown.accuracy < 0.5) {
    reasons.push('Low accuracy detected');
  }
  if (score.breakdown.usage < 0.3 && memory.access_count > 3) {
    reasons.push('Declining usage pattern');
  }

  return {
    passed: score.total >= QUALITY_THRESHOLDS.minScore,
    score: score.total,
    reasons,
    suggestedActions,
  };
}

/**
 * Prune low-quality memories
 */
export function pruneMemories(
  memories: MemoryEntry[],
  options: {
    maxMemories?: number;
    aggressive?: boolean;
  } = {}
): { keep: MemoryEntry[]; prune: MemoryEntry[] } {
  const { maxMemories = 100, aggressive = false } = options;
  
  // Score all memories
  const scored = memories.map((m) => ({
    memory: m,
    score: scoreMemory(m),
    quality: evaluateQualityGate(m),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score.total - a.score.total);

  const keep: MemoryEntry[] = [];
  const prune: MemoryEntry[] = [];

  for (const item of scored) {
    const threshold = aggressive 
      ? QUALITY_THRESHOLDS.pruneScore 
      : QUALITY_THRESHOLDS.minScore;

    if (keep.length < maxMemories && item.score.total >= threshold) {
      keep.push(item.memory);
    } else {
      prune.push(item.memory);
    }
  }

  logger.info('Memory pruning complete', {
    total: memories.length,
    kept: keep.length,
    pruned: prune.length,
    aggressive,
  });

  metrics.histogram('memory.pruned_count', prune.length);
  metrics.histogram('memory.avg_score_kept', 
    keep.reduce((sum, m) => sum + m.score, 0) / (keep.length || 1)
  );

  return { keep, prune };
}

/**
 * Find similar memories that could be merged
 */
export function findSimilarMemories(
  memories: MemoryEntry[],
  target: MemoryEntry,
  similarityThreshold: number = 0.7
): MemoryEntry[] {
  return memories.filter((m) => {
    if (m.id === target.id) return false;
    
    // Check key similarity
    const keySimilarity = calculateSimilarity(target.key, m.key);
    if (keySimilarity >= similarityThreshold) return true;
    
    // Check type match
    if (m.type === target.type) {
      const valueSimilarity = calculateSimilarity(target.value, m.value);
      if (valueSimilarity >= similarityThreshold) return true;
    }
    
    return false;
  });
}

/**
 * Simple string similarity (Jaccard index)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Merge similar memories
 */
export function mergeMemories(
  primary: MemoryEntry,
  secondary: MemoryEntry
): MemoryEntry {
  // Keep the higher score
  const keep = primary.score >= secondary.score ? primary : secondary;
  
  return {
    ...keep,
    access_count: Math.max(primary.access_count, secondary.access_count),
    last_accessed: Math.max(primary.last_accessed, secondary.last_accessed),
    importance: Math.max(primary.importance, secondary.importance),
    updated_at: Date.now(),
    metadata: {
      ...primary.metadata,
      ...secondary.metadata,
      merged_from: [primary.id, secondary.id],
      merge_count: ((primary.metadata?.merge_count as number) || 0) + 1,
    },
  };
}

/**
 * Update memory score after access
 */
export function updateMemoryAccess(memory: MemoryEntry): MemoryEntry {
  const now = Date.now();
  const hoursSinceAccess = (now - memory.last_accessed) / (1000 * 60 * 60);
  
  // Boost score for recent access
  let recencyBoost = 0;
  if (hoursSinceAccess < 1) recencyBoost = 0.1;
  else if (hoursSinceAccess < 24) recencyBoost = 0.05;
  
  // Calculate new score based on updated metrics
  const scoreResult = scoreMemory({
    ...memory,
    last_accessed: now,
    access_count: memory.access_count + 1,
  });

  return {
    ...memory,
    score: Math.min(1, scoreResult.total + recencyBoost),
    access_count: memory.access_count + 1,
    last_accessed: now,
    updated_at: now,
  };
}

/**
 * Get memory health report
 */
export function getMemoryHealthReport(memories: MemoryEntry[]): {
  total: number;
  avgScore: number;
  byType: Record<string, { count: number; avgScore: number }>;
  byStatus: {
    healthy: number;
    needsAttention: number;
    prune: number;
  };
  recommendations: string[];
} {
  const byType: Record<string, { count: number; totalScore: number }> = {};
  let totalScore = 0;
  let healthy = 0;
  let needsAttention = 0;
  let prune = 0;
  const recommendations: string[] = [];

  for (const memory of memories) {
    const score = scoreMemory(memory);
    totalScore += score.total;
    
    // By type
    if (!byType[memory.type]) {
      byType[memory.type] = { count: 0, totalScore: 0 };
    }
    byType[memory.type].count++;
    byType[memory.type].totalScore += score.total;

    // By status
    if (score.total >= QUALITY_THRESHOLDS.expandScore) {
      healthy++;
    } else if (score.total >= QUALITY_THRESHOLDS.minScore) {
      healthy++;
    } else if (score.total >= QUALITY_THRESHOLDS.pruneScore) {
      needsAttention++;
    } else {
      prune++;
    }
  }

  // Generate recommendations
  if (prune > memories.length * 0.2) {
    recommendations.push(`Consider pruning ${prune} low-quality memories`);
  }
  if (memories.length > 100) {
    recommendations.push('Memory count is high - consider consolidating similar entries');
  }
  if (healthy / memories.length < 0.5) {
    recommendations.push('Less than 50% memories are healthy - review memory quality');
  }

  const typeStats: Record<string, { count: number; avgScore: number }> = {};
  for (const [type, stats] of Object.entries(byType)) {
    typeStats[type] = {
      count: stats.count,
      avgScore: stats.totalScore / stats.count,
    };
  }

  return {
    total: memories.length,
    avgScore: memories.length > 0 ? totalScore / memories.length : 0,
    byType: typeStats,
    byStatus: { healthy, needsAttention, prune },
    recommendations,
  };
}
