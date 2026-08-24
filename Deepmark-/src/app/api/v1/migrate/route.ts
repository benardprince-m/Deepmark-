import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// Environment variables - must be set
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://emhsbpbewhatkwlznanr.getSupabaseClient().co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MIGRATION_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id) WHERE deleted_at IS NULL;

-- Startups table
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_startups_workspace_id ON startups(workspace_id) WHERE deleted_at IS NULL;

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_integrations_workspace_provider ON integrations(workspace_id, provider) WHERE deleted_at IS NULL;

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_campaigns_startup_id ON campaigns(startup_id) WHERE deleted_at IS NULL;

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_content_campaign_status ON content(campaign_id, status) WHERE deleted_at IS NULL;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_tasks_campaign_status ON tasks(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    impressions INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    clicks INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_content_recorded ON analytics(content_id, recorded_at);

-- Memory table
CREATE TABLE IF NOT EXISTS memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_memory_workspace_category ON memory(workspace_id, category) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for service role)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD workspaces" ON workspaces;
CREATE POLICY "Anyone can CRUD workspaces" ON workspaces FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD startups" ON startups;
CREATE POLICY "Anyone can CRUD startups" ON startups FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD integrations" ON integrations;
CREATE POLICY "Anyone can CRUD integrations" ON integrations FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD campaigns" ON campaigns;
CREATE POLICY "Anyone can CRUD campaigns" ON campaigns FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD content" ON content;
CREATE POLICY "Anyone can CRUD content" ON content FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD tasks" ON tasks;
CREATE POLICY "Anyone can CRUD tasks" ON tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD analytics" ON analytics;
CREATE POLICY "Anyone can CRUD analytics" ON analytics FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can CRUD memory" ON memory;
CREATE POLICY "Anyone can CRUD memory" ON memory FOR ALL USING (true);
`;

export async function POST(request: NextRequest) {
  // Verify authorization - only allow if MIGRATE_SECRET is set and matches
  const migrateSecret = request.headers.get('x-migrate-secret');
  const expectedSecret = process.env.MIGRATE_SECRET || process.env.JWT_SECRET;
  
  if (!migrateSecret || migrateSecret !== expectedSecret) {
    return errorResponse('Unauthorized', 'unauthorized');
  }
  
  if (!SERVICE_ROLE_KEY) {
    return errorResponse('SUPABASE_SERVICE_ROLE_KEY not configured', 'configuration_error');
  }
  
  try {
    // Create admin client
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Check if users table exists
    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (!checkError || checkError.code !== 'PGRST204') {
      return successResponse({ 
        message: 'Tables already exist',
        migrated: false 
      }, 'Migration not needed');
    }
    
    // Execute migration SQL using RPC
    // Note: This requires a function to execute raw SQL
    // For now, we'll return the SQL to be executed manually
    
    return successResponse({
      message: 'Migration required',
      sql: MIGRATION_SQL,
      instructions: 'Run this SQL in the Supabase SQL Editor or via CLI'
    }, 'Migration pending - manual SQL execution required');
    
  } catch (error) {
    console.error('Migration check error:', error);
    return serverErrorResponse('Migration check failed');
  }
}

export async function GET() {
  return successResponse({
    message: 'Migration endpoint',
    method: 'POST',
    headers: {
      'x-migrate-secret': 'Required - MIGRATE_SECRET or JWT_SECRET'
    },
    note: 'For manual migration, use Supabase Dashboard SQL Editor'
  }, 'Migration API');
}
