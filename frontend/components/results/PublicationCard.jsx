'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { cardReveal } from '@/lib/animations';
import Badge from '@/components/common/Badge';
import { truncate } from '@/lib/utils';

const SOURCE_VARIANTS = { PubMed: 'blue', OpenAlex: 'emerald' };

function ScoreBar({ label, value, weight }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/45 capitalize">{label.replace(/([A-Z])/g, ' $1')}</span>
        <span className="text-white/30 font-mono">{value.toFixed(2)} × {(weight * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.55, delay: 0.08 }}
        />
      </div>
    </div>
  );
}

function WhyModal({ pub, onClose }) {
  const { scoreBreakdown, score } = pub;
  const weights = { relevance: 0.4, recency: 0.3, citations: 0.2, sourceCredibility: 0.1 };
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#1a2235] border border-white/12 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Why this result?</h3>
            <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{pub.title}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white ml-3 shrink-0 text-xl leading-none">×</button>
        </div>

        <div className="flex items-center gap-3 mb-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="text-3xl font-black text-emerald-400">{((score ?? 0) * 100).toFixed(0)}</span>
          <div>
            <p className="text-xs font-semibold text-emerald-300">Relevance Score</p>
            <p className="text-xs text-emerald-400/60">out of 100</p>
          </div>
        </div>

        {scoreBreakdown ? (
          <div className="space-y-3">
            {Object.entries(scoreBreakdown).map(([key, val]) => (
              <ScoreBar key={key} label={key} value={val} weight={weights[key] ?? 0} />
            ))}
          </div>
        ) : <p className="text-xs text-white/30">Score breakdown not available</p>}

        <p className="text-xs text-white/25 mt-4 pt-3 border-t border-white/8">
          Ranked by relevance, recency, citation count, and source credibility.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function PublicationCard({ pub }) {
  const [showAbstract, setShowAbstract] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  if (!pub) return null;

  const { title, authors = [], year, abstract, source, url, citations, score, journal } = pub;

  return (
    <>
      <motion.div
        variants={cardReveal}
        className="bg-white/4 border border-white/8 rounded-xl p-3 sm:p-4 hover:bg-white/6 hover:border-white/14 transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 min-w-0">
            <BookOpen size={13} className="text-white/25 mt-0.5 shrink-0" />
            <h4 className="text-sm font-semibold text-white/85 leading-snug line-clamp-2">{title}</h4>
          </div>
          {score != null && (
            <div className="shrink-0 flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-400">{((score) * 100).toFixed(0)}</span>
              <span className="text-xs text-white/20 leading-none">score</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-2 ml-4 sm:ml-5">
          {source && <Badge variant={SOURCE_VARIANTS[source] ?? 'default'}>{source}</Badge>}
          {year && <span className="text-xs text-white/40">{year}</span>}
          {citations != null && citations > 0 && <span className="text-xs text-white/30">{citations} citations</span>}
          {journal && <span className="text-xs text-white/30 italic truncate max-w-[160px]">{journal}</span>}
        </div>

        {authors.length > 0 && (
          <p className="text-xs text-white/40 ml-4 sm:ml-5 mb-2 truncate">
            {authors.slice(0, 3).join(', ')}{authors.length > 3 ? ` +${authors.length - 3}` : ''}
          </p>
        )}

        {abstract && (
          <div className="ml-4 sm:ml-5">
            <p className="text-xs text-white/50 leading-relaxed">
              {showAbstract ? abstract : truncate(abstract, 150)}
            </p>
            {abstract.length > 150 && (
              <button
                onClick={() => setShowAbstract((v) => !v)}
                className="text-xs text-emerald-400/70 hover:text-emerald-300 mt-1 flex items-center gap-0.5"
              >
                {showAbstract ? <><ChevronUp size={11} />Less</> : <><ChevronDown size={11} />More</>}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 ml-4 sm:ml-5">
          <button
            onClick={() => setShowWhy(true)}
            className="flex items-center gap-1 text-xs text-white/25 hover:text-emerald-400 transition-colors"
          >
            <HelpCircle size={11} />Why selected?
          </button>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-white/25 hover:text-blue-400 transition-colors ml-auto">
              <ExternalLink size={11} />View paper
            </a>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showWhy && <WhyModal pub={pub} onClose={() => setShowWhy(false)} />}
      </AnimatePresence>
    </>
  );
}
