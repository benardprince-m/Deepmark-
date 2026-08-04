// Memory Engine Types

export type MemoryCategory = 'voice' | 'positioning' | 'preferences' | 'results' | 'context';
export type MemorySource = 'user_input' | 'inferred' | 'system' | 'correction';

export interface MemoryCard {
  id: string;
  workspaceId: string;
  category: MemoryCategory;
  title: string;
  content: string;
  confidence: number; // 0-100
  source: MemorySource;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryQuery {
  workspaceId: string;
  categories?: MemoryCategory[];
  minConfidence?: number;
  limit?: number;
  excludeIds?: string[];
}

export interface MemoryExtraction {
  category: MemoryCategory;
  title: string;
  content: string;
  confidence: number;
  source: MemorySource;
}

export interface MemoryContext {
  relevantCards: MemoryCard[];
  confidence: number;
  freshness: number; // How recently updated
}

// Memory extraction patterns
export interface ExtractionPattern {
  category: MemoryCategory;
  patterns: RegExp[];
  example: string;
}

export const EXTRACTION_PATTERNS: ExtractionPattern[] = [
  {
    category: 'voice',
    patterns: [
      /tone[zs]?\s*(?:is|should be|usually|i prefer|i like)\s*[:\-]?\s*(.+)/i,
      /writing[_\s]?style[zs]?\s*(?:is|should be|usually|i prefer)\s*[:\-]?\s*(.+)/i,
      /voice[zs]?\s*(?:is|should be|usually|i prefer)\s*[:\-]?\s*(.+)/i,
      /(?:formal|casual|professional|friendly|technical)/i
    ],
    example: "My tone is professional but approachable"
  },
  {
    category: 'positioning',
    patterns: [
      /position(?:ing)?\s*(?:is|:)\s*(.+)/i,
      /unique[_\s]?selling[_\s]?proposition\s*(?:is|:)\s*(.+)/i,
      /differentiator[s]?\s*(?:is|:)\s*(.+)/i,
      /we\s+(?:are|focus\s+on|specialize\s+in|help)\s+(.+)/i
    ],
    example: "Our positioning is for busy founders who need done-for-you marketing"
  },
  {
    category: 'preferences',
    patterns: [
      /prefer(?:s|ence)?[zs]?\s*(?:to|:)\s*(.+)/i,
      /like[zs]?\s*(?:to|:)\s*(.+)/i,
      /enjoy[zs]?\s*(?:to|:)\s*(.+)/i,
      /always\s+(.+)/i,
      /never\s+(.+)/i
    ],
    example: "I prefer short paragraphs and bullet points"
  },
  {
    category: 'results',
    patterns: [
      /(?:best|highest|most\s+effective)\s+(?:performing|performing|engagement)\s+(?:was|is)\s+(.+)/i,
      /(?:got|achieved|reached)\s+(\d+[\d,]*)\s+(?:impressions|engagement|clicks)/i,
      /worked\s+(?:well|best)\s+(?:when|for)\s+(.+)/i,
      /successful\s+(?:campaign|post|content)\s+(?:was|about)\s+(.+)/i
    ],
    example: "My best performing posts were about productivity tips"
  }
];

// Scoring weights for memory relevance
export interface MemoryScoring {
  relevance: number;      // Keyword/context match
  recency: number;        // How recently used
  confidence: number;    // Original confidence score
  source: number;         // User input > inferred > system
}
