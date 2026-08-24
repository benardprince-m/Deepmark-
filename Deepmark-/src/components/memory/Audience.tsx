/**
 * Audience Memory Node
 * Section 11 - Target market, buyer personas, segments, demographics, psychographics
 * DO NOT FABRICATE CONTENT - Scaffold only
 */

export interface BuyerPersona {
  id: string;
  name: string;
  role: string;
  demographics: {
    ageRange: string;
    incomeRange: string;
    education: string;
    location: string;
  };
  psychographics: {
    goals: string[];
    painPoints: string[];
    values: string[];
    interests: string[];
  };
  buyingBehavior: {
    decisionFactors: string[];
    preferredChannels: string[];
    objections: string[];
  };
}

export interface AudienceMemory {
  // Target Market
  primaryTargetMarket: string;
  secondaryTargetMarkets: string[];
  marketSizeEstimated: string;

  // Personas
  personas: BuyerPersona[];

  // Segments
  marketSegments: {
    name: string;
    description: string;
    percentage: number;
  }[];

  // Behavior
  customerJourneyStages: {
    stageName: string;
    touchpoints: string[];
    contentNeeds: string[];
  }[];

  // Metadata
  lastUpdated: string; // ISO date
  version: number;
}

export const audienceMemorySchema: AudienceMemory = {
  primaryTargetMarket: '',
  secondaryTargetMarkets: [],
  marketSizeEstimated: '',
  personas: [],
  marketSegments: [],
  customerJourneyStages: [],
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export default audienceMemorySchema;