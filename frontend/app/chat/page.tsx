'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/chat/EmptyState';
import MessageList from '@/components/results/MessageList';
import ComparePanel from '@/components/compare/ComparePanel';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import { useStream } from '@/hooks/useStream';
import { detectCompareIntent } from '@/lib/utils';
import useAuthStore from '@/store/authStore';

export default function ChatPage() {
  const router = useRouter();
  const { messages, context, setContext, clearChat } = useChatStore();
  const { compareMode, setCompareMode } = useUIStore();
  const { sendMessage } = useStream();
  const isStreaming = (useChatStore.getState().messages as any[]).some((m) => m.streaming);
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.push('/');
    }
  }, [token, hasHydrated, router]);

  useEffect(() => {
    if (user) {
      setContext({
        patientName: user.name || '',
        patientAge: user.age || '',
        location: user.location || '',
        sex: user.sex || '',
        weight: user.weight || '',
        allergies: user.allergies || '',
        conditions: user.conditions || user.currentDisease || '',
        currentMeds: user.currentMeds || user.medications || '',
        labValues: user.labValues || '',
      });
    }
  }, [user, setContext]);

  const handleSend = async (text: string, ctx: any) => {
    const compareIntent = detectCompareIntent(text);
    if (compareIntent) {
      setCompareMode(true);
      return;
    }
    try {
      await sendMessage(text, ctx);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send message');
    }
  };

  const handleFollowUp = (action: string) => {
    handleSend(action, context);
  };

  const handleExample = (ex: any) => {
    setContext({ disease: ex.disease });
    handleSend(ex.query, { ...context, disease: ex.disease });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden page-enter">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          {compareMode ? (
            <ComparePanel disease={context.disease} />
          ) : messages.length === 0 ? (
            <EmptyState onExampleClick={handleExample} />
          ) : (
            <MessageList messages={messages} onFollowUp={handleFollowUp} />
          )}
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
