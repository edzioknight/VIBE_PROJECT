import { APIResponse } from '@/types/api';
import { getAuthToken } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.vibesmatch.com/api/v1';

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
        },
      };
    }
  }
};