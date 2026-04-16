'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      messages: [],
      context: { disease: '', location: '', patientName: '', patientAge: '' },
      inputMode: 'natural',

      setContext: (ctx) => set({ context: { ...get().context, ...ctx } }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      setConversations: (conversations) => set({ conversations }),
      addConversation: (conv) => set({ conversations: [conv, ...get().conversations] }),
      setMessages: (messages) => set({ messages }),
      addMessage: (msg) => set({ messages: [...get().messages, msg] }),
      updateLastMessage: (data) => {
        const messages = [...get().messages];
        if (messages.length > 0) {
          messages[messages.length - 1] = { ...messages[messages.length - 1], ...data };
        }
        set({ messages });
      },
      // Reset context.disease so stale diseases don't bleed into new chats
      clearChat: () => set({
        messages: [],
        activeConversationId: null,
        context: { disease: '', location: '', patientName: '', patientAge: '' },
      }),
      setInputMode: (mode) => set({ inputMode: mode }),
      removeConversation: (id) =>
        set({ conversations: get().conversations.filter((c) => c._id !== id) }),
    }),
    // Only persist inputMode — never persist disease/context so stale data can't bleed across sessions
    { name: 'nextstep-chat', partialize: (s) => ({ inputMode: s.inputMode }) }
  )
);

export default useChatStore;
