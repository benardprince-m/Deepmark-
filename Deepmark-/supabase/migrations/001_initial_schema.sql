-- DeepMark Database Schema
-- Version: 1.0.0

-- Enable UUID extension (Supabase manages this)
-- Using gen_random_uuid() instead of gen_random_uuid() for compatibility

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workspaces_user_id ON workspaces(user_id) WHERE deleted_at IS NULL;

-- Startups table
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    description TEXT,
    target_audience TEXT,
    available_time_per_week INTEGER CHECK (available_time_per_week IN (5, 10, 20, 40)),
    main_goal VARCHAR(50) CHECK (main_goal IN ('awareness', 'leads', 'signups')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_startups_workspace_id ON startups(workspace_id) WHERE deleted_at IS NULL;

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    provider VARCHAR(50) CHECK (provider IN ('twitter', 'linkedin', 'tiktok')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    status VARCHAR(50) CHECK (status IN ('active', 'disconnected', 'revoked')) DEFAULT 'active',
    scopes TEXT[],
    expires_at TIMESTAMP WITH TIME ZONE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_integrations_workspace_provider ON integrations(workspace_id, provider) WHERE deleted_at IS NULL;

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    theme VARCHAR(255),
    goals TEXT,
    status VARCHAR(50) CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_campaigns_startup_id ON campaigns(startup_id) WHERE deleted_at IS NULL;

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('post', 'carousel', 'image_prompt', 'video_prompt')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('draft', 'scheduled', 'published')) DEFAULT 'draft',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    platform VARCHAR(50),
    external_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_content_campaign_status ON content(campaign_id, status) WHERE deleted_at IS NULL;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
    due_date DATE,
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tasks_campaign_status ON tasks(campaign_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    impressions INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    clicks INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_content_recorded ON analytics(content_id, recorded_at);

-- Memory table
CREATE TABLE IF NOT EXISTS memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN ('voice', 'positioning', 'preferences', 'results')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 50,
    source VARCHAR(50) CHECK (source IN ('user_input', 'inferred', 'system')) DEFAULT 'user_input',
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_memory_workspace_category ON memory(workspace_id, category) WHERE deleted_at IS NULL;

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view own workspaces" ON workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workspaces" ON workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspaces" ON workspaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspaces" ON workspaces FOR DELETE USING (auth.uid() = user_id);

-- Startups policies
CREATE POLICY "Users can view startups in own workspaces" ON startups FOR SELECT 
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create startups in own workspaces" ON startups FOR INSERT 
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own startups" ON startups FOR UPDATE 
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own startups" ON startups FOR DELETE 
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Integrations policies
CREATE POLICY "Users can view own integrations" ON integrations FOR SELECT 
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can create own integrations" ON integrations FOR INSERT 
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own integrations" ON integrations FOR UPDATE 
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own integrations" ON integrations FOR DELETE 
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Campaigns policies
CREATE POLICY "Users can view campaigns in own startups" ON campaigns FOR SELECT 
USING (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create campaigns in own startups" ON campaigns FOR INSERT 
WITH CHECK (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE 
USING (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE 
USING (startup_id IN (SELECT s.id FROM startups s JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Content policies
CREATE POLICY "Users can view content in own campaigns" ON content FOR SELECT 
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create content in own campaigns" ON content FOR INSERT 
WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can update own content" ON content FOR UPDATE 
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can delete own content" ON content FOR DELETE 
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Tasks policies
CREATE POLICY "Users can view tasks in own campaigns" ON tasks FOR SELECT 
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create tasks in own campaigns" ON tasks FOR INSERT 
WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can update tasks in own campaigns" ON tasks FOR UPDATE 
USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Analytics policies
CREATE POLICY "Users can view analytics for own content" ON analytics FOR SELECT 
USING (content_id IN (SELECT co.id FROM content co JOIN campaigns c ON co.campaign_id = c.id JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));
CREATE POLICY "Users can create analytics for own content" ON analytics FOR INSERT 
WITH CHECK (content_id IN (SELECT co.id FROM content co JOIN campaigns c ON co.campaign_id = c.id JOIN startups s ON c.startup_id = s.id JOIN workspaces w ON s.workspace_id = w.id WHERE w.user_id = auth.uid()));

-- Memory policies
CREATE POLICY "Users can manage memory in own workspaces" ON memory FOR ALL 
USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
