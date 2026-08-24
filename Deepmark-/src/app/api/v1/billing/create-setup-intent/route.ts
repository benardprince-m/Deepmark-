import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { customerId } = body;

    let stripeCustomerId = customerId;

    if (!stripeCustomerId) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('stripe_customer_id, email')
        .eq('id', userPayload.userId)
        .single();

      if (!user) {
        return errorResponse('User not found', 'not_found', 404);
      }

      stripeCustomerId = user.stripe_customer_id;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userPayload.userId,
          },
        });

        stripeCustomerId = customer.id;

        await supabaseAdmin
          .from('users')
          .update({
            stripe_customer_id: stripeCustomerId,
            stripe_customer_created_at: new Date().toISOString(),
          })
          .eq('id', userPayload.userId);
      }
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return successResponse({
      clientSecret: setupIntent.client_secret,
      customerId: stripeCustomerId,
    });
  } catch (error) {
    console.error('Create setup intent error:', error);
    return serverErrorResponse('Failed to create setup intent');
  }
}
