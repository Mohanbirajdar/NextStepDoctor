'use client';
import { motion } from 'framer-motion';
import { Search, FlaskConical, BarChart2, Shield, ArrowRight, Zap } from 'lucide-react';

const EXAMPLES = [
  {
    icon: '🫁',
    query: 'Latest treatment for lung cancer',
    disease: 'Lung Cancer',
    tag: 'Oncology',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 hover:border-rose-400/40',
    tagColor: 'text-rose-400 bg-rose-500/10',
  },
  {
    icon: '🩺',
    query: 'Clinical trials for type 2 diabetes',
    disease: 'Diabetes',
    tag: 'Endocrinology',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40',
    tagColor: 'text-blue-400 bg-blue-500/10',
  },
  {
    icon: '🧠',
    query: "Top researchers in Alzheimer's disease",
    disease: "Alzheimer's",
    tag: 'Neurology',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/20 hover:border-violet-400/40',
    tagColor: 'text-violet-400 bg-violet-500/10',
  },
  {
    icon: '❤️',
    query: 'Recent studies on heart disease prevention',
    disease: 'Heart Disease',
    tag: 'Cardiology',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/40',
    tagColor: 'text-emerald-400 bg-emerald-500/10',
  },
];

const FEATURES = [
  { icon: <Search size={13} />, label: 'Multi-source retrieval', sub: 'PubMed · OpenAlex · ClinicalTrials' },
  { icon: <FlaskConical size={13} />, label: 'Clinical trials', sub: 'Live recruiting trials' },
  { icon: <BarChart2 size={13} />, label: 'Research analytics', sub: 'Charts & insights' },
  { icon: <Shield size={13} />, label: 'Explainable AI', sub: 'Full pipeline transparency' },
];

const container = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const item = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function EmptyState({ onExampleClick }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          className="w-full max-w-2xl"
          variants={container}
          initial="initial"
          animate="animate"
        >
          {/* Hero */}
          <motion.div variants={item} className="text-center mb-10">
            {/* Animated logo */}
            <div className="relative inline-flex mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M4 18 Q9 8 14 18 Q19 28 24 18 Q29 8 32 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </motion.div>
              </div>
              <motion.span
                className="absolute -top-1 -right-1 flex h-4 w-4"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400 border-2 border-[#0f1117]" />
              </motion.span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              NextStepDoctor{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-white/45 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              A transparent, research-grade medical platform. Ask about conditions, treatments, clinical trials, and researchers — all backed by real evidence.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={item} className="flex flex-wrap justify-center gap-2 mb-10">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 hover:text-white/70 hover:bg-white/8 transition-all duration-200"
              >
                <span className="text-emerald-400">{f.icon}</span>
                <span className="font-medium text-white/60">{f.label}</span>
                <span className="hidden sm:block text-white/30">· {f.sub}</span>
              </div>
            ))}
          </motion.div>

          {/* Pipeline teaser */}
          <motion.div
            variants={item}
            className="mb-8 p-3.5 bg-white/3 border border-white/8 rounded-2xl"
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <Zap size={12} className="text-amber-400" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">How it works</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {['Query Expansion', 'Multi-API Retrieval', 'Smart Ranking', 'LLM Reasoning', 'Structured Answer'].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-1">
                  <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{step}</span>
                  {i < arr.length - 1 && <ArrowRight size={10} className="text-white/20 shrink-0" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Example cards */}
          <motion.div variants={item}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 text-center">
              Try an example
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXAMPLES.map((ex) => (
                <motion.button
                  key={ex.query}
                  whileHover={{ scale: 1.025, y: -2 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => onExampleClick(ex)}
                  className={`text-left p-4 bg-gradient-to-br ${ex.color} border rounded-2xl transition-all duration-200 group`}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <span className="text-2xl">{ex.icon}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ex.tagColor}`}>
                      {ex.tag}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white/80 leading-snug mb-1">{ex.query}</p>
                  <div className="flex items-center gap-1 text-xs text-white/35 group-hover:text-white/50 transition-colors">
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    Run research pipeline
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.p variants={item} className="text-center text-xs text-white/20 mt-8">
            Not medical advice. Always consult a qualified healthcare professional.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
