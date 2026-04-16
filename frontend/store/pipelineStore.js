'use client';
import { create } from 'zustand';

const INITIAL_STAGES = [
  { id: 'query_expansion', label: '⚡ Expanding query', status: 'pending', data: null, timeMs: null },
  { id: 'retrieval_started', label: '🔍 Fetching research', status: 'pending', data: null, timeMs: null },
  { id: 'ranking', label: '🎯 Ranking results', status: 'pending', data: null, timeMs: null },
  { id: 'llm_reasoning', label: '🧠 Generating insights', status: 'pending', data: null, timeMs: null },
  { id: 'analytics_building', label: '📊 Building analytics', status: 'pending', data: null, timeMs: null },
];

const usePipelineStore = create((set, get) => ({
  isStreaming: false,
  stages: INITIAL_STAGES,

  startStream: () =>
    set({ isStreaming: true, stages: INITIAL_STAGES.map((s) => ({ ...s, status: 'pending' })) }),

  updateStage: (id, updates) =>
    set({
      stages: get().stages.map((s) =>
        s.id === id || (id === 'retrieval_complete' && s.id === 'retrieval_started')
          ? { ...s, ...updates, status: updates.status || s.status }
          : s
      ),
    }),

  completeStream: () => set({ isStreaming: false }),

  resetStages: () => set({ stages: INITIAL_STAGES, isStreaming: false }),
}));

export default usePipelineStore;
