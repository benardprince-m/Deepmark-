-- Migration 005: Retention Engines - Complete Schema & Seed Data
-- Global Trend Nodes & Content Velocity Tracking

-- 1. Create global_trend_nodes table
CREATE TABLE IF NOT EXISTS public.global_trend_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_name TEXT NOT NULL,
    city_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    niche TEXT NOT NULL,
    hook_structures JSONB NOT NULL DEFAULT '[]'::jsonb,
    competitor_angles JSONB NOT NULL DEFAULT '[]'::jsonb,
    consumer_psychology TEXT NOT NULL,
    conversion_velocity_score INTEGER DEFAULT 85,
    status_color TEXT NOT NULL DEFAULT '#22C55E',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.global_trend_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to global trends" 
ON public.global_trend_nodes FOR SELECT USING (true);

-- 2. Create content_velocity_tracking table
CREATE TABLE IF NOT EXISTS public.content_velocity_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    source_trend_id UUID REFERENCES public.global_trend_nodes(id) ON DELETE SET NULL,
    link_clicks INTEGER DEFAULT 0 NOT NULL,
    signups INTEGER DEFAULT 0 NOT NULL,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    is_verified_variant BOOLEAN DEFAULT false NOT NULL,
    hourly_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content_velocity_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage velocity tracking for their workspace" 
ON public.content_velocity_tracking FOR ALL 
USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));

-- 3. Seed Regional Intelligence Nodes
INSERT INTO public.global_trend_nodes (region_name, city_name, latitude, longitude, niche, hook_structures, competitor_angles, consumer_psychology, conversion_velocity_score, status_color)
VALUES 
('East Africa', 'Nairobi', -1.2921, 36.8219, 'Fintech / SaaS', 
 '["Why 80% of merchants bypass standard POS for mobile rails", "The hidden cost of manual reconciliation in emerging hubs"]'::jsonb,
 '["Direct-to-WhatsApp automation", "Frictionless peer-to-business settlements"]'::jsonb,
 'High trust friction; requires social proof and instant mobile-first responsiveness.', 94, '#22C55E'),

('Western Europe', 'London', 51.5074, -0.1278, 'B2B Tech', 
 '["We stopped tracking vanity metrics and our pipeline tripled", "The death of bloated SaaS subscriptions"]'::jsonb,
 '["Aggressive cost consolidation", "Anti-seat-licensing pricing models"]'::jsonb,
 'High skepticism toward AI wrappers; demands verifiable ROI and strict compliance.', 88, '#22C55E'),

('North America', 'San Francisco', 37.7749, -122.4194, 'AI / Developer Tools', 
 '["Stop building wrappers: The orchestration layer is where the moat lives", "Why your autonomous agent fails in production"]'::jsonb,
 '["Local-first LLM orchestration", "Agent-to-agent MCP infrastructure"]'::jsonb,
 'Obsessed with technical depth and leverage; allergic to generic marketing copy.', 96, '#22C55E'),

('East Asia', 'Tokyo', 35.6762, 139.6503, 'E-Commerce / Consumer', 
 '["Micro-communities are outperforming traditional ad spend by 4x", "The shift to frictionless asynchronous checkout"]'::jsonb,
 '["Hyper-curated localized loyalty loops", "Zero-noise minimalism"]'::jsonb,
 'Values brand craftsmanship, precision, and zero unsolicited marketing friction.', 72, '#EF4444');
