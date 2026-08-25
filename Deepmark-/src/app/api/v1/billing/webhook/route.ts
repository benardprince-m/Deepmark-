import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getPlanFromPriceId } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function updateUserSubscription(
  userId: string,
  subscriptionId: string,
  plan: string,
  status: string,
  periodStart: Date,
  periodEnd: Date
) {
  await getSupabaseAdmin()
    .from('workspaces')
    .update({
      stripe_subscription_id: subscriptionId,
      plan,
      plan_status: status,
      plan_updated_at: new Date().toISOString(),
      subscription_current_period_start: periodStart.toISOString(),
      subscription_current_period_end: periodEnd.toISOString(),
    })
    .eq('user_id', userId)
    .select('id')
    .limit(1);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const userId = session.metadata?.userId || subscription.metadata?.userId;
          const plan = session.metadata?.plan || subscription.metadata?.plan || 'starter';
          
          if (userId) {
            await getSupabaseAdmin()
              .from('users')
              .update({ stripe_customer_id: session.customer as string })
              .eq('id', userId);

            const periodStart = new Date((subscription as any).current_period_start * 1000 || Date.now());
            const periodEnd = new Date((subscription as any).current_period_end * 1000 || Date.now());

            await updateUserSubscription(
              userId,
              subscription.id,
              plan,
              subscription.status,
              periodStart,
              periodEnd
            );
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          const priceId = subscription.items.data[0]?.price?.id;
          const plan = getPlanFromPriceId(priceId || '');
          
          const periodStart = new Date((subscription as any).current_period_start * 1000 || Date.now());
          const periodEnd = new Date((subscription as any).current_period_end * 1000 || Date.now());

          await updateUserSubscription(
            userId,
            subscription.id,
            plan,
            subscription.status,
            periodStart,
            periodEnd
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          await getSupabaseAdmin()
            .from('workspaces')
            .update({
              stripe_subscription_id: null,
              plan: 'free',
              plan_status: 'canceled',
              plan_updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}
