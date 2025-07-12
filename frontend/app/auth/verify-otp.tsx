import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { authAPI } from '@/services/auth';
import { handleAPIError } from '@/utils/errorHandler';

export default function VerifyOTP() {
  const { email, userExists } = useLocalSearchParams<{ email: string; userExists: string }>();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [cooldown, setCooldown] = useState(0); // Cooldown for resend button
  const { signIn, isLoading, tempToken, isAuthenticated } = useAuthStore();
  const isExistingUser = userExists === 'true';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    // Handle navigation based on auth state
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else if (tempToken && !isExistingUser) {
      router.replace('/onboarding/basic-info');
    }
  }, [isAuthenticated, tempToken, isExistingUser]);

  const handleVerifyOTP = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    try {
      await signIn(email!, code);
    } catch (error) {
      Alert.alert('Error', 'Invalid code. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    
    try {
      const response = await authAPI.sendOTP(email!);
      if (response.success) {
        Alert.alert('Success', 'A new OTP has been sent to your email');
        setTimeLeft(300); // Reset timer to 5 minutes
        setCooldown(60); // Set 60 second cooldown
      } else {
        Alert.alert('Error', handleAPIError(response.error));
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          editable={!isLoading}
        />
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.timer}>
          Time remaining: {formatTime(timeLeft)}
        </Text>
        
        <TouchableOpacity
          style={[styles.resendButton, cooldown > 0 && styles.resendButtonDisabled]}
          onPress={handleResendOTP}
          disabled={cooldown > 0}
        >
          <Text style={[styles.resendButtonText, cooldown > 0 && styles.resendButtonTextDisabled]}>
            {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    letterSpacing: 5,
  },
  button: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
});