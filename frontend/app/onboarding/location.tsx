import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { TextInput } from 'react-native-gesture-handler';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingAPI } from '@/services/onboarding';
import { handleAPIError } from '@/utils/errorHandler';

export default function Location() {
  const { setFormData, setCurrentStep, isSubmitting, setSubmitting, setError } = useOnboardingStore();
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const handleContinue = async () => {
    if (!country) {
      Alert.alert('Error', 'Please enter your country');
      return;
    }

    setSubmitting(true);
    try {
      const response = await onboardingAPI.submitLocation({
        country,
        state: state || undefined,
        city: city || undefined,
      });

      if (response.success) {
        setFormData({ country, state: state || undefined, city: city || undefined });
        setCurrentStep(2);
        router.push('/onboarding/lifestyle');
      } else {
        setError(handleAPIError(response.error));
        Alert.alert('Error', handleAPIError(response.error));
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location</Text>
      <Text style={styles.subtitle}>Where are you located?</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="Enter your country"
            editable={!isSubmitting}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>State/Province</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={setState}
            placeholder="Enter your state or province (optional)"
            editable={!isSubmitting}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Enter your city (optional)"
            editable={!isSubmitting}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Saving...' : 'Continue'}
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
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});