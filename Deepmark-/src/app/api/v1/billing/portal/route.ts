import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userPayload.userId)
      .single();

    if (!user) {
      return notFoundResponse('User not found');
    }

    if (!user.stripe_customer_id) {
      return errorResponse('No billing account found', 'no_billing_account', 400);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${baseUrl}/billing`,
    });

    return successResponse({
      portalUrl: portalSession.url,
    });
  } catch (error) {
    console.error('Create portal session error:', error);
    return serverErrorResponse('Failed to create billing portal session');
  }
}
