/**
 * Marketing Memory Node
 * Section 11 - Channels, campaigns, performance targets, creative assets, distribution
 * DO NOT FABRICATE CONTENT - Scaffold only
 */

export interface MarketingChannel {
  channelName: string;
  type: 'organic' | 'paid' | 'referral' | 'influencer' | 'partnership';
  status: 'active' | 'testing' | 'planned' | 'paused';
  monthlyBudgetGoal: number;
  expectedCPA: number;
  kpis: string[];
}

export interface MarketingMemory {
  // Channels & Mix
  acquisitionChannels: MarketingChannel[];
  primaryAcquisitionChannel: string;

  // Key Marketing Milestones
  milestones: {
    title: string;
    targetDate: string;
    description: string;
    kpiTarget: string;
  }[];

  // Campaign History & Templates
  campaignTemplates: {
    id: string;
    name: string;
    objective: string;
    targetAudienceId: string;
    estimatedCPA: number;
  }[];

  // Attribution Model
  attributionModel: 'first-touch' | 'last-touch' | 'linear' | 'w-shaped' | 'data-driven';

  // Creative & Copy Assets (References)
  copywritingHooks: {
    hookText: string;
    performanceCategory: 'high' | 'medium' | 'untested';
    targetSegment: string;
  }[];

  // Metadata
  lastUpdated: string; // ISO date
  version: number;
}

export const marketingMemorySchema: MarketingMemory = {
  acquisitionChannels: [],
  primaryAcquisitionChannel: '',
  milestones: [],
  campaignTemplates: [],
  attributionModel: 'linear',
  copywritingHooks: [],
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export default marketingMemorySchema;