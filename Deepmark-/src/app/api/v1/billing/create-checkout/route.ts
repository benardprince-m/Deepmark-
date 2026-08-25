import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { stripe, PLAN_PRICE_IDS } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const checkoutSchema = z.object({
  plan: z.enum(['starter', 'pro', 'enterprise']),
  workspaceId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        'validation_error'
      );
    }

    const { plan, workspaceId } = validation.data;
    const priceId = PLAN_PRICE_IDS[plan];

    if (!priceId) {
      return errorResponse('Invalid plan', 'invalid_plan', 400);
    }

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userPayload.userId)
      .single();

    if (!user) {
      return errorResponse('User not found', 'not_found', 404);
    }

    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userPayload.userId,
        },
      });

      stripeCustomerId = customer.id;

      await getSupabaseAdmin()
        .from('users')
        .update({
          stripe_customer_id: stripeCustomerId,
          stripe_customer_created_at: new Date().toISOString(),
        })
        .eq('id', userPayload.userId);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const workspace = workspaceId
      ? await getSupabaseAdmin()
          .from('workspaces')
          .select('id, name')
          .eq('id', workspaceId)
          .eq('user_id', userPayload.userId)
          .single()
      : null;

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      subscription_data: {
        metadata: {
          userId: userPayload.userId,
          plan,
          workspaceId: workspace?.data?.id || '',
        },
      },
      metadata: {
        userId: userPayload.userId,
        plan,
        workspaceId: workspace?.data?.id || '',
      },
    });

    return successResponse({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return serverErrorResponse('Failed to create checkout session');
  }
}
