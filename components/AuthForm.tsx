"use client";

import { useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

type Props = {
  /** Where to go after successful sign-in. If not provided, falls back to ?next=... or /subscriptions */
  nextPath?: string;
};

/**
 * AuthForm implements a simple email/password sign up and sign in flow
 * using Supabase authentication. Users can toggle between modes and are
 * redirected on successful login.
 */
export default function AuthForm({ nextPath }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // Resolve a safe redirect target in this order:
  // 1) prop nextPath (if provided and same-origin relative)
  // 2) ?next=... from URL (if present and same-origin relative)
  // 3) '/subscriptions' (default)
  const redirectTarget = useMemo(() => {
    const isSafe = (p?: string | null) => !!p && p.startsWith('/');
    if (isSafe(nextPath)) return nextPath as string;

    if (typeof window !== 'undefined') {
      const urlNext = new URLSearchParams(window.location.search).get('next');
      if (isSafe(urlNext)) return urlNext as string;
    }
    return '/subscriptions';
  }, [nextPath]);

  const toggleMode = () => {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    setMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === 'signUp') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Account created! Please log in.');
          setMode('signIn');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
        } else {
          setMessage(null);
          // On successful sign in, go to the resolved target
          router.push(redirectTarget);
        }
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-center">
          {mode === 'signIn' ? 'Log in to your account' : 'Create a new account'}
        </h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
            placeholder="••••••••"
          />
        </div>
        {message && (
          <p className="text-sm text-center text-red-600">{message}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'signIn' ? 'Log in' : 'Sign up'}
        </button>
        <p className="text-center text-sm">
          {mode === 'signIn' ? (
            <>
              Don’t have an account?{' '}
              <button type="button" onClick={toggleMode} className="text-red-600 hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={toggleMode} className="text-red-600 hover:underline">
                Log in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
