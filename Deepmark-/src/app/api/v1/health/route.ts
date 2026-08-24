import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const { error: dbError } = await getSupabaseClient().from('users').select('id').limit(1);
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        database_status: dbError ? 'disconnected' : 'connected',
        response_time: `${Date.now() - startTime}ms`
      },
      message: 'Service is healthy'
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'unhealthy',
      message: 'Service is unhealthy'
    }, { status: 503 });
  }
}
