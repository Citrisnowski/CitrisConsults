"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '../../components/Container';
import { supabase } from '../../lib/supabaseClient';

interface Plan {
  name: string;
  bullets: string[];
  priceId: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    bullets: [
      'Starter website setup',
      'Email support',
      'Monthly maintenance updates',
      'Core analytics snapshot',
    ],
    priceId: process.env.NEXT_PUBLIC_PRICE_BASIC ?? '',
    highlight: false,
  },
  {
    name: 'Pro',
    bullets: [
      'Custom design & components',
      'Priority support',
      'Weekly maintenance updates',
      'Advanced analytics & dashboards',
    ],
    priceId: process.env.NEXT_PUBLIC_PRICE_PRO ?? '',
    highlight: true,
  },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!priceId) return;

    // Require login first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth?next=/subscriptions');
      return;
    }

    const email = session.user?.email ?? undefined;

    setLoadingPlan(priceId);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 👇 include email to prefill Stripe Checkout
        body: JSON.stringify({ priceId, email }),
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const data = await res.json();

      if (data.clientSecret && data.url) {
        // If you add embedded UI later, mount with clientSecret.
        // For now we redirect to hosted Checkout.
        window.location.href = data.url;
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL or client secret returned.');
      }
    } catch (error) {
      console.error('Subscription error', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Container className="py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">Choose your plan</h1>
      <div className="grid gap-8 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 flex flex-col space-y-4 shadow-sm hover:shadow-md transition-shadow ${plan.highlight ? 'border-red-600' : 'border-gray-200'}`}
          >
            <h2 className="text-2xl font-semibold mb-2 text-center">{plan.name}</h2>
            <ul className="flex-1 space-y-2">
              {plan.bullets.map((item) => (
                <li key={item} className="text-gray-600 flex items-start">
                  <span className="mr-2 text-red-600">•</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={!plan.priceId || loadingPlan === plan.priceId}
              className={`mt-4 py-2 px-4 rounded-lg font-semibold text-white transition-colors ${plan.highlight ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-900'} disabled:opacity-50`}
            >
              {loadingPlan === plan.priceId ? 'Processing…' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </Container>
  );
}
