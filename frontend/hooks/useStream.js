'use client';
import { useCallback } from 'react';
import useChatStore from '@/store/chatStore';
import usePipelineStore from '@/store/pipelineStore';
import { endpoints } from '@/lib/api';

export function useStream() {
  const { addMessage, addConversation, updateLastMessage, setActiveConversation } = useChatStore();
  const { startStream, updateStage, completeStream } = usePipelineStore();

  const sendMessage = useCallback(
    async (text, context) => {
      const conversationId = useChatStore.getState().activeConversationId;

      addMessage({ role: 'user', content: text });
      addMessage({ role: 'assistant', content: '', streaming: true });
      startStream();

      try {
        const response = await fetch(endpoints.chatStream, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, context, conversationId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));
              handleEvent(event, text, context);
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (error) {
        updateLastMessage({ streaming: false, error: error.message });
        completeStream();
      }

      function handleEvent(event, originalText, ctx) {
        const { stage, status, data, timeMs } = event;

        const pipelineStages = [
          'query_expansion',
          'retrieval_started',
          'retrieval_complete',
          'ranking',
          'llm_reasoning',
          'analytics_building',
        ];

        if (pipelineStages.includes(stage)) {
          updateStage(stage, { status, data, timeMs });
        }

        if (stage === 'complete') {
          const { conversationId: convId, message: msg } = data;
          setActiveConversation(convId);

          const existing = useChatStore
            .getState()
            .conversations.find((c) => c._id === convId);
          if (!existing) {
            addConversation({
              _id: convId,
              title: originalText.slice(0, 60),
              context: ctx,
            });
          }

          updateLastMessage({ ...msg, streaming: false });
          completeStream();
        }

        if (stage === 'error') {
          updateLastMessage({ streaming: false, error: event.message });
          completeStream();
        }
      }
    },
    [addMessage, addConversation, updateLastMessage, setActiveConversation, startStream, updateStage, completeStream],
  );

  return { sendMessage };
}
