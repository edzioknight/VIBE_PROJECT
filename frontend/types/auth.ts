import { UserProfile } from './user';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  tempToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: string[];
  formData: Partial<UserProfile>;
  isSubmitting: boolean;
  error: string | null;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: {
    userId: string;
    email: string;
    tokenType: string;
    issuedAt: string;
    expiresAt: string;
    timeUntilExpiry: number;
  };
  error?: string;
}