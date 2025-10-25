import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';

/**
 * Stripe Webhook endpoint
 *
 * Stripe sends asynchronous events to this endpoint. The handler verifies
 * the signature using your webhook secret and logs the event type. It
 * currently performs no business logic; you can extend it to provision
 * resources, update subscriptions or sync metadata.
 */
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature') as string;
  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
  // Log the event type for debugging. You can add business logic here.
  console.log('Received Stripe event:', event.type);
  return NextResponse.json({ received: true });
}