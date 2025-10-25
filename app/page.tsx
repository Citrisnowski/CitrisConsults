"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '../components/Container';
import { supabase } from '../lib/supabaseClient';

/**
 * Home page featuring the brand promise and a clear call to action. The CTA
 * dynamically links to the authentication page for guests or the
 * subscription selector for signed in users. All copy is supplied by the
 * design brief and should not be altered.
 */
export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);
  return (
    <Container className="flex flex-col items-center justify-center text-center py-24">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
        No Website? No Problem
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
        At Citris Consulting, we work alongside you to build, launch, and maintain a reliable website— without overpaying for results.
      </p>
      <Link
        href={loggedIn ? '/subscriptions' : '/auth'}
        className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full px-8 py-3 transition-colors"
      >
        Get Started
      </Link>
    </Container>
  );
}