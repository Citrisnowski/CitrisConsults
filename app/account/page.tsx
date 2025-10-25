"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '../../components/Container';
import { supabase } from '../../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

/**
 * Account page is protected and requires the user to be authenticated. When
 * loaded, it fetches the current user via Supabase and redirects to the
 * auth page if no session is found. The page displays basic account
 * information and a placeholder for future subscription management.
 */
export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Immediately check for a user when the component mounts
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth');
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/auth');
      } else {
        setUser(userData.user as unknown as User);
      }
    };
    getUser();
    // Listen for sign out events
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.push('/auth');
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <Container className="py-16 text-center">
        <p>Loading account…</p>
      </Container>
    );
  }

  const accountName = user.user_metadata?.full_name ?? user.email.split('@')[0];

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold mb-6">Account</h1>
      <p className="mb-4"><span className="font-semibold">Name:</span> {accountName}</p>
      <p className="mb-8"><span className="font-semibold">Email:</span> {user.email}</p>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Manage subscription</h2>
        <p className="text-gray-600">Coming soon. Your subscription details will appear here.</p>
      </div>
      <button
        onClick={handleSignOut}
        className="py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
      >
        Sign out
      </button>
    </Container>
  );
}