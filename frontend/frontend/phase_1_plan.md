# Frontend Phase 1 Plan: Authentication & User Management

## Phase 1 Objectives
Build the authentication flow and user management screens for VibesMatch React Native app. This phase covers landing screen, sign-in/sign-up flows, onboarding process, and basic profile management.

## Screen Structure

### Authentication Flow
```
Landing Screen → Sign In/Sign Up → OTP Verification → [Existing User: Main App] | [New User: Onboarding Flow]
```

### Onboarding Flow
```
Basic Info → Location → Lifestyle → Preferences → Personality → Photos → Complete
```

## API Integration

### Base API Configuration
```typescript
// services/api.ts
const API_BASE_URL = 'https://api.vibesmatch.com/api/v1';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  meta?: {
    pagination?: {
      cursor: string;
      hasMore: boolean;
    };
  };
}

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    return response.json();
  }
};
```

### Authentication API Calls
```typescript
// services/auth.ts
export const authAPI = {
  async sendOTP(email: string): Promise<APIResponse<{ message: string; expires_in: number }>> {
    return apiClient.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyOTP(email: string, code: string): Promise<APIResponse<{
    user_exists: boolean;
    access_token?: string;
    refresh_token?: string;
    temp_token?: string;
    user?: UserProfile;
    message?: string;
  }>> {
    return apiClient.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async googleSignIn(idToken: string): Promise<APIResponse<any>> {
    return apiClient.request('/auth/google-signin', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
  },

  async refreshToken(refreshToken: string): Promise<APIResponse<{
    access_token: string;
    refresh_token: string;
  }>> {
    return apiClient.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  async logout(): Promise<APIResponse<{ message: string }>> {
    return apiClient.request('/auth/logout', {
      method: 'POST',
    });
  },

  async logoutAll(): Promise<APIResponse<{ message: string }>> {
    return apiClient.request('/auth/logout-all', {
      method: 'POST',
    });
  },

  async validateToken(token: string): Promise<APIResponse<{
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
  }>> {
    return apiClient.request('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};
```

