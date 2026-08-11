// DeepMark Subscription Tiers

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceId: string; // Stripe price ID
  features: string[];
  limits: {
    workspaces: number;
    startups: number;
    contentGenerations: number;
    aiCallsPerMonth: number;
    teamMembers: number;
  };
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    features: [
      '1 Workspace',
      '1 Startup profile',
      '10 AI content generations/month',
      'Basic analytics',
      'Email support',
    ],
    limits: {
      workspaces: 1,
      startups: 1,
      contentGenerations: 10,
      aiCallsPerMonth: 50,
      teamMembers: 1,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: 'price_starter_monthly',
    features: [
      '3 Workspaces',
      '5 Startup profiles',
      '100 AI content generations/month',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    limits: {
      workspaces: 3,
      startups: 5,
      contentGenerations: 100,
      aiCallsPerMonth: 500,
      teamMembers: 3,
    },
    recommended: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    priceId: 'price_pro_monthly',
    features: [
      '10 Workspaces',
      'Unlimited Startup profiles',
      'Unlimited AI content generations',
      'Advanced analytics + exports',
      'Priority support + onboarding',
      'Custom branding + white-label',
      'API access',
      'Custom integrations',
    ],
    limits: {
      workspaces: 10,
      startups: -1, // unlimited
      contentGenerations: -1,
      aiCallsPerMonth: -1,
      teamMembers: 10,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    priceId: 'price_enterprise_monthly',
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      'Custom SLA',
      'SSO + SAML',
      'Audit logs',
      'Custom contracts',
      'On-premise option',
    ],
    limits: {
      workspaces: -1,
      startups: -1,
      contentGenerations: -1,
      aiCallsPerMonth: -1,
      teamMembers: -1,
    },
  },
];

// Check if user has access to feature
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: string
): boolean {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === tier);
  if (!plan) return false;
  
  const freeFeatures = ['workspace', 'basic-analytics'];
  const starterFeatures = [...freeFeatures, 'multi-workspace', 'custom-branding', 'priority-support'];
  const proFeatures = [...starterFeatures, 'unlimited-content', 'api-access', 'white-label'];
  const enterpriseFeatures = [...proFeatures, 'sso', 'audit-logs', 'dedicated-support'];

  const featureMap: Record<SubscriptionTier, string[]> = {
    free: freeFeatures,
    starter: starterFeatures,
    pro: proFeatures,
    enterprise: enterpriseFeatures,
  };

  return featureMap[tier]?.includes(feature) || false;
}

// Check usage limits
export function checkLimit(
  tier: SubscriptionTier,
  currentUsage: number,
  limitType: 'workspaces' | 'startups' | 'contentGenerations' | 'aiCallsPerMonth'
): { allowed: boolean; remaining: number; upgradeRequired?: boolean } {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === tier);
  if (!plan) return { allowed: false, remaining: 0 };

  const limit = plan.limits[limitType];
  
  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, remaining: Infinity };
  }

  const remaining = limit - currentUsage;
  
  if (remaining <= 0) {
    return { 
      allowed: false, 
      remaining: 0, 
      upgradeRequired: true 
    };
  }

  return { allowed: true, remaining };
}

// Get upgrade prompt message
export function getUpgradeMessage(currentTier: SubscriptionTier): string {
  const nextTier = currentTier === 'free' ? 'Starter' : 
                   currentTier === 'starter' ? 'Pro' : 'Enterprise';
  
  return `You've reached the limit for your ${currentTier} plan. Upgrade to ${nextTier} for more!`;
}
