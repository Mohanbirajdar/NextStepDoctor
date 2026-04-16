'use client';
import { motion } from 'framer-motion';
import { cardReveal } from '@/lib/animations';
import { cn } from '@/lib/utils';

export default function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      variants={cardReveal}
      className={cn(
        'bg-white border border-zinc-200 rounded-xl shadow-sm',
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
