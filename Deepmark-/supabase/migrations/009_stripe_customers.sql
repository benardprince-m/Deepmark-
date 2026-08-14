-- Migration 009: Stripe Customers and Subscriptions
-- Adds Stripe integration fields to users and workspaces tables

-- Add stripe_customer_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_created_at TIMESTAMPTZ;

-- Add subscription-related fields to workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'));
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'past_due', 'canceled', 'trialing'));
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_stripe_subscription ON workspaces(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_plan ON workspaces(plan) WHERE plan IS NOT NULL;
