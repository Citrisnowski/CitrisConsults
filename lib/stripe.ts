import Stripe from 'stripe';

/**
 * Stripe library initialization. We explicitly set the API version so that
 * upgrading the dependency does not unexpectedly change API behavior. The
 * secret key is never exposed on the client; it must be provided via
 * environment variables on the server.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});