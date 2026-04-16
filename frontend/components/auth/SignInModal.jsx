'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { loginRequest } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function SignInModal({ open, onClose, onSwitch }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest({ email, password });
      setAuth(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 sm:px-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md page-card rounded-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
          aria-label="Close"
        >
          <X size={14} />
        </button>
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
          No account? <button onClick={onSwitch} className="text-emerald-400">Create one</button>
        </p>
      </div>
    </div>
  );
}
