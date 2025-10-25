import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';

// Ensure Node runtime (Stripe needs Node, not Edge)
export const runtime = 'nodejs';

type CreateCheckoutBody = {
  priceId?: string;
  email?: string;
};

export async function POST(req: Request) {
  try {
    const { priceId, email }: CreateCheckoutBody = await req.json();

    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    // Toggle embedded vs hosted via env. Default: hosted (no embedded).
    // Set STRIPE_CHECKOUT_EMBEDDED="true" to use embedded.
    const useEmbedded =
      (process.env.STRIPE_CHECKOUT_EMBEDDED || '').toLowerCase() === 'true';

    // Base params
    const params: any = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // You may keep these defaults; they don't conflict with hosted mode.
      billing_address_collection: 'auto',
      automatic_tax: { enabled: false },
    };

    // Prefill email for signed-in users
    if (typeof email === 'string' && email.trim().includes('@')) {
      params.customer_email = email.trim();
    }

    if (useEmbedded) {
      // Embedded Checkout: use return_url, DO NOT set success_url/cancel_url
      params.ui_mode = 'embedded';
      // Include session_id token in the return so you can confirm/route after payment if you later mount embedded UI
      params.return_url = `${site}/subscriptions?status=success&session_id={CHECKOUT_SESSION_ID}`;
    } else {
      // Hosted Checkout: use success/cancel URLs, DO NOT set ui_mode
      params.success_url = `${site}/subscriptions?status=success`;
      params.cancel_url = `${site}/subscriptions?status=cancelled`;
    }

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({
      id: session.id,
      clientSecret: session.client_secret ?? null, // present only for embedded
      url: session.url ?? null,                    // present only for hosted
    });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal error' },
      { status: 500 }
    );
  }
}
