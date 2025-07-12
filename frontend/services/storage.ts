import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store auth token:', error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
};

export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

export const clearAuthTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear auth tokens:', error);
  }
};