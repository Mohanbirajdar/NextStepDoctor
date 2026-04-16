'use client';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerRequest } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function SignUpPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerRequest({ name, email, password, age, location, medicalHistory });
      setAuth(data.token, data.user);
      router.push('/chat');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 page-shell page-enter">
      <div className="w-full max-w-md page-card rounded-2xl p-6">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <p className="text-sm text-white/50 mt-1">Create your NextStepDoctor account.</p>

        {error && <div className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Name"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <input
            type="number"
            placeholder="Age"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={age}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={location}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
          />
          <textarea
            placeholder="Medical history (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[80px]"
            value={medicalHistory}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMedicalHistory(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-3 py-2"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-white/40 mt-4">
          Have an account? <Link href="/auth/sign-in" className="text-emerald-400">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
