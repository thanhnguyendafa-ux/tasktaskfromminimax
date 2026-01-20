import { create } from 'zustand';
import { UserPet } from '@/types';

interface PetState {
  pet: UserPet | null;
  setPet: (pet: UserPet | null) => void;
  updatePet: (updates: Partial<UserPet>) => void;
  feedPet: (hungerRestore: number, happinessBonus: number, xpBonus: number) => void;
  playWithPet: (xpEarned: number) => void;
}

export const usePetStore = create<PetState>((set) => ({
  pet: null,
  setPet: (pet) => set({ pet }),
  updatePet: (updates) => set((state) => ({
    pet: state.pet ? { ...state.pet, ...updates } : null,
  })),
  feedPet: (hungerRestore, happinessBonus, xpBonus) => set((state) => {
    if (!state.pet) return { pet: null };
    return {
      pet: {
        ...state.pet,
        hunger: Math.min(100, state.pet.hunger + hungerRestore),
        happiness: Math.min(100, state.pet.happiness + happinessBonus),
        experience: state.pet.experience + xpBonus,
      },
    };
  }),
  playWithPet: (xpEarned) => set((state) => {
    if (!state.pet) return { pet: null };
    return {
      pet: {
        ...state.pet,
        happiness: Math.min(100, state.pet.happiness + 20),
        energy: Math.max(0, state.pet.energy - 15),
        experience: state.pet.experience + xpEarned,
      },
    };
  }),
}));
