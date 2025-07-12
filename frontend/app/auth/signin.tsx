import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { authAPI } from '@/services/auth';
import { profileAPI } from '@/services/profile';
import { validateEmail } from '@/utils/validation';
import { handleAPIError } from '@/utils/errorHandler';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  
  // Google Sign In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: Constants.expoConfig?.extra?.googleClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // First check if the user exists
      const existsResponse = await profileAPI.checkUserExists(email);
      if (existsResponse.success) {
        setUserExists(existsResponse.data?.exists || false);
      }

      const response = await authAPI.sendOTP(email);
      if (response.success) {
        // Show appropriate message based on whether user exists
        const message = userExists 
          ? 'OTP sent! Please enter the code to sign in.' 
          : 'OTP sent! Please enter the code to create your account.';
        Alert.alert('Success', message);
        
        router.push({
          pathname: '/auth/verify-otp',
          params: { email, userExists: userExists ? 'true' : 'false' },
        });
      } else {
        Alert.alert('Error', handleAPIError(response.error));
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        setIsLoading(true);
        
        // Get the access token
        const { authentication } = result;
        
        // Call the backend with the ID token
        const response = await authAPI.googleSignIn(authentication?.idToken || '');
        
        if (response.success && response.data) {
          if (response.data.user_exists) {
            // User exists, navigation will be handled by auth state change
            Alert.alert('Success', 'Signed in successfully!');
          } else {
            // New user, navigate to onboarding
            router.push('/onboarding/basic-info');
          }
        } else {
          Alert.alert('Error', handleAPIError(response.error));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading || !request}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
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
    marginBottom: 30,
    color: '#333',
  },
  form: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
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
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});