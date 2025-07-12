import { APIResponse } from '@/types/api';
import { UserProfile } from '@/types/user';
import { apiClient } from './api';

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