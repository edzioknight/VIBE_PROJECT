import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Index() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.onboarding_completed) {
        router.replace('/(tabs)');
      } else if (isAuthenticated && !user?.onboarding_completed) {
        router.replace('/onboarding/basic-info');
      } else {
        router.replace('/auth/landing');
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return <LoadingScreen />;
}