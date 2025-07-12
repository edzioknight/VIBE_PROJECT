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