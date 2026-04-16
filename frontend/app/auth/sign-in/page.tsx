'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginRequest } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function SignInPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest({ email, password });
      setAuth(data.token, data.user);
      router.push('/chat');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 page-shell page-enter">
      <div className="w-full max-w-md page-card rounded-2xl p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-white/50 mt-1">Welcome back to NextStepDoctor.</p>

        {error && <div className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-3 py-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-white/40 mt-4">
          No account? <Link href="/auth/sign-up" className="text-emerald-400">Create one</Link>
        </p>
      </div>
    </div>
  );
}