### Onboarding API Calls
```typescript
// services/onboarding.ts
export const onboardingAPI = {
  async submitBasicInfo(data: {
    name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'non-binary';
  }): Promise<APIResponse<{ message: string; next_step: string }>> {
    return apiClient.request('/auth/signup/basic-info', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitLocation(data: {
    country: string;
    state?: string;
    city?: string;
  }): Promise<APIResponse<{ message: string; next_step: string }>> {
    return apiClient.request('/auth/signup/location', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitLifestyle(data: {
    exercise?: string;
    education?: string;
    job?: string;
    drinking?: string;
    smoking?: string;
    kids?: string;
    ethnicity?: string;
    religion?: string;
  }): Promise<APIResponse<{ message: string; next_step: string }>> {
    return apiClient.request('/auth/signup/lifestyle', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitPreferences(data: {
    relationship_type?: string;
    current_status?: string;
    sexuality?: string;
    looking_for?: string;
    preferences?: string[];
    preferred_genders?: string[];
  }): Promise<APIResponse<{ message: string; next_step: string }>> {
    return apiClient.request('/auth/signup/preferences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitPersonality(data: {
    mbti?: string;
    interests?: string[];
  }): Promise<APIResponse<{ message: string; next_step: string }>> {
    return apiClient.request('/auth/signup/personality', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitPhotos(photos: File[]): Promise<APIResponse<{
    message: string;
    access_token: string;
    refresh_token: string;
    user: UserProfile;
  }>> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photo${index + 1}`, photo);
    });

    return apiClient.request('/auth/signup/photos', {
      method: 'POST',
      body: formData,
      headers: {}, // Let fetch set Content-Type for FormData
    });
  },
};
```

### Profile API Calls
```typescript
// services/profile.ts
export const profileAPI = {
  async getProfile(): Promise<APIResponse<{ user: UserProfile }>> {
    return apiClient.request('/users/profile');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<APIResponse<{
    message: string;
    user: UserProfile;
  }>> {
    return apiClient.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getOnboardingStatus(): Promise<APIResponse<{ onboardingCompleted: boolean }>> {
    return apiClient.request('/users/onboarding-status');
  },

  async checkUserExists(email: string): Promise<APIResponse<{ exists: boolean }>> {
    return apiClient.request(`/users/check-exists?email=${encodeURIComponent(email)}`);
  },

  async getUserById(userId: string): Promise<APIResponse<{ user: UserProfile }>> {
    return apiClient.request(`/users/${userId}`);
  },
};
```

## Type Definitions

### User Types
```typescript
// types/user.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'non-binary';
  country: string;
  state?: string;
  city?: string;
  bio?: string;
  profile_photos: string[];
  
  // Lifestyle
  exercise?: string;
  education?: string;
  job?: string;
  drinking?: string;
  smoking?: string;
  kids?: string;
  ethnicity?: string;
  religion?: string;
  
  // Preferences
  relationship_type?: string;
  current_status?: string;
  sexuality?: string;
  looking_for?: string;
  preferences: string[];
  preferred_genders: string[];
  
  // Personality
  mbti?: string;
  interests: string[];
  
  // Settings
  allow_search: boolean;
  show_activity_status: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Status
  is_premium: boolean;
  premium_expires_at?: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  last_active: string;
  created_at: string;
}
```

### Auth Types
```typescript
// types/auth.ts
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
```

## State Management

### Auth Store
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore extends AuthState {
  signIn: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setTempToken: (token: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      tempToken: null,
      isLoading: false,
      error: null,

      signIn: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.verifyOTP(email, code);
          if (response.success && response.data) {
            if (response.data.user_exists) {
              // Check if onboarding is completed
              const isOnboardingCompleted = response.data.user?.onboarding_completed || false;
              set({
                isAuthenticated: true,
                user: response.data.user!,
                accessToken: response.data.access_token!,
                refreshToken: response.data.refresh_token!,
                tempToken: null,
                isLoading: false,
              });
              
              // If onboarding is not completed, redirect to the appropriate step
              if (!isOnboardingCompleted) {
                // Logic to determine which onboarding step to navigate to
                // This will be handled by the navigation logic in the app
              }
            } else {
              set({
                tempToken: response.data.temp_token!,
                isLoading: false,
              });
            }
          } else {
            set({ error: response.error?.message || 'Sign in failed', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      signOut: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          tempToken: null,
          error: null,
        });
      },

      logoutFromAllDevices: async () => {
        try {
          await authAPI.logoutAll();
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            tempToken: null,
            error: null,
          });
        } catch (error) {
          console.error('Logout from all devices error:', error);
          set({ error: 'Failed to logout from all devices' });
        }
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await authAPI.refreshToken(refreshToken);
          if (response.success && response.data) {
            set({
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token,
            });
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          get().signOut();
        }
      },

      setUser: (user: UserProfile) => set({ user }),
      setTokens: (accessToken: string, refreshToken: string) => 
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setTempToken: (token: string) => set({ tempToken: token }),
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

### Onboarding Store
```typescript
// stores/onboardingStore.ts
import { create } from 'zustand';

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
```

## Screen Components

### Landing Screen
```typescript
// app/auth/landing.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Landing() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VibesMatch</Text>
        <Text style={styles.subtitle}>Find your perfect match</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/auth/signin')}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  secondaryButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Sign In Screen
```typescript
// app/auth/signin.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { authAPI } from '@/services/auth';
import { profileAPI } from '@/services/profile';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  
  // Google Sign In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: Constants.expoConfig?.extra?.googleClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // First check if the user exists
      const existsResponse = await profileAPI.checkUserExists(email);
      if (existsResponse.success) {
        setUserExists(existsResponse.data?.exists);
      }

      const response = await authAPI.sendOTP(email);
      if (response.success) {
        // Show appropriate message based on whether user exists
        const message = userExists 
          ? 'OTP sent! Please enter the code to sign in.' 
          : 'OTP sent! Please enter the code to create your account.';
        Alert.alert('Success', message);
        
        router.push({
          pathname: '/auth/verify-otp',
          params: { email, userExists: userExists ? 'true' : 'false' },
        });
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        setIsLoading(true);
        
        // Get the access token
        const { authentication } = result;
        
        // Call the backend with the ID token
        const response = await authAPI.googleSignIn(authentication?.idToken || '');
        
        if (response.success && response.data) {
          if (response.data.user_exists) {
            // User exists, navigate to main app
            // Navigation will be handled by auth state change
          } else {
            // New user, navigate to onboarding
            router.push({
              pathname: '/onboarding/basic-info',
            });
          }
        } else {
          Alert.alert('Error', response.error?.message || 'Google sign in failed');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  form: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### OTP Verification Screen
```typescript
// app/auth/verify-otp.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import Constants from 'expo-constants';

export default function VerifyOTP() {
  const { email, userExists } = useLocalSearchParams<{ email: string; userExists: string }>();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [cooldown, setCooldown] = useState(0); // Cooldown for resend button
  const { signIn, isLoading } = useAuthStore();
  const isExistingUser = userExists === 'true';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleVerifyOTP = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    try {
      await signIn(email!, code);
      // Navigation will be handled by auth state change
    } catch (error) {
      Alert.alert('Error', 'Invalid code. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    
    try {
      const response = await authAPI.sendOTP(email!);
      if (response.success) {
        Alert.alert('Success', 'A new OTP has been sent to your email');
        setTimeLeft(300); // Reset timer to 5 minutes
        setCooldown(60); // Set 60 second cooldown
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
        />
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.timer}>
          Time remaining: {formatTime(timeLeft)}
        </Text>
        
        <TouchableOpacity
          style={[styles.resendButton, cooldown > 0 && styles.resendButtonDisabled]}
          onPress={handleResendOTP}
          disabled={cooldown > 0}
        >
          <Text style={[styles.resendButtonText, cooldown > 0 && styles.resendButtonTextDisabled]}>
            {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    letterSpacing: 5,
  },
  button: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
});
```

### Onboarding Basic Info Screen
```typescript
// app/onboarding/basic-info.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-gesture-handler';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingAPI } from '@/services/onboarding';

export default function BasicInfo() {
  const { setFormData, setCurrentStep, isSubmitting, setSubmitting, setError } = useOnboardingStore();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [date, setDate] = useState(new Date(2000, 0, 1)); // Default to January 1, 2000
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>('male');

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    // Format date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setDateOfBirth(`${year}-${month}-${day}`);
  };

  const handleContinue = async () => {
    if (!name || !dateOfBirth) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      Alert.alert('Error', 'You must be 18 or older to use this app');
      return;
    }

    setSubmitting(true);
    try {
      const response = await onboardingAPI.submitBasicInfo({
        name,
        date_of_birth: dateOfBirth,
        gender,
      });

      if (response.success) {
        setFormData({ name, date_of_birth: dateOfBirth, gender });
        setCurrentStep(1);
        router.push('/onboarding/location');
      } else {
        setError(response.error?.message || 'Failed to save basic info');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic Information</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={dateOfBirth ? styles.dateText : styles.datePlaceholder}>
              {dateOfBirth || "Select your date of birth"}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))} // 18+ only
              minimumDate={new Date(1920, 0, 1)} // Reasonable minimum
            />
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={styles.picker}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Non-binary" value="non-binary" />
            </Picker>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## UI Components

### Loading Screen
```typescript
// components/ui/LoadingScreen.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E91E63" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
```

### Error Screen
```typescript
// components/ui/ErrorScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorScreenProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#E91E63',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Navigation Flow

### Auth Navigation
```typescript
// app/auth/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ title: 'Sign In' }} />
      <Stack.Screen name="verify-otp" options={{ title: 'Verify OTP' }} />
    </Stack>
  );
}
```

### Onboarding Navigation
```typescript
// app/onboarding/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { profileAPI } from '@/services/profile';

