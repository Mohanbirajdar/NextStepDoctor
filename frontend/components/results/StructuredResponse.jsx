'use client';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion } from 'framer-motion';
import { Heart, Lightbulb, FlaskConical, Star, BookOpen, Sparkles } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const SECTION_META = {
  conditionOverview: {
    icon: <Heart size={13} />,
    label: 'Condition Overview',
    accent: 'border-l-rose-500',
    bg: 'bg-rose-500/5',
    iconColor: 'text-rose-400',
  },
  researchInsights: {
    icon: <Lightbulb size={13} />,
    label: 'Key Research Insights',
    accent: 'border-l-amber-400',
    bg: 'bg-amber-500/5',
    iconColor: 'text-amber-400',
  },
  clinicalTrials: {
    icon: <FlaskConical size={13} />,
    label: 'Clinical Trials',
    accent: 'border-l-blue-400',
    bg: 'bg-blue-500/5',
    iconColor: 'text-blue-400',
  },
  recommendations: {
    icon: <Star size={13} />,
    label: 'Personalized Recommendations',
    accent: 'border-l-emerald-400',
    bg: 'bg-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  sources: {
    icon: <BookOpen size={13} />,
    label: 'Sources',
    accent: 'border-l-white/20',
    bg: 'bg-white/3',
    iconColor: 'text-white/40',
  },
};

const ORDER = ['conditionOverview', 'researchInsights', 'clinicalTrials', 'recommendations', 'sources'];

const md = {
  p: ({ children }) => <p className="text-sm text-white/70 leading-relaxed mb-2 last:mb-0 break-words whitespace-pre-wrap">{children}</p>,
  ul: ({ children }) => <ul className="my-2 space-y-1.5 list-none pl-0">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 space-y-1.5 pl-4 list-decimal text-white/70 text-sm">{children}</ol>,
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm text-white/70 leading-relaxed break-words whitespace-pre-wrap">
      <span className="mt-2 shrink-0 w-1 h-1 rounded-full bg-emerald-400/60 inline-block" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white/90">{children}</strong>,
  em: ({ children }) => <em className="italic text-white/55">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all">
      {children}
    </a>
  ),
  h3: ({ children }) => <h3 className="text-sm font-semibold text-white/80 mt-3 mb-1">{children}</h3>,
  h4: ({ children }) => <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wide mt-2 mb-1">{children}</h4>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-emerald-500/40 pl-3 text-sm text-white/50 italic my-2">{children}</blockquote>
  ),
  scp: ({ children }) => <code className="text-emerald-200/80 bg-white/5 px-1.5 py-0.5 rounded">{children}</code>,
};

function ConfidenceBadge({ confidence }) {
  if (!confidence) return null;
  const colors = {
    High:   'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    Medium: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
    Low:    'text-red-300 bg-red-500/10 border-red-500/25',
  };
  return (
    <motion.div
      variants={fadeInUp}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4 ${colors[confidence.label] || colors.Low}`}
    >
      <Sparkles size={11} />
      <span>Confidence: <strong>{confidence.score}%</strong> ({confidence.label})</span>
      {confidence.explanation && (
        <span className="opacity-60 hidden sm:inline">· {confidence.explanation}</span>
      )}
    </motion.div>
  );
}

function Section({ sectionKey, content }) {
  const meta = SECTION_META[sectionKey];
  if (!meta || !content?.trim()) return null;
  return (
    <motion.div
      variants={fadeInUp}
      className={`border-l-4 ${meta.accent} ${meta.bg} rounded-r-xl pl-3 pr-3 py-3 sm:py-4 break-words`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={meta.iconColor}>{meta.icon}</span>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">{meta.label}</h3>
      </div>
      <ReactMarkdown components={md} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </motion.div>
  );
}

export default function StructuredResponse({ structured, confidence, fallbackContent }) {
  const hasSections = structured && ORDER.some((k) => structured[k]?.trim());
  return (
    <div>
      <ConfidenceBadge confidence={confidence} />
      {hasSections ? (
        <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
          {ORDER.map((key) => <Section key={key} sectionKey={key} content={structured[key]} />)}
        </motion.div>
      ) : (
        <div className="text-sm text-white/65 leading-relaxed">
          {fallbackContent
            ? <ReactMarkdown components={md} rehypePlugins={[rehypeRaw]}>{fallbackContent}</ReactMarkdown>
            : <p className="text-white/30 italic">No response content available.</p>}
        </div>
      )}
    </div>
  );
}
