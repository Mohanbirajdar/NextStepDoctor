'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LayoutList, MessageCircle, MapPin, User, Loader2, Mic, MicOff } from 'lucide-react';
import useChatStore from '@/store/chatStore';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { inputMode, setInputMode, context, setContext } = useChatStore();
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript || '')
        .join('');
      setText(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim(), context);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = text.trim() && !disabled;

  const toggleRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="border-t border-white/8 bg-[#0b0f1a]/95 backdrop-blur-xl p-3 sm:p-4 chat-input-shell">
      {/* Structured fields */}
      <AnimatePresence>
        {inputMode === 'structured' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {[
                { key: 'disease', placeholder: 'Disease / Condition', icon: <span className="text-xs">🫁</span> },
                { key: 'intentQuery', placeholder: 'Specific intent (e.g. drug, treatment)', icon: <span className="text-xs">🎯</span> },
                { key: 'location', placeholder: 'Location (e.g. Mumbai)', icon: <MapPin size={12} className="text-white/30" /> },
                { key: 'patientName', placeholder: 'Patient name', icon: <User size={12} className="text-white/30" /> },
                { key: 'patientAge', placeholder: 'Age', icon: <span className="text-xs text-white/30">#</span>, type: 'number' },
              ].map(({ key, placeholder, icon, type }) => (
                <div key={key} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
                  <input
                    type={type || 'text'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all duration-200"
                    placeholder={placeholder}
                    value={context[key]}
                    onChange={(e) => setContext({ [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <form onSubmit={handleSubmit}>
        <div className={`flex items-end gap-2 bg-white/5 border rounded-2xl px-2 sm:px-3 py-2 transition-all duration-300 input-focus chat-input-row ${
          disabled ? 'opacity-60 border-white/8' : 'border-white/12'
        }`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={disabled ? 'Researching…' : 'Ask about a condition, treatment, clinical trial, or researcher…'}
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/25 focus:outline-none leading-relaxed py-1 max-h-[140px]"
          />

          {/* Mode toggle */}
          <button
            type="button"
            onClick={() => setInputMode(inputMode === 'natural' ? 'structured' : 'natural')}
            title={inputMode === 'natural' ? 'Switch to structured input' : 'Switch to natural language'}
            className={`shrink-0 p-2 rounded-xl transition-all duration-200 ${
              inputMode === 'structured'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-white/30 hover:text-white/60 hover:bg-white/8'
            }`}
          >
            {inputMode === 'natural' ? <LayoutList size={15} /> : <MessageCircle size={15} />}
          </button>

          {/* Send */}
          <motion.button
            type="submit"
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.08 } : undefined}
            whileTap={canSend ? { scale: 0.93 } : undefined}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              canSend
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 animate-glow-pulse'
                : 'bg-white/8 text-white/20'
            }`}
          >
            {disabled
              ? <Loader2 size={15} className="animate-spin" />
              : <Send size={15} />
            }
          </motion.button>

          {/* Voice input */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled || !recognitionRef.current}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isRecording
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-white/8 text-white/40 hover:text-white/70'
            }`}
            title="Voice input"
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-white/18 mt-2">
        Not medical advice · Always consult a qualified healthcare professional
      </p>
    </div>
  );
}
