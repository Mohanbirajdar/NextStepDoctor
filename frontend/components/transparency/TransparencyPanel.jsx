'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Search, Filter, Brain, BarChart2, Clock, Database, Star, CheckCircle2, Loader2, Circle } from 'lucide-react';
import { useState } from 'react';
import usePipelineStore from '@/store/pipelineStore';
import useUIStore from '@/store/uiStore';
import { pipelineStage, fadeIn } from '@/lib/animations';

const STAGE_ICONS = {
  query_expansion:   <Zap size={11} />,
  retrieval_started: <Search size={11} />,
  ranking:           <Filter size={11} />,
  llm_reasoning:     <Brain size={11} />,
  analytics_building: <BarChart2 size={11} />,
};

function StageRow({ stage }) {
  const icon = STAGE_ICONS[stage.id] ?? <Circle size={11} />;
  const isDone    = stage.status === 'complete';
  const isRunning = stage.status === 'running';

  return (
    <motion.div variants={pipelineStage} className="flex items-start gap-3 py-1">
      <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center
        ${isDone    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : ''}
        ${isRunning ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : ''}
        ${!isDone && !isRunning ? 'border-white/10 bg-transparent text-white/20' : ''}
      `}>
        {isRunning ? <Loader2 size={9} className="animate-spin" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-medium
            ${isDone ? 'text-white/70' : isRunning ? 'text-amber-300' : 'text-white/25'}`}>
            {stage.label}
          </span>
          <span className="text-xs text-white/25 font-mono shrink-0">
            {stage.timeMs ? `${(stage.timeMs / 1000).toFixed(1)}s` : ''}
            {isRunning && <span className="ml-1 text-amber-400 animate-pulse">●</span>}
          </span>
        </div>
        {isDone && stage.data && <StageData id={stage.id} data={stage.data} />}
      </div>
    </motion.div>
  );
}

function StageData({ id, data }) {
  if (id === 'query_expansion' && data.expandedQueries) {
    return (
      <ul className="mt-1 space-y-0.5">
        {data.expandedQueries.map((q, i) => (
          <li key={i} className="text-xs text-white/35 font-mono truncate">› {q}</li>
        ))}
      </ul>
    );
  }
  if ((id === 'retrieval_started' || id === 'retrieval_complete') && data.total != null) {
    return (
      <div className="flex gap-3 mt-1 text-xs text-white/35">
        <span>OpenAlex: <strong className="text-white/55">{data.openAlex}</strong></span>
        <span>PubMed: <strong className="text-white/55">{data.pubmed}</strong></span>
        <span>Trials: <strong className="text-white/55">{data.clinicalTrials}</strong></span>
        <span className="text-emerald-400/80 font-medium">= {data.total}</span>
      </div>
    );
  }
  if (id === 'ranking' && data.topPublications != null) {
    return (
      <div className="flex gap-3 mt-1 text-xs text-white/35">
        <span>Papers: <strong className="text-white/55">{data.topPublications}</strong></span>
        <span>Trials: <strong className="text-white/55">{data.topTrials}</strong></span>
        {data.topScore && <span>Best: <strong className="text-white/55">{data.topScore.toFixed(2)}</strong></span>}
      </div>
    );
  }
  return null;
}

/* ── Live pipeline panel (shown while streaming) ── */
export function PipelineStreamPanel() {
  const { stages, isStreaming } = usePipelineStore();
  if (!isStreaming && stages.every((s) => s.status === 'pending')) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3 bg-white/3 border border-white/8 rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        {isStreaming
          ? <Loader2 size={12} className="animate-spin text-emerald-400" />
          : <CheckCircle2 size={12} className="text-emerald-400" />}
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          {isStreaming ? 'Pipeline running…' : 'Pipeline complete'}
        </span>
      </div>
      <motion.div
        className="space-y-0.5"
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
        initial="initial" animate="animate"
      >
        {stages.map((s) => <StageRow key={s.id} stage={s} />)}
      </motion.div>
    </motion.div>
  );
}

/* ── Full transparency detail panel (on completed messages) ── */
export default function TransparencyPanel({ transparency }) {
  const [open, setOpen] = useState(false);
  const { showTransparency } = useUIStore();
  if (!transparency || !showTransparency) return null;

  return (
    <div className="mt-3 border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/10 rounded flex items-center justify-center">
            <Search size={9} className="text-white/50" />
          </div>
          <span className="text-xs font-semibold text-white/50">Pipeline Transparency</span>
          <span className="text-xs text-white/25 font-mono">{transparency.model ?? 'llama-3.1-8b-instant'}</span>
        </div>
        {open ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {transparency.queryExpansions?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1.5">Query Expansions</p>
                  <ul className="space-y-1">
                    {transparency.queryExpansions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/50 font-mono bg-white/4 border border-white/8 rounded-lg px-2.5 py-1.5">
                        <span className="text-emerald-400/70 shrink-0">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transparency.retrievalStats && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1.5">Retrieval Sources</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(transparency.retrievalStats).map(([src, stat]) => (
                      <div key={src} className="bg-white/4 border border-white/8 rounded-lg p-2 text-center">
                        <p className="text-base font-bold text-white/80">{stat?.count ?? '—'}</p>
                        <p className="text-xs text-white/30 capitalize">{src}</p>
                        {stat?.timeMs && <p className="text-xs text-white/20 font-mono">{(stat.timeMs / 1000).toFixed(1)}s</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/8 mt-3">
                {[
                  { icon: <Database size={11} />, label: 'Retrieved', value: transparency.totalRetrieved },
                  { icon: <Filter size={11} />, label: 'Filtered to', value: transparency.afterFiltering },
                  { icon: <Star size={11} />, label: 'Top score', value: transparency.topScore?.toFixed(2) ?? '—' },
                  { icon: <Clock size={11} />, label: 'Total time', value: `${((transparency.totalTimeMs ?? 0) / 1000).toFixed(1)}s` },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-0.5">
                    <span className="text-emerald-400/70">{s.icon}</span>
                    <span className="text-sm font-bold text-white/80">{s.value}</span>
                    <span className="text-xs text-white/30">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
