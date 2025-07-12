import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingAPI } from '@/services/onboarding';
import { handleAPIError } from '@/utils/errorHandler';

export default function Lifestyle() {
  const { setFormData, setCurrentStep, isSubmitting, setSubmitting, setError } = useOnboardingStore();
  const [exercise, setExercise] = useState('');
  const [education, setEducation] = useState('');
  const [job, setJob] = useState('');
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [kids, setKids] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [religion, setReligion] = useState('');

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      const response = await onboardingAPI.submitLifestyle({
        exercise: exercise || undefined,
        education: education || undefined,
        job: job || undefined,
        drinking: drinking || undefined,
        smoking: smoking || undefined,
        kids: kids || undefined,
        ethnicity: ethnicity || undefined,
        religion: religion || undefined,
      });

      if (response.success) {
        setFormData({
          exercise: exercise || undefined,
          education: education || undefined,
          job: job || undefined,
          drinking: drinking || undefined,
          smoking: smoking || undefined,
          kids: kids || undefined,
          ethnicity: ethnicity || undefined,
          religion: religion || undefined,
        });
        setCurrentStep(3);
        router.push('/onboarding/preferences');
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
      <Text style={styles.title}>Lifestyle</Text>
      <Text style={styles.subtitle}>Tell us about your lifestyle</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Exercise</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={exercise}
              onValueChange={setExercise}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="Never" value="never" />
              <Picker.Item label="Rarely" value="rarely" />
              <Picker.Item label="Sometimes" value="sometimes" />
              <Picker.Item label="Often" value="often" />
              <Picker.Item label="Daily" value="daily" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Education</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={education}
              onValueChange={setEducation}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="High School" value="high_school" />
              <Picker.Item label="Some College" value="some_college" />
              <Picker.Item label="Bachelor's Degree" value="bachelors" />
              <Picker.Item label="Master's Degree" value="masters" />
              <Picker.Item label="PhD" value="phd" />
              <Picker.Item label="Trade School" value="trade_school" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Drinking</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={drinking}
              onValueChange={setDrinking}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="Never" value="never" />
              <Picker.Item label="Rarely" value="rarely" />
              <Picker.Item label="Socially" value="socially" />
              <Picker.Item label="Often" value="often" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Smoking</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={smoking}
              onValueChange={setSmoking}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="Never" value="never" />
              <Picker.Item label="Rarely" value="rarely" />
              <Picker.Item label="Socially" value="socially" />
              <Picker.Item label="Often" value="often" />
            </Picker>
          </View>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
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