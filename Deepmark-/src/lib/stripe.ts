import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
  typescript: true,
});

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export const PLAN_PRICE_IDS: Record<PlanType, string> = {
  free: '',
  starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
};

export function getPlanFromPriceId(priceId: string): PlanType {
  for (const [plan, pid] of Object.entries(PLAN_PRICE_IDS)) {
    if (pid === priceId) {
      return plan as PlanType;
    }
  }
  return 'free';
}
