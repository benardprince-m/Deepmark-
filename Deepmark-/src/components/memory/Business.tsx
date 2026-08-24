/**
 * Business Memory Node
 * Section 11 - Business model, pricing, unit economics, competitors, revenue streams
 * DO NOT FABRICATE CONTENT - Scaffold only
 */

export interface CompetitorAnalysis {
  competitorName: string;
  website: string;
  strengths: string[];
  weaknesses: string[];
  pricingModel: string;
  estimatedMarketShare: string;
}

export interface BusinessMemory {
  // Business Model
  businessModelType: string; // e.g., SaaS, Marketplace, E-commerce
  revenueStreams: {
    name: string;
    description: string;
    projectedShare: number;
  }[];

  // Pricing & Packages
  pricingTiers: {
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly' | 'one-time';
    features: string[];
  }[];

  // Unit Economics
  customerAcquisitionCostGoal: number;
  lifetimeValueGoal: number;
  paybackPeriodGoalMonths: number;

  // Competitive Landscape
  competitors: CompetitorAnalysis[];

  // Strategic SWOT
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Metadata
  lastUpdated: string; // ISO date
  version: number;
}

export const businessMemorySchema: BusinessMemory = {
  businessModelType: '',
  revenueStreams: [],
  pricingTiers: [],
  customerAcquisitionCostGoal: 0,
  lifetimeValueGoal: 0,
  paybackPeriodGoalMonths: 0,
  competitors: [],
  swotAnalysis: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  },
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export default businessMemorySchema;