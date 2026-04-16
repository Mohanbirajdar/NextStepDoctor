'use client';
import { motion } from 'framer-motion';
import { PanelLeft, Plus, Activity, Sparkles, Shield, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import useUIStore from '@/store/uiStore';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import ThemeToggle from '@/components/common/ThemeToggle';
import ProfileModal from '@/components/profile/ProfileModal';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';

export default function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { clearChat, messages } = useChatStore();
  const { token, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <header className="h-12 sm:h-14 border-b border-white/10 bg-header backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 shrink-0 z-20">
      {/* Left — toggle + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200"
          title="Toggle sidebar"
        >
          <PanelLeft size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Activity size={15} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f1117] animate-pulse" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white tracking-tight">NextStepDoctor</span>
            <span className="text-xs text-white/35 font-mono hidden sm:block">AI Research</span>
          </div>
        </div>
      </div>

      {/* Center — status pill */}
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <Sparkles size={11} className="text-emerald-400" />
        <span className="text-xs text-emerald-300 font-medium">Groq · Llama 3.1 · Live</span>
      </div>

      {/* Right — trust badge + new chat */}
      <div className="flex items-center gap-2 relative">
        <ThemeToggle />
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full">
          <Shield size={11} className="text-white/40" />
          <span className="text-xs text-white/35">Evidence-based</span>
        </div>

        {!token && (
          <button
            onClick={() => setSignInOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
          >
            Sign in
          </button>
        )}
        {!token && (
          <button
            onClick={() => setSignUpOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
          >
            Sign up
          </button>
        )}
        {token && (
          <button
            onClick={() => setProfileOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
          >
            Profile
          </button>
        )}

        {token && (
          <button
            onClick={() => { clearAuth(); clearChat(); }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
          >
            Logout
          </button>
        )}

        {/* Mobile overflow menu */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="sm:hidden p-2 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white"
          aria-label="Open menu"
        >
          <MoreHorizontal size={16} />
        </button>

        {mobileMenuOpen && (
          <div className="absolute right-0 top-12 sm:hidden w-44 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-2 z-50">
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-white/70">
              <Shield size={11} className="text-white/50" /> Evidence-based
            </div>
            {!token && (
              <button
                onClick={() => { setSignInOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-left px-2 py-1.5 text-xs text-white/80 hover:bg-white/10 rounded-lg"
              >
                Sign in
              </button>
            )}
            {!token && (
              <button
                onClick={() => { setSignUpOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-left px-2 py-1.5 text-xs text-white/80 hover:bg-white/10 rounded-lg"
              >
                Sign up
              </button>
            )}
            {token && (
              <button
                onClick={() => { setProfileOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-left px-2 py-1.5 text-xs text-white/80 hover:bg-white/10 rounded-lg"
              >
                Profile
              </button>
            )}
            {token && (
              <button
                onClick={() => { clearAuth(); clearChat(); setMobileMenuOpen(false); }}
                className="w-full text-left px-2 py-1.5 text-xs text-white/80 hover:bg-white/10 rounded-lg"
              >
                Logout
              </button>
            )}
          </div>
        )}

        {messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
          >
            <Plus size={13} />
            New Chat
          </motion.button>
        )}
      </div>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSwitch={() => { setSignInOpen(false); setSignUpOpen(true); }}
      />
      <SignUpModal
        open={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onSwitch={() => { setSignUpOpen(false); setSignInOpen(true); }}
      />
    </header>
  );
}
