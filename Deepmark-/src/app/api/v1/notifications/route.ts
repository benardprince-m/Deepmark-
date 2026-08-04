import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  // Query real notifications from database
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, read, link, created_at')
    .eq('user_id', userPayload.userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return successResponse({
      notifications: [],
      unread_count: 0
    }, 'Notifications retrieved');
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return successResponse({
    notifications: notifications || [],
    unread_count: unreadCount
  }, 'Notifications retrieved');
}