'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fadeInUp, staggerContainer, cardReveal } from '@/lib/animations';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { compareRequest } from '@/lib/api';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import PublicationCard from '@/components/results/PublicationCard';

const markdownComponents = {
  p: ({ children }) => <p className="text-sm text-zinc-700 leading-relaxed mb-2">{children}</p>,
  ul: ({ children }) => <ul className="space-y-1.5 my-2 list-none pl-0">{children}</ul>,
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm text-zinc-700">
      <span className="text-emerald-500 mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-zinc-800">{children}</strong>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-zinc-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-600">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-200 px-3 py-2 text-zinc-700">{children}</td>
  ),
  tr: ({ children }) => <tr className="hover:bg-zinc-50">{children}</tr>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-zinc-700 mt-4 mb-2">{children}</h3>,
};

function TreatmentColumn({ result }) {
  const { treatment, publications = [], trials = [] } = result;
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mb-3 text-center">
        <h3 className="text-sm font-bold text-emerald-800">{treatment}</h3>
        <p className="text-xs text-emerald-600">
          {publications.length} papers · {trials.length} trials
        </p>
      </div>
      {publications.slice(0, 3).map((pub, i) => (
        <PublicationCard key={pub.url ?? i} pub={pub} />
      ))}
    </div>
  );
}

/* ── Inline compare panel shown when compare mode is active ── */
export function InlineCompareInput({ onSubmit, isLoading }) {
  const [treatmentA, setTreatmentA] = useState('');
  const [treatmentB, setTreatmentB] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!treatmentA.trim() || !treatmentB.trim()) return;
    onSubmit(treatmentA.trim(), treatmentB.trim());
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <GitCompare size={14} className="text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-800">Compare Treatments</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-zinc-500 mb-1">Treatment A</label>
          <input
            value={treatmentA}
            onChange={(e) => setTreatmentA(e.target.value)}
            placeholder="e.g. Immunotherapy"
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-zinc-500 mb-1">Treatment B</label>
          <input
            value={treatmentB}
            onChange={(e) => setTreatmentB(e.target.value)}
            placeholder="e.g. Chemotherapy"
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!treatmentA.trim() || !treatmentB.trim() || isLoading}
          className="shrink-0"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <GitCompare size={14} />}
          Compare
        </Button>
      </form>
    </motion.div>
  );
}

/* ── Main compare results panel ── */
export default function ComparePanel({ disease }) {
  const [treatmentA, setTreatmentA] = useState('');
  const [treatmentB, setTreatmentB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const setCompareMode = useUIStore((s) => s.setCompareMode);
  const context = useChatStore((s) => s.context);

  const handleCompare = async (a, b) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await compareRequest({
        disease: disease ?? context.disease ?? '',
        treatments: [a, b],
        context,
      });
      setResult(data);
    } catch (err) {
      setError(err.message ?? 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <GitCompare size={14} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-800">Compare Treatments</h2>
            {disease && <p className="text-xs text-zinc-500">for {disease}</p>}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCompareMode(false)}>
          <X size={14} /> Close
        </Button>
      </div>

      <InlineCompareInput onSubmit={handleCompare} isLoading={loading} />

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 size={20} className="animate-spin text-emerald-600" />
          <p className="text-sm text-zinc-500">Running parallel research pipelines…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {result && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Comparison summary */}
          {result.comparison && (
            <motion.div variants={fadeInUp} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                <GitCompare size={14} className="text-emerald-600" />
                AI Comparison Summary
              </h3>
              <ReactMarkdown components={markdownComponents}>{result.comparison}</ReactMarkdown>
            </motion.div>
          )}

          {/* Side-by-side results */}
          {result.individualResults?.length === 2 && (
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">Research Evidence</h3>
              <div className="flex gap-4 flex-col sm:flex-row">
                {result.individualResults.map((r, i) => (
                  <TreatmentColumn key={i} result={r} />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
