import { create } from 'zustand';
import { Profile } from '@/types';

interface UserState {
  profile: Profile | null;
  isAuthenticated: boolean;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isAuthenticated: false,
  setProfile: (profile) => set({ profile, isAuthenticated: !!profile }),
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null,
  })),
  addCoins: (amount) => set((state) => ({
    profile: state.profile ? { ...state.profile, coins: state.profile.coins + amount } : null,
  })),
  addXp: (amount) => set((state) => {
    if (!state.profile) return { profile: null };
    const newXp = state.profile.xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    return {
      profile: { ...state.profile, xp: newXp, level: newLevel },
    };
  }),
  logout: () => set({ profile: null, isAuthenticated: false }),
}));
