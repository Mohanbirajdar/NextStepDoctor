'use client';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, FlaskConical, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cardReveal } from '@/lib/animations';
import Badge from '@/components/common/Badge';
import { truncate } from '@/lib/utils';

function statusVariant(status) {
  return {
    RECRUITING: 'emerald',
    ACTIVE_NOT_RECRUITING: 'blue',
    COMPLETED: 'default',
    NOT_YET_RECRUITING: 'amber',
    TERMINATED: 'red',
  }[status] ?? 'default';
}

const STATUS_LABEL = {
  RECRUITING: 'Recruiting',
  ACTIVE_NOT_RECRUITING: 'Active',
  COMPLETED: 'Completed',
  NOT_YET_RECRUITING: 'Not Yet Open',
  TERMINATED: 'Terminated',
};

export default function TrialCard({ trial }) {
  if (!trial) return null;
  const [showFull, setShowFull] = useState(false);
  const {
    title,
    status = 'Unknown',
    phase,
    locations = [],
    contacts = [],
    url,
    eligibility,
    eligibilityFull,
    eligibilityAssessment,
    score,
  } = trial;
  const assessment = eligibilityAssessment?.status;
  const reasons = eligibilityAssessment?.reasons || [];

  return (
    <motion.div
      variants={cardReveal}
      className="bg-white/4 border border-white/8 rounded-xl p-3 sm:p-4 hover:bg-white/6 hover:border-white/14 transition-all duration-200"
    >
      <div className="flex items-start gap-2 mb-2">
        <FlaskConical size={13} className="text-emerald-400/60 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white/85 leading-snug line-clamp-2">{title}</h4>
        </div>
        {score != null && (
          <span className="text-xs font-bold text-emerald-400 shrink-0">{((score) * 100).toFixed(0)}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3 ml-4 sm:ml-5">
        <Badge variant={statusVariant(status)}>{STATUS_LABEL[status] ?? status}</Badge>
        {phase && phase !== 'N/A' && <Badge variant="default">{phase}</Badge>}
      </div>

      {eligibility && (
        <div className="ml-4 sm:ml-5 mb-2">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Eligibility criteria</p>
          <p className="text-xs text-white/45 leading-relaxed">
            {showFull && eligibilityFull ? eligibilityFull : truncate(eligibility, 200)}
          </p>
          {eligibilityFull && eligibilityFull.length > 200 && (
            <button
              onClick={() => setShowFull((v) => !v)}
              className="mt-1 text-xs text-emerald-300/70 hover:text-emerald-300 flex items-center gap-1"
            >
              {showFull ? <><ChevronUp size={11} />Less</> : <><ChevronDown size={11} />More</>}
            </button>
          )}
        </div>
      )}

      {assessment && (
        <div className="ml-4 sm:ml-5 mb-2">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Eligibility assessment</p>
          <p className="text-xs text-white/60">
            {assessment}
            {reasons.length > 0 ? ` — ${reasons.join('; ')}` : ''}
          </p>
          <p className="text-[11px] text-white/35 mt-1">Heuristic estimate based on provided profile.</p>
        </div>
      )}

      {locations.length > 0 && (
        <div className="flex items-start gap-1.5 ml-4 sm:ml-5 mb-1.5">
          <MapPin size={11} className="text-white/25 mt-0.5 shrink-0" />
          <p className="text-xs text-white/40">
            {locations.slice(0, 3).join(' · ')}{locations.length > 3 ? ` +${locations.length - 3} more` : ''}
          </p>
        </div>
      )}

      {contacts.length > 0 && (
        <div className="ml-4 sm:ml-5 mb-1.5">
          <div className="flex items-start gap-1.5">
            <Users size={11} className="text-white/25 mt-0.5 shrink-0" />
            <p className="text-xs text-white/40">{contacts[0]}</p>
          </div>
          {contacts[1] && (
            <p className="text-xs text-white/40 ml-5">{contacts[1]}</p>
          )}
        </div>
      )}

      {url && (
        <div className="mt-3 ml-4 sm:ml-5">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-300 font-medium transition-colors">
            <ExternalLink size={11} />View on ClinicalTrials.gov
          </a>
        </div>
      )}
    </motion.div>
  );
}
