/**
 * Constraints Memory Node
 * Section 11 - Legal, regulatory, system policies, budget ceilings, operational limits
 * DO NOT FABRICATE CONTENT - Scaffold only
 */

export interface ConstraintsMemory {
  // Budgetary Constraints
  budgetCeilings: {
    period: 'monthly' | 'quarterly' | 'yearly';
    maxBudget: number;
    currency: string;
    warningThresholdPercentage: number; // e.g. 85 for 85%
  }[];

  // Regulatory & Compliance
  complianceRequirements: {
    regulationName: string; // e.g., GDPR, CCPA, COPPA
    description: string;
    actionRequired: string;
    status: 'compliant' | 'review_needed' | 'action_required';
  }[];

  // System & Platform Policies
  platformPolicies: {
    platformName: string; // e.g., Facebook Ads, Google Ads
    prohibitedContent: string[];
    restrictedContent: string[];
    policyReferenceUrl: string;
  }[];

  // Operational & Resource Limits
  operationalLimits: {
    maxDailyCampaigns: number;
    maxConcurrentAITasks: number;
    supportedLanguages: string[];
  };

  // Legal & Disclaimer Requirements
  legalDisclaimersRequired: {
    context: string; // e.g., "pricing page", "email sign up"
    disclaimerText: string;
  }[];

  // Metadata
  lastUpdated: string; // ISO date
  version: number;
}

export const constraintsMemorySchema: ConstraintsMemory = {
  budgetCeilings: [],
  complianceRequirements: [],
  platformPolicies: [],
  operationalLimits: {
    maxDailyCampaigns: 5,
    maxConcurrentAITasks: 2,
    supportedLanguages: ['en'],
  },
  legalDisclaimersRequired: [],
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export default constraintsMemorySchema;