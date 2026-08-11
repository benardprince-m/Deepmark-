-- Migration 005: Retention Engines - Global Trends & Content Velocity
-- Creates tables for marketing globe and conversion tracking

-- 1. Global Trend Nodes (For the Globe / Discovery Engine)
CREATE TABLE IF NOT EXISTS public.global_trend_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_name TEXT NOT NULL,
    coordinates JSONB NOT NULL,
    niche TEXT NOT NULL,
    strategy_data JSONB NOT NULL,
    status_color TEXT NOT NULL DEFAULT '#22C55E',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.global_trend_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to global trends" ON public.global_trend_nodes FOR SELECT USING (true);
CREATE POLICY "System can insert global trends" ON public.global_trend_nodes FOR INSERT WITH CHECK (true);

-- 2. Content Velocity Tracking (For the Heatmap / Attribution Engine)
CREATE TABLE IF NOT EXISTS public.content_velocity_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    source_trend_id UUID REFERENCES public.global_trend_nodes(id) ON DELETE SET NULL,
    clicks INTEGER DEFAULT 0 NOT NULL,
    signups INTEGER DEFAULT 0 NOT NULL,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    verified_variant BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content_velocity_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage velocity tracking for their workspace" ON public.content_velocity_tracking 
    FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));

-- 3. Seed some initial global trend data
INSERT INTO public.global_trend_nodes (region_name, coordinates, niche, strategy_data, status_color) VALUES
    ('United States', '{"lat": 37.0902, "lng": -95.7129}', 'SaaS', '{"hook": "10x Productivity", "angle": "Time is money, save both"}', '#22C55E'),
    ('United Kingdom', '{"lat": 55.3781, "lng": -3.4360}', 'Fintech', '{"hook": "Stop Overspending", "angle": "Bank smarter not harder"}', '#22C55E'),
    ('Nigeria', '{"lat": 9.0820, "lng": 8.6753}', 'Payments', '{"hook": "Send Money Free", "angle": "No fees, ever"}', '#22C55E'),
    ('India', '{"lat": 20.5937, "lng": 78.9629}', 'EdTech', '{"hook": "Learn in 30 Days", "angle": "Or your money back"}', '#22C55E'),
    ('Brazil', '{"lat": -14.2350, "lng": -51.9253}', 'E-commerce', '{"hook": "Shop Global Prices", "angle": "Import without the tax"}', '#22C55E'),
    ('Germany', '{"lat": 51.1657, "lng": 10.4515}', 'B2B', '{"hook": "Enterprise at Startup Prices", "angle": "Scale without CFO approval"}', '#EF4444'),
    ('Japan', '{"lat": 36.2048, "lng": 138.2529}', 'AI', '{"hook": "Work 50% Less", "angle": "AI does the rest"}', '#22C55E'),
    ('Singapore', '{"lat": 1.3521, "lng": 103.8198}', 'Crypto', '{"hook": " DCA Made Simple", "angle": "Set it and forget it"}', '#22C55E')
ON CONFLICT DO NOTHING;
