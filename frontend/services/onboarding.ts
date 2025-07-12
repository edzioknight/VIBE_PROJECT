import { APIResponse } from '@/types/api';
import { UserProfile } from '@/types/user';
import { apiClient } from './api';

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
      formData.append(`photo${index + 1}`, photo as any);
    });

    return apiClient.request('/auth/signup/photos', {
      method: 'POST',
      body: formData,
      headers: {}, // Let fetch set Content-Type for FormData
    });
  },
};