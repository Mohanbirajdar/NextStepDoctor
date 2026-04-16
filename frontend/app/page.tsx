'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Search, FlaskConical, BarChart2, ArrowRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import ThemeToggle from '@/components/common/ThemeToggle';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';

const features = [
  { icon: <Search size={16} />, title: 'Multi-source retrieval', desc: 'PubMed · OpenAlex · ClinicalTrials' },
  { icon: <FlaskConical size={16} />, title: 'Clinical trials discovery', desc: 'Location‑aware trial matching' },
  { icon: <BarChart2 size={16} />, title: 'Research analytics', desc: 'Evidence summaries & insights' },
];

export default function LandingPage() {
  const token = useAuthStore((s) => s.token);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen text-white page-shell page-enter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="text-sm font-semibold">NextStepDoctor</div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {token ? (
              <Link href="/chat" className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">Go to App</Link>
            ) : (
              <>
                <button onClick={() => setShowSignIn(true)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">Sign in</button>
                <button onClick={() => setShowSignUp(true)} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">Sign up</button>
              </>
            )}
          </div>
        </header>

        <main className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            >
              Evidence‑based medical research assistant
            </motion.h1>
            <p className="mt-4 text-white/60">
              Ask about conditions, treatments, clinical trials, and researchers. Results are ranked, transparent, and personalized to the context you provide.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {token ? (
                <Link href="/chat" className="px-5 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium inline-flex items-center gap-2">
                  Open Chat <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <button onClick={() => setShowSignUp(true)} className="px-5 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium inline-flex items-center gap-2">
                    Get started <ArrowRight size={14} />
                  </button>
                  <button onClick={() => setShowSignIn(true)} className="px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm">Sign in</button>
                </>
              )}
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
              <Shield size={12} /> Not medical advice. Always consult a professional.
            </div>
          </div>

          <div className="grid gap-3">
            {features.map((f) => (
              <div key={f.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400">
                  {f.icon}
                  <span className="text-sm font-semibold text-white">{f.title}</span>
                </div>
                <p className="text-sm text-white/50 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
      <SignInModal
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitch={() => { setShowSignIn(false); setShowSignUp(true); }}
      />
      <SignUpModal
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitch={() => { setShowSignUp(false); setShowSignIn(true); }}
      />
    </div>
  );
}
