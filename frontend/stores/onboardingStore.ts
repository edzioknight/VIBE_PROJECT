import { create } from 'zustand';
import { OnboardingState } from '@/types/auth';
import { UserProfile } from '@/types/user';

interface OnboardingStore extends OnboardingState {
  setCurrentStep: (step: number) => void;
  setFormData: (data: Partial<UserProfile>) => void;
  completeStep: (step: string) => void;
  resetOnboarding: () => void;
  setError: (error: string | null) => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 0,
  completedSteps: [],
  formData: {},
  isSubmitting: false,
  error: null,

  setCurrentStep: (step: number) => set({ currentStep: step }),
  setFormData: (data: Partial<UserProfile>) => 
    set((state) => ({ formData: { ...state.formData, ...data } })),
  completeStep: (step: string) => 
    set((state) => ({ completedSteps: [...state.completedSteps, step] })),
  resetOnboarding: () => set({
    currentStep: 0,
    completedSteps: [],
    formData: {},
    isSubmitting: false,
    error: null,
  }),
  setError: (error: string | null) => set({ error }),
  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
}));