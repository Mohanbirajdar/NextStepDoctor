'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Plus, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import useUIStore from '@/store/uiStore';
import useChatStore from '@/store/chatStore';
import { fetchConversations, deleteConversation, fetchConversation } from '@/lib/api';

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const clearChat = useChatStore((s) => s.clearChat);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [isMobile, setIsMobile] = useState(false);
  const {
    conversations, setConversations, setActiveConversation,
    activeConversationId, setMessages, removeConversation,
  } = useChatStore();

  useEffect(() => {
    fetchConversations().then(setConversations).catch(() => {});
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => {
      setIsMobile(mq.matches);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleSelect = async (id) => {
    setActiveConversation(id);
    try {
      const conv = await fetchConversation(id);
      setMessages(conv.messages || []);
    } catch {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteConversation(id).catch(() => {});
    removeConversation(id);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-30"
            />
          )}
          <motion.aside
            initial={{ width: 0, opacity: 0, x: isMobile ? -20 : 0 }}
            animate={{ width: isMobile ? 260 : 240, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: isMobile ? -20 : 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`border-r border-white/10 bg-sidebar overflow-hidden shrink-0 flex flex-col ${isMobile ? 'fixed left-0 top-0 h-full z-40' : ''}`}
          >
          {/* New chat button */}
          <div className="p-2 sm:p-3 border-b border-white/10">
            <button
              onClick={clearChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm font-medium transition-all duration-200 group"
            >
              <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
              New conversation
            </button>
          </div>

          {/* Recent label */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Recent</p>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto sidebar-scroll px-2 pb-2">
            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-10 px-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                  <MessageSquare size={16} className="text-white/40" />
                </div>
                <p className="text-xs text-white/30 leading-relaxed">
                  No conversations yet. Ask your first question below.
                </p>
              </div>
            )}

            <AnimatePresence>
              {conversations.map((conv, i) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  /* ── FIX: outer is a div, not a button, to avoid button-in-button ── */
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(conv._id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelect(conv._id)}
                  className={`relative w-full text-left px-3 py-2.5 rounded-xl mb-0.5 flex items-start gap-2.5 group transition-all duration-200 cursor-pointer
                    ${activeConversationId === conv._id
                      ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40'
                      : 'hover:bg-white/8'
                    }`}
                >
                  <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center
                    ${activeConversationId === conv._id ? 'bg-emerald-500/30' : 'bg-white/10'}`}>
                    <MessageSquare size={10} className={activeConversationId === conv._id ? 'text-emerald-300' : 'text-white/40'} />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p className={`text-xs font-medium truncate leading-snug
                      ${activeConversationId === conv._id ? 'text-emerald-200' : 'text-white/70'}`}>
                      {conv.title || 'Untitled'}
                    </p>
                    {conv.context?.disease && (
                      <p className="text-xs text-white/30 truncate mt-0.5">{conv.context.disease}</p>
                    )}
                  </div>

                  {/* Delete — span not button to avoid nesting */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDelete(e, conv._id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(e, conv._id); }}
                    className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all duration-150"
                  >
                    <Trash2 size={11} />
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2 px-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Stethoscope size={12} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60">NextStepDoctor</p>
                <p className="text-xs text-white/25">AI Research Platform</p>
              </div>
            </div>
          </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
