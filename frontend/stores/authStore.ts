import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '@/types/auth';
import { UserProfile } from '@/types/user';
import { authAPI } from '@/services/auth';
import { setAuthToken, setRefreshToken, clearAuthTokens } from '@/services/storage';

interface AuthStore extends AuthState {
  signIn: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  logoutFromAllDevices: () => Promise<void>;
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
            if (response.data.user_exists && response.data.user && response.data.access_token && response.data.refresh_token) {
              // Existing user with complete profile
              await setAuthToken(response.data.access_token);
              await setRefreshToken(response.data.refresh_token);
              
              set({
                isAuthenticated: true,
                user: response.data.user,
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                tempToken: null,
                isLoading: false,
              });
            } else if (!response.data.user_exists && response.data.temp_token) {
              // New user, needs onboarding
              set({
                tempToken: response.data.temp_token,
                isLoading: false,
              });
            } else {
              set({ error: 'Invalid response from server', isLoading: false });
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
        
        await clearAuthTokens();
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
          await clearAuthTokens();
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
            await setAuthToken(response.data.access_token);
            await setRefreshToken(response.data.refresh_token);
            
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
      setTokens: (accessToken: string, refreshToken: string) => {
        setAuthToken(accessToken);
        setRefreshToken(refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
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