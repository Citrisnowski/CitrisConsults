"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

/**
 * Header component renders a sticky navigation bar across all pages.
 * It listens for Supabase auth state changes to toggle between
 * authenticated and unauthenticated views. When signed in, the user's
 * name (or email local part) is displayed along with a sign‑out button.
 */
export default function Header() {
  const [session, setSession] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
    });
    // Cleanup subscription on unmount
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Refresh the page and send the user home
    router.push('/');
  };

  const accountName = session?.user?.user_metadata?.full_name ??
    session?.user?.email?.split('@')[0] ??
    '';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-lg tracking-tight hover:text-red-600 transition-colors">
          Citris Consulting
        </Link>
        <div className="flex items-center space-x-6 font-medium">
          <Link href="/services" className="hover:text-red-600 transition-colors">Services</Link>
          <Link href="/subscriptions" className="hover:text-red-600 transition-colors">Subscriptions</Link>
          {session ? (
            <>
              <Link href="/account" className="hover:text-red-600 transition-colors">
                {accountName || 'Account'}
              </Link>
              <button onClick={handleSignOut} className="hover:text-red-600 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth" className="hover:text-red-600 transition-colors">Log in / Sign up</Link>
          )}
        </div>
      </nav>
    </header>
  );
}