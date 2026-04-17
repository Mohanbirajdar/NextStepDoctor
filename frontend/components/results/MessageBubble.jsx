'use client';
import { motion } from 'framer-motion';
import { Activity, User, AlertCircle, ChevronDown, ChevronUp, Volume2, Square } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import StructuredResponse from './StructuredResponse';
import PublicationCard from './PublicationCard';
import TrialCard from './TrialCard';
import AnalyticsPanel from '@/components/analytics/AnalyticsPanel';
import TransparencyPanel from '@/components/transparency/TransparencyPanel';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ExportButton from '@/components/export/ExportButton';

function FollowUpSuggestions({ suggestions, onSelect }) {
  if (!suggestions?.length) return null;
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/8"
    >
      <p className="w-full text-xs text-white/30 font-medium uppercase tracking-wider">Suggested follow-ups</p>
      {suggestions.map((s, i) => (
        <motion.button
          key={i}
          variants={fadeInUp}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(s.action)}
          className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/40 transition-all duration-200 font-medium"
        >
          {s.icon} {s.label}
        </motion.button>
      ))}
    </motion.div>
  );
}

function SectionToggle({ label, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!count) return null;
  return (
    <div className="mt-4 border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/4 hover:bg-white/6 transition-colors text-left"
      >
        <span className="text-xs font-semibold text-white/60">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">{count}</span>
          {open ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
        </div>
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

function CrisisResources({ resources }) {
  if (!resources) return null;
  const { heading, note, resources: list } = resources;
  return (
    <div className="mt-4 border border-red-500/25 bg-red-500/10 rounded-xl p-3 sm:p-4">
      <p className="text-sm text-red-200 font-semibold">{heading}</p>
      <p className="text-xs text-red-200/70 mt-1">{note}</p>
      <div className="mt-3 space-y-2">
        {list?.map((r, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs">
            <div className="text-red-100/90 font-medium">{r.label} · {r.region}</div>
            <div className="text-red-100/70">{r.contact} {r.url ? (
              <a className="underline ml-2" href={r.url} target="_blank" rel="noopener noreferrer">Website</a>
            ) : null}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ message }) {
  return (
    <motion.div variants={fadeInUp} className="flex items-start gap-2 sm:gap-3 justify-end w-full">
      <div className="max-w-[98%] sm:max-w-lg">
        <div className="user-bubble rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2.5 sm:py-3">
          <p className="text-xs sm:text-sm leading-relaxed text-white break-words whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
        <User size={14} className="text-white/60" />
      </div>
    </motion.div>
  );
}

function StreamingBubble() {
  return (
    <motion.div variants={fadeInUp} className="flex items-start gap-2 sm:gap-3 w-full">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 animate-glow-pulse">
        <Activity size={14} className="text-white" />
      </div>
      <div className="flex-1 max-w-3xl">
        <div className="assistant-bubble rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center gap-2.5">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-white/50">Analysing research across sources…</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {[40, 28, 52, 20, 36].map((w, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full bg-white/10 animate-shimmer"
                style={{ width: `${w}px`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ErrorBubble({ error }) {
  return (
    <motion.div variants={fadeInUp} className="flex items-start gap-2 sm:gap-3 w-full">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
        <AlertCircle size={14} className="text-red-400" />
      </div>
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-red-300">
        <strong className="font-semibold">Error:</strong> {error}
      </div>
    </motion.div>
  );
}

function AssistantBubble({ message, onFollowUp, msgId }) {
  const {
    structured, content, publications = [], clinicalTrials = [],
    confidence, analytics, followUps = [], transparency, error, crisisResources, distressSupportMessage,
  } = message;

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const buildSpeakText = () => {
    if (structured) {
      const sections = ['conditionOverview', 'researchInsights', 'clinicalTrials', 'recommendations', 'sources'];
      const text = sections
        .map((k) => structured[k])
        .filter((v) => typeof v === 'string' && v.trim())
        .join('\n\n');
      if (text.trim()) return text;
    }
    return content || '';
  };

  const toggleSpeak = () => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = buildSpeakText();
    if (!text.trim()) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synth.speak(utter);
  };

  if (error) return <ErrorBubble error={error} />;

  return (
    <motion.div variants={fadeInUp} className="flex items-start gap-2 sm:gap-3 w-full">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-emerald-500/20">
        <Activity size={14} className="text-white" />
      </div>
      <div id={`msg-${msgId}`} className="flex-1 w-full max-w-[98%] sm:max-w-3xl">
        <div className="assistant-bubble rounded-2xl rounded-tl-sm px-4 sm:px-5 py-4 sm:py-5">
          {distressSupportMessage ? (
            <div className="mb-4 border border-amber-500/25 bg-amber-500/10 rounded-xl p-3 sm:p-4">
              <p className="text-sm text-amber-100/90">{distressSupportMessage}</p>
            </div>
          ) : null}

          <CrisisResources resources={crisisResources} />

          <StructuredResponse
            structured={structured}
            confidence={confidence}
            fallbackContent={content}
          />

          {publications.length > 0 && (
            <SectionToggle label="Top Publications" count={`${publications.length} papers`}>
              <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
                {publications.slice(0, 6).map((pub, i) => (
                  <PublicationCard key={pub.url ?? i} pub={pub} />
                ))}
              </motion.div>
            </SectionToggle>
          )}

          {clinicalTrials.length > 0 && (
            <SectionToggle label="Clinical Trials" count={`${clinicalTrials.length} found`}>
              <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
                {clinicalTrials.slice(0, 5).map((trial, i) => (
                  <TrialCard key={trial.url ?? i} trial={trial} />
                ))}
              </motion.div>
            </SectionToggle>
          )}

          <AnalyticsPanel analytics={analytics} />
          <TransparencyPanel transparency={transparency} />
          <FollowUpSuggestions suggestions={followUps} onSelect={onFollowUp} />

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={toggleSpeak}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSpeaking
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/80'
              }`}
              title="Listen"
            >
              {isSpeaking ? <Square size={12} className="inline-block mr-1" /> : <Volume2 size={12} className="inline-block mr-1" />}
              {isSpeaking ? 'Stop' : 'Listen'}
            </button>
            <ExportButton msgId={msgId} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MessageBubble({ message, onFollowUp, index }) {
  if (message.role === 'user') return <UserBubble message={message} />;
  if (message.streaming) return <StreamingBubble />;
  return <AssistantBubble message={message} onFollowUp={onFollowUp} msgId={`${index}`} />;
}
