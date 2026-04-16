'use client';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div
      className={cn(
        'border-2 border-zinc-200 border-t-emerald-600 rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  );
}
