'use client';
import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  showAnalytics: false,
  showTransparency: true,
  whyModalData: null,
  compareMode: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAnalytics: () => set((s) => ({ showAnalytics: !s.showAnalytics })),
  toggleTransparency: () => set((s) => ({ showTransparency: !s.showTransparency })),
  openWhyModal: (data) => set({ whyModalData: data }),
  closeWhyModal: () => set({ whyModalData: null }),
  setCompareMode: (v) => set({ compareMode: v }),
}));

export default useUIStore;
