import { create } from 'zustand';

interface GlobalUIState {
  appHeaderHeight: number;
  stackHeaderHeight: number;
  tabbarHeight: number;

  // Actions
  setAppHeaderHeight: (value: number) => void;
  setStackHeaderHeight: (value: number) => void;
  setTabbarHeight: (value: number) => void;
}

export const useGlobalUIStore = create<GlobalUIState>()((set, _get) => ({
  // Initial state
  appHeaderHeight: 0,
  stackHeaderHeight: 0,
  tabbarHeight: 0,

  // Actions
  setAppHeaderHeight: (height: number) => {
    set({ appHeaderHeight: height });
  },
  setStackHeaderHeight: (height: number) => {
    set({ stackHeaderHeight: height });
  },
  setTabbarHeight: (height: number) => {
    set({ tabbarHeight: height });
  },
}));
