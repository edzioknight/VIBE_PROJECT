import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  useFrameworkReady();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}