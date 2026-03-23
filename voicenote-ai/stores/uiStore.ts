import { create } from 'zustand';
import { ThemeType } from '../types';

interface UiState {
  theme: ThemeType;
  language: string;
  isOnboardingComplete: boolean;
  setTheme: (theme: ThemeType) => void;
  setLanguage: (lang: string) => void;
  completeOnboarding: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'system',
  language: 'fr',
  isOnboardingComplete: false,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  completeOnboarding: () => set({ isOnboardingComplete: true }),
}));
