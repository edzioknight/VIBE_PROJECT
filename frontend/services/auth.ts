import { APIResponse } from '@/types/api';
import { UserProfile, TokenValidationResult } from '@/types/user';
import { apiClient } from './api';

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

  async googleSignIn(idToken: string): Promise<APIResponse<{
    user_exists: boolean;
    access_token?: string;
    refresh_token?: string;
    temp_token?: string;
    user?: UserProfile;
    message?: string;
  }>> {
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

  async validateToken(token: string): Promise<APIResponse<TokenValidationResult>> {
    return apiClient.request('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};