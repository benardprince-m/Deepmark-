export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Startup {
  id: string;
  workspace_id: string;
  name: string;
  website: string | null;
  description: string | null;
  target_audience: string | null;
  available_time_per_week: 5 | 10 | 20 | 40;
  main_goal: 'awareness' | 'leads' | 'signups';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type IntegrationProvider = 'twitter' | 'linkedin' | 'tiktok';

export type IntegrationStatus = 'active' | 'disconnected' | 'revoked';

export interface Integration {
  id: string;
  workspace_id: string;
  provider: IntegrationProvider;
  access_token: string;
  refresh_token: string | null;
  status: IntegrationStatus;
  scopes: string[];
  expires_at: string | null;
  connected_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CampaignStatus = 'draft' | 'active' | 'completed';

export interface Campaign {
  id: string;
  startup_id: string;
  name: string;
  theme: string;
  goals: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ContentType = 'post' | 'carousel' | 'image_prompt' | 'video_prompt';
export type ContentStatus = 'draft' | 'scheduled' | 'published';

export interface Content {
  id: string;
  campaign_id: string;
  type: ContentType;
  title: string;
  content: string;
  status: ContentStatus;
  scheduled_for: string | null;
  published_at: string | null;
  platform: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Analytics {
  id: string;
  content_id: string;
  platform: string;
  impressions: number;
  engagement: number;
  clicks: number | null;
  recorded_at: string;
  created_at: string;
}

export type MemoryCategory = 'voice' | 'positioning' | 'preferences' | 'results';
export type MemorySource = 'user_input' | 'inferred' | 'system';

export interface Memory {
  id: string;
  workspace_id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  confidence: number;
  source: MemorySource;
  last_used: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
