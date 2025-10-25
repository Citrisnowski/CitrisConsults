"use client";

import { useEffect, useRef } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

interface EmbeddedCheckoutProps {
  /** The client secret returned from your /api/stripe/create-checkout endpoint */
  clientSecret: string;
}

/**
 * Mounts Stripe Embedded Checkout inside a div.
 * - Uses try/catch (no TS access to a non-existent `error` prop).
 * - Gracefully no-ops if publishable key / container / clientSecret are missing.
 * - Cleans up the embedded instance on unmount.
 */
export default function EmbeddedCheckout({ clientSecret }: EmbeddedCheckoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let checkoutInstance: { destroy?: () => void } | null = null;

    (async () => {
      try {
        if (!clientSecret) return;
        if (!containerRef.current) return;

        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          // eslint-disable-next-line no-console
          console.error(
            "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY; cannot mount Embedded Checkout."
          );
          return;
        }

        const stripe: Stripe | null = await loadStripe(publishableKey);
        if (!stripe) {
          // eslint-disable-next-line no-console
          console.error("Stripe failed to initialize (loadStripe returned null).");
          return;
        }

        // initEmbeddedCheckout is not in the public type yet; call via `any`.
        const init = (stripe as any).initEmbeddedCheckout;
        if (typeof init !== "function") {
          // eslint-disable-next-line no-console
          console.warn("Stripe Embedded Checkout API not available in this environment.");
          return;
        }

        const instance = await init({
          clientSecret,
          element: containerRef.current,
        });

        if (!mounted) {
          try {
            instance?.destroy?.();
          } catch {
            /* ignore */
          }
          return;
        }

        checkoutInstance = instance;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Stripe Embedded Checkout init error:", err);
      }
    })();

    return () => {
      mounted = false;
      try {
        checkoutInstance?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [clientSecret]);

  return <div ref={containerRef} id="embedded-checkout" className="w-full" />;
}
