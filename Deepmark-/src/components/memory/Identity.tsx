/**
 * Identity Memory Node
 * Section 11 - Core brand identity, mission, vision, values
 * DO NOT FABRICATE CONTENT - Scaffold only
 */

export interface IdentityMemory {
  // Core Identity
  brandName: string;
  tagline: string;
  missionStatement: string;
  visionStatement: string;
  coreValues: string[];

  // Brand Voice & Personality
  voiceAttributes: string[]; // e.g., ['authoritative', 'approachable', 'bold']
  toneGuidelines: string;
  personalityTraits: string[];

  // Visual Identity (references)
  logoVariants: string[]; // paths to logo files
  colorPalette: string[]; // hex codes
  typography: {
    primary: string;
    secondary: string;
  };

  // Positioning
  uniqueValueProposition: string;
  brandPromise: string;
  differentiationPoints: string[];

  // Metadata
  lastUpdated: string; // ISO date
  version: number;
}

export const identityMemorySchema: IdentityMemory = {
  brandName: '',
  tagline: '',
  missionStatement: '',
  visionStatement: '',
  coreValues: [],
  voiceAttributes: [],
  toneGuidelines: '',
  personalityTraits: [],
  logoVariants: [],
  colorPalette: [],
  typography: {
    primary: '',
    secondary: '',
  },
  uniqueValueProposition: '',
  brandPromise: '',
  differentiationPoints: [],
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export default identityMemorySchema;