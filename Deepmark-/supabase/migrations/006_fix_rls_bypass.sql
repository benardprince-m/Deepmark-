-- Fix Critical RLS Bypass Vulnerability
-- Version: 1.0.3
-- Date: 2026-08-14
-- This migration removes the insecure MANUAL_MIGRATION.sql policies and restores proper RLS

-- ============================================
-- FIX RLS POLICIES - REMOVE USING(true) POLICIES
-- ============================================

-- Drop all permissive policies created by MANUAL_MIGRATION.sql

-- Users policies (recreate with auth.uid() = id)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Workspaces policies (recreate with workspace ownership check)
DROP POLICY IF EXISTS "Anyone can CRUD workspaces" ON workspaces;
CREATE POLICY "Users can view own workspaces" ON workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workspaces" ON workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspaces" ON workspaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspaces" ON workspaces FOR DELETE USING (auth.uid() = user_id);

-- Startups policies (recreate with workspace membership check)
DROP POLICY IF EXISTS "Anyone can CRUD startups" ON startups;
CREATE POLICY "Users can view startups in own workspaces" ON startups FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create startups in own workspaces" ON startups FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own startups" ON startups FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own startups" ON startups FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Integrations policies (recreate with workspace membership check)
DROP POLICY IF EXISTS "Anyone can CRUD integrations" ON integrations;
CREATE POLICY "Users can view own integrations" ON integrations FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create own integrations" ON integrations FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own integrations" ON integrations FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own integrations" ON integrations FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Campaigns policies (recreate with startup/workspace membership check)
DROP POLICY IF EXISTS "Anyone can CRUD campaigns" ON campaigns;
CREATE POLICY "Users can view campaigns in own startups" ON campaigns FOR SELECT
USING (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create campaigns in own startups" ON campaigns FOR INSERT
WITH CHECK (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE
USING (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE
USING (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Content policies (recreate with campaign/startup/workspace membership check)
DROP POLICY IF EXISTS "Anyone can CRUD content" ON content;
CREATE POLICY "Users can view content in own campaigns" ON content FOR SELECT
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create content in own campaigns" ON content FOR INSERT
WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can update own content" ON content FOR UPDATE
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can delete own content" ON content FOR DELETE
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Tasks policies (recreate with campaign/startup/workspace membership check)
DROP POLICY IF EXISTS "Anyone can CRUD tasks" ON tasks;
CREATE POLICY "Users can view tasks in own campaigns" ON tasks FOR SELECT
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create tasks in own campaigns" ON tasks FOR INSERT
WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can update tasks in own campaigns" ON tasks FOR UPDATE
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Analytics policies (recreate with content/campaign/startup/workspace membership check)
DROP POLICY IF EXISTS "Anyone can CRUD analytics" ON analytics;
CREATE POLICY "Users can view analytics for own content" ON analytics FOR SELECT
USING (content_id IN (SELECT co.id FROM content co JOIN campaigns c ON co.campaign_id = c.id JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create analytics for own content" ON analytics FOR INSERT
WITH CHECK (content_id IN (SELECT co.id FROM content co JOIN campaigns c ON co.campaign_id = c.id JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Memory policies (recreate with workspace membership check)
DROP POLICY IF EXISTS "Anyone can CRUD memory" ON memory;
CREATE POLICY "Users can manage memory in own workspaces" ON memory FOR ALL
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- global_trend_nodes: Public read (intentional for the globe visualization)
DROP POLICY IF EXISTS "Allow public read access to global trends" ON global_trend_nodes;
CREATE POLICY "Allow public read access to global trends" ON global_trend_nodes FOR SELECT USING (true);

-- content_velocity_tracking: Only workspace members can access
DROP POLICY IF EXISTS "Users can manage velocity tracking for their workspace" ON content_velocity_tracking;
CREATE POLICY "Users can manage velocity tracking for their workspace" ON content_velocity_tracking FOR ALL
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- ============================================
-- VERIFY RLS POLICIES
-- ============================================
SELECT 'RLS bypass vulnerability fixed!' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
