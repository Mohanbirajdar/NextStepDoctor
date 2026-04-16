'use client';
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

export default function Home() {
  const { messages, context, setContext, clearChat } = useChatStore();
  const { compareMode, setCompareMode } = useUIStore();
  const { sendMessage } = useStream();

  const isStreaming = (useChatStore.getState().messages as any[]).some((m) => m.streaming);

  const handleSend = async (text: string, ctx: any) => {
    const compareIntent = detectCompareIntent(text);
    if (compareIntent) {
      setCompareMode(true);
      return;
    }
    try {
      await sendMessage(text, ctx);
    } catch {
      toast.error('Failed to send. Is the backend running?');
    }
  };

  const handleExampleClick = (example: { query: string; disease: string }) => {
    if (example.disease) setContext({ disease: example.disease });
    handleSend(example.query, { ...context, disease: example.disease });
  };

  const handleFollowUp = (action: string) => {
    handleSend(action, context);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f1a]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2235',
            color: '#f0f6ff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />

      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex flex-col flex-1 overflow-hidden">
          {compareMode ? (
            <div className="flex-1 overflow-y-auto bg-[#0b0f1a]">
              <ComparePanel disease={context.disease} />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState onExampleClick={handleExampleClick} />
          ) : (
            <MessageList messages={messages} onFollowUp={handleFollowUp} />
          )}

          {!compareMode && (
            <ChatInput onSend={handleSend} disabled={isStreaming} />
          )}
        </main>
      </div>
    </div>
  );
}
