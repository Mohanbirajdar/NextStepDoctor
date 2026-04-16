'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Button({ children, className, variant = 'primary', size = 'md', disabled, onClick, type = 'button', ...props }) {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent',
    secondary: 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-300',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 border-transparent',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <motion.button
      type={type}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
