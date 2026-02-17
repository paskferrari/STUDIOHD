import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingStep {
  id: string;
  completed: boolean;
  dismissedAt?: string;
}

interface OnboardingState {
  // Tutorial flow
  tutorialCompleted: boolean;
  tutorialStep: number;
  showTutorial: boolean;
  
  // Checklist items
  checklistItems: {
    profileCompleted: boolean;
    firstCheckIn: boolean;
    firstTrack: boolean;
    firstMatch: boolean;
    viewedLeaderboard: boolean;
    earnedBadge: boolean;
  };
  
  // Contextual tooltips
  dismissedTooltips: string[];
  
  // Role-specific hints
  roleHints: {
    music: boolean;
    gaming: boolean;
    instrument: boolean;
  };
  
  // Actions
  setTutorialCompleted: (completed: boolean) => void;
  setTutorialStep: (step: number) => void;
  setShowTutorial: (show: boolean) => void;
  completeChecklistItem: (item: keyof OnboardingState['checklistItems']) => void;
  dismissTooltip: (tooltipId: string) => void;
  isTooltipDismissed: (tooltipId: string) => boolean;
  setRoleHintShown: (role: keyof OnboardingState['roleHints']) => void;
  resetOnboarding: () => void;
  getChecklistProgress: () => { completed: number; total: number; percentage: number };
}

const initialState = {
  tutorialCompleted: false,
  tutorialStep: 0,
  showTutorial: false,
  checklistItems: {
    profileCompleted: false,
    firstCheckIn: false,
    firstTrack: false,
    firstMatch: false,
    viewedLeaderboard: false,
    earnedBadge: false,
  },
  dismissedTooltips: [] as string[],
  roleHints: {
    music: false,
    gaming: false,
    instrument: false,
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTutorialCompleted: (completed) => set({ tutorialCompleted: completed }),
      
      setTutorialStep: (step) => set({ tutorialStep: step }),
      
      setShowTutorial: (show) => set({ showTutorial: show }),
      
      completeChecklistItem: (item) => set((state) => ({
        checklistItems: {
          ...state.checklistItems,
          [item]: true,
        },
      })),
      
      dismissTooltip: (tooltipId) => set((state) => ({
        dismissedTooltips: [...state.dismissedTooltips, tooltipId],
      })),
      
      isTooltipDismissed: (tooltipId) => get().dismissedTooltips.includes(tooltipId),
      
      setRoleHintShown: (role) => set((state) => ({
        roleHints: {
          ...state.roleHints,
          [role]: true,
        },
      })),
      
      resetOnboarding: () => set(initialState),
      
      getChecklistProgress: () => {
        const items = get().checklistItems;
        const completed = Object.values(items).filter(Boolean).length;
        const total = Object.keys(items).length;
        return {
          completed,
          total,
          percentage: Math.round((completed / total) * 100),
        };
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
