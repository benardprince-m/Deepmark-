-- Migration 004: Subscription System
-- Adds subscription_tier and usage tracking to users table

-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_stats JSONB DEFAULT '{"workspaces":0,"startups":0,"contentGenerations":0,"aiCalls":0}';

-- Create usage_logs table for tracking
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on usage_logs
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own usage logs
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: System can insert usage logs
CREATE POLICY "System can insert usage logs" ON usage_logs
  FOR INSERT WITH CHECK (true);

-- Create function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  user_id_param UUID,
  action_param TEXT,
  resource_param TEXT DEFAULT NULL,
  count_param INTEGER DEFAULT 1
) RETURNS void AS $$
BEGIN
  INSERT INTO usage_logs (user_id, action, resource, count)
  VALUES (user_id_param, action_param, resource_param, count_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and enforce limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  user_id_param UUID,
  limit_type TEXT
) RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, upgrade_required BOOLEAN) AS $$
DECLARE
  tier TEXT;
  plan_limits JSONB;
  current_count INTEGER;
  limit_value INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO tier FROM users WHERE id = user_id_param;
  
  -- Default to free tier
  IF tier IS NULL THEN
    tier := 'free';
  END IF;
  
  -- Define limits per tier
  plan_limits := CASE tier
    WHEN 'free' THEN '{"workspaces":1,"startups":1,"contentGenerations":10,"aiCalls":50}'
    WHEN 'starter' THEN '{"workspaces":3,"startups":5,"contentGenerations":100,"aiCalls":500}'
    WHEN 'pro' THEN '{"workspaces":10,"startups":-1,"contentGenerations":-1,"aiCalls":-1}'
    WHEN 'enterprise' THEN '{"workspaces":-1,"startups":-1,"contentGenerations":-1,"aiCalls":-1}'
    ELSE '{"workspaces":1,"startups":1,"contentGenerations":10,"aiCalls":50}'
  END;
  
  -- Get limit value for requested type
  limit_value := (plan_limits->>limit_type)::INTEGER;
  
  -- Get current usage
  SELECT COUNT(*) INTO current_count 
  FROM usage_logs 
  WHERE user_id = user_id_param AND action = limit_type;
  
  -- Check if unlimited (-1) or has remaining
  IF limit_value = -1 THEN
    RETURN QUERY SELECT true, -1, false;
  ELSIF current_count >= limit_value THEN
    RETURN QUERY SELECT false, 0, true;
  ELSE
    RETURN QUERY SELECT true, limit_value - current_count, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
