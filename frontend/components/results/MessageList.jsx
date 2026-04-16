'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';
import MessageBubble from './MessageBubble';
import { PipelineStreamPanel } from '@/components/transparency/TransparencyPanel';

export default function MessageList({ messages, onFollowUp }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto chat-area">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-8 space-y-6 pb-24 sm:pb-8">
        <AnimatePresence initial={false}>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} onFollowUp={onFollowUp} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        <PipelineStreamPanel />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
