'use client';
import { cn } from '@/lib/utils';

export default function Badge({ children, className, variant = 'default' }) {
  const variants = {
    default: 'bg-white/8 text-white/50 border-white/12',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    amber:   'bg-amber-500/15 text-amber-300 border-amber-500/25',
    red:     'bg-red-500/15 text-red-300 border-red-500/25',
    blue:    'bg-blue-500/15 text-blue-300 border-blue-500/25',
  };
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      variants[variant] ?? variants.default,
      className,
    )}>
      {children}
    </span>
  );
}
