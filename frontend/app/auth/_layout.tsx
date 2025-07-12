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