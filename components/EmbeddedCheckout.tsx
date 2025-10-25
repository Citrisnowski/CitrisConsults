"use client";

import { useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface EmbeddedCheckoutProps {
  /**
   * The client secret returned from Stripe when creating an embedded Checkout session.
   */
  clientSecret: string;
}

/**
 * EmbeddedCheckout attempts to mount Stripe’s embedded checkout into a div. If the
 * API is unavailable (for example, when running in test mode without the
 * feature flag), the component silently fails and allows callers to fall back
 * on a redirect to the hosted Checkout page.
 */
export default function EmbeddedCheckout({ clientSecret }: EmbeddedCheckoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = async () => {
      if (!clientSecret) return;
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) return;
      // `initEmbeddedCheckout` is currently in beta and may not be typed. We
      // defensively check for its existence before calling it.
      // @ts-ignore
      if (typeof stripe.initEmbeddedCheckout === 'function') {
        try {
          // @ts-ignore
          const result = await stripe.initEmbeddedCheckout({ clientSecret }, {
            element: containerRef.current!,
          });
          if (result?.error) {
            // eslint-disable-next-line no-console
            console.error('Stripe Embedded Checkout error:', result.error);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to mount embedded checkout', err);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn('Embedded checkout API not available.');
      }
    };
    mount();
  }, [clientSecret]);

  return <div ref={containerRef} id="embedded-checkout" className="w-full" />;
}