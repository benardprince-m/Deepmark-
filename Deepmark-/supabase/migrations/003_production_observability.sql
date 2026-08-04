-- DeepMark Production Observability Migration
-- Version: 1.0.2
-- Adds audit logs, provider usage tracking, error logs, and workspace settings

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    action VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_event ON audit_logs(user_id, event_type, created_at DESC);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT 
WITH CHECK (true); -- Service role bypasses RLS

-- ============================================
-- PROVIDER USAGE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS provider_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    input_cost DECIMAL(10, 6) DEFAULT 0,
    output_cost DECIMAL(10, 6) DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    error_message TEXT,
    request_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_provider_usage_user_id ON provider_usage_logs(user_id);
CREATE INDEX idx_provider_usage_workspace_id ON provider_usage_logs(workspace_id);
CREATE INDEX idx_provider_usage_provider ON provider_usage_logs(provider);
CREATE INDEX idx_provider_usage_created_at ON provider_usage_logs(created_at DESC);
CREATE INDEX idx_provider_usage_user_date ON provider_usage_logs(user_id, created_at DESC);

-- RLS for provider_usage_logs
ALTER TABLE provider_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs" ON provider_usage_logs FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert usage logs" ON provider_usage_logs FOR INSERT 
WITH CHECK (true);

-- ============================================
-- ERROR LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    provider VARCHAR(50),
    operation VARCHAR(100),
    request_id UUID,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_workspace_id ON error_logs(workspace_id);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_type_severity ON error_logs(error_type, severity, created_at DESC);

-- RLS for error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own error logs" ON error_logs FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert error logs" ON error_logs FOR INSERT 
WITH CHECK (true);

-- ============================================
-- WORKSPACE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workspace_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    quota_config JSONB DEFAULT '{}',
    provider_config JSONB DEFAULT '{}',
    feature_flags JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workspace_settings_workspace_id ON workspace_settings(workspace_id);

-- RLS for workspace_settings
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace settings" ON workspace_settings FOR SELECT 
USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own workspace settings" ON workspace_settings FOR UPDATE 
USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own workspace settings" ON workspace_settings FOR INSERT 
WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
);

-- ============================================
-- DEFAULT QUOTA CONFIG FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_default_quota_config()
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'dailyRequests', 100,
        'monthlyTokens', 1000000,
        'dailyCostLimit', 10.00,
        'monthlyCostLimit', 50.00,
        'maxWorkspaces', 3,
        'maxStartups', 5,
        'maxCampaigns', 20,
        'maxContentPerMonth', 100
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- AUTO-CREATE WORKSPACE SETTINGS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION create_workspace_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workspace_settings (workspace_id, quota_config)
    VALUES (NEW.id, get_default_quota_config());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_workspace_created
    AFTER INSERT ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION create_workspace_settings();

-- ============================================
-- AUDIT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION log_auth_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (event_type, user_id, action, metadata)
    VALUES (
        TG_ARGV[0],
        NEW.id,
        TG_ARGV[1],
        jsonb_build_object('email', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