export default function OnboardingLayout() {
  const { user, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // If user is authenticated, check onboarding status
    if (isAuthenticated && user) {
      const checkOnboardingStatus = async () => {
        try {
          const response = await profileAPI.getOnboardingStatus();
          if (response.success && response.data?.onboardingCompleted) {
            // If onboarding is completed, redirect to main app
            router.replace('/(tabs)');
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error);
        }
      };
      
      checkOnboardingStatus();
    }
  }, [isAuthenticated, user]);
  
  return (
    <Stack>
      <Stack.Screen name="basic-info" options={{ title: 'Basic Info' }} />
      <Stack.Screen name="location" options={{ title: 'Location' }} />
      <Stack.Screen name="lifestyle" options={{ title: 'Lifestyle' }} />
      <Stack.Screen name="preferences" options={{ title: 'Preferences' }} />
      <Stack.Screen name="personality" options={{ title: 'Personality' }} />
      <Stack.Screen name="photos" options={{ title: 'Photos' }} />
    </Stack>
  );
}
```

## Error Handling

### Network Error Handling
```typescript
// utils/errorHandler.ts
export const handleAPIError = (error: any) => {
  if (error.code === 'NETWORK_ERROR') {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  
  if (error.code === 'INVALID_TOKEN') {
    return 'Session expired. Please sign in again.';
  }
  
  return error.message || 'An unexpected error occurred.';
};
```

### Form Validation
```typescript
// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAge = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age >= 18;
};

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50;
};
```

## Testing Requirements

### Unit Tests
- Test all API service functions
- Test state management stores
- Test validation utilities
- Test error handling
- Test new endpoints: `logoutAll`, `validateToken`, `getOnboardingStatus`, `checkUserExists`, `getUserById`

### Integration Tests
- Test complete authentication flow
- Test onboarding process
- Test API integration
- Test navigation flows
- Test user existence check during sign-in
- Test onboarding status check and appropriate routing
- Test logout from all devices functionality

### UI Tests
- Test screen rendering
- Test form interactions
- Test error states
- Test loading states
- Test user feedback based on existence check
- Test navigation based on onboarding status

## Performance Considerations

### Image Optimization
- Use Expo Image for better performance
- Implement lazy loading for profile photos
- Compress images before upload

### State Management
- Use Zustand persist for offline support
- Implement state hydration
- Clear sensitive data on logout

### API Optimization
- Implement request caching
- Add retry logic for failed requests
- Use connection pooling
- Implement request deduplication