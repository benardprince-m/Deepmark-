-- Add Notifications Table
-- Version: 1.0.1

-- Notifications table for user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    title VARCHAR(255),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_workspace_id ON notifications(workspace_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- Notifications RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own notifications" ON notifications FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE 
USING (user_id = auth.uid());
