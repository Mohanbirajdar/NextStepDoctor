'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart2, ChevronDown, ChevronUp, TrendingUp, Users, Building2, Activity } from 'lucide-react';
import { useState } from 'react';
import { staggerContainer, cardReveal } from '@/lib/animations';

const STATUS_COLORS = {
  RECRUITING:             '#10b981',
  ACTIVE_NOT_RECRUITING:  '#3b82f6',
  COMPLETED:              '#6b7280',
  NOT_YET_RECRUITING:     '#f59e0b',
  TERMINATED:             '#ef4444',
  Unknown:                '#374151',
};
const BAR_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#14b8a6', '#06b6d4', '#0ea5e9'];

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2235] border border-white/12 rounded-xl px-3 py-2 shadow-2xl text-xs">
      {label && <p className="font-semibold text-white/70 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#10b981' }}>
          {p.name}: <strong className="text-white">{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, icon, children }) {
  return (
    <motion.div variants={cardReveal} className="bg-white/3 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-emerald-400/80">{icon}</span>
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </motion.div>
  );
}

export default function AnalyticsPanel({ analytics }) {
  const [open, setOpen] = useState(false);
  if (!analytics) return null;

  const {
    publicationsByYear = [], trialStatusDistribution = [],
    topAuthors = [], topInstitutions = [],
    totalPublications = 0, totalTrials = 0, avgCitations = 0,
    sourceDistribution = {},
  } = analytics;

  const RADIAN = Math.PI / 180;
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600">{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <div className="mt-3 border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/20 rounded flex items-center justify-center">
            <BarChart2 size={9} className="text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-white/50">Research Analytics</span>
          <span className="text-xs text-white/25">{totalPublications} papers · {totalTrials} trials</span>
        </div>
        {open ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="analytics"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Quick stats */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Publications', value: totalPublications, color: 'text-emerald-400' },
                  { label: 'Trials', value: totalTrials, color: 'text-blue-400' },
                  { label: 'Avg Citations', value: avgCitations, color: 'text-amber-400' },
                  ...Object.entries(sourceDistribution).map(([src, cnt]) => ({
                    label: src, value: cnt, color: 'text-white/60'
                  })),
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center bg-white/4 border border-white/8 rounded-xl px-4 py-2 min-w-[72px]">
                    <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                    <span className="text-xs text-white/30">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                variants={staggerContainer} initial="initial" animate="animate"
              >
                {publicationsByYear.length > 0 && (
                  <ChartCard title="Publications by Year" icon={<TrendingUp size={13} />}>
                    <ResponsiveContainer width="100%" height={170}>
                      <LineChart data={publicationsByYear} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<DarkTooltip />} />
                        <Line type="monotone" dataKey="count" name="Papers" stroke="#10b981" strokeWidth={2.5}
                          dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#34d399' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {trialStatusDistribution.length > 0 && (
                  <ChartCard title="Trial Status" icon={<Activity size={13} />}>
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie data={trialStatusDistribution} dataKey="count" nameKey="status"
                          innerRadius={40} outerRadius={68} paddingAngle={2}
                          labelLine={false} label={renderPieLabel}>
                          {trialStatusDistribution.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.status] ?? STATUS_COLORS.Unknown} />
                          ))}
                        </Pie>
                        <Tooltip content={<DarkTooltip />} />
                        <Legend iconType="circle" iconSize={7}
                          formatter={(v) => <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {topAuthors.length > 0 && (
                  <ChartCard title="Top Authors" icon={<Users size={13} />}>
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart data={topAuthors.slice(0, 6).map(d => ({ ...d, author: d.author.length > 16 ? d.author.slice(0, 16) + '…' : d.author }))}
                        layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="author" type="category" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} width={88} />
                        <Tooltip content={<DarkTooltip />} />
                        <Bar dataKey="count" name="Papers" radius={[0, 4, 4, 0]}>
                          {topAuthors.slice(0, 6).map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {topInstitutions.length > 0 && (
                  <ChartCard title="Top Institutions" icon={<Building2 size={13} />}>
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart data={topInstitutions.slice(0, 6).map(d => ({ ...d, institution: d.institution.length > 16 ? d.institution.slice(0, 16) + '…' : d.institution }))}
                        layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="institution" type="category" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} width={88} />
                        <Tooltip content={<DarkTooltip />} />
                        <Bar dataKey="count" name="Papers" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
