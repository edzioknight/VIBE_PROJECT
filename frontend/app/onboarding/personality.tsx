import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingAPI } from '@/services/onboarding';
import { handleAPIError } from '@/utils/errorHandler';

const INTERESTS = [
  'Travel', 'Music', 'Movies', 'Books', 'Sports', 'Fitness', 'Cooking', 'Art',
  'Photography', 'Dancing', 'Gaming', 'Technology', 'Nature', 'Animals', 'Fashion',
  'Food', 'Wine', 'Coffee', 'Yoga', 'Meditation', 'Hiking', 'Swimming', 'Running',
  'Cycling', 'Rock Climbing', 'Skiing', 'Surfing', 'Tennis', 'Golf', 'Basketball',
  'Football', 'Soccer', 'Baseball', 'Volleyball', 'Badminton', 'Table Tennis'
];

export default function Personality() {
  const { setFormData, setCurrentStep, isSubmitting, setSubmitting, setError } = useOnboardingStore();
  const [mbti, setMbti] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      const response = await onboardingAPI.submitPersonality({
        mbti: mbti || undefined,
        interests,
      });

      if (response.success) {
        setFormData({
          mbti: mbti || undefined,
          interests,
        });
        setCurrentStep(5);
        router.push('/onboarding/photos');
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Personality</Text>
      <Text style={styles.subtitle}>Tell us about your personality and interests</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>MBTI Personality Type (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mbti}
              onValueChange={setMbti}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="INTJ - The Architect" value="INTJ" />
              <Picker.Item label="INTP - The Thinker" value="INTP" />
              <Picker.Item label="ENTJ - The Commander" value="ENTJ" />
              <Picker.Item label="ENTP - The Debater" value="ENTP" />
              <Picker.Item label="INFJ - The Advocate" value="INFJ" />
              <Picker.Item label="INFP - The Mediator" value="INFP" />
              <Picker.Item label="ENFJ - The Protagonist" value="ENFJ" />
              <Picker.Item label="ENFP - The Campaigner" value="ENFP" />
              <Picker.Item label="ISTJ - The Logistician" value="ISTJ" />
              <Picker.Item label="ISFJ - The Protector" value="ISFJ" />
              <Picker.Item label="ESTJ - The Executive" value="ESTJ" />
              <Picker.Item label="ESFJ - The Consul" value="ESFJ" />
              <Picker.Item label="ISTP - The Virtuoso" value="ISTP" />
              <Picker.Item label="ISFP - The Adventurer" value="ISFP" />
              <Picker.Item label="ESTP - The Entrepreneur" value="ESTP" />
              <Picker.Item label="ESFP - The Entertainer" value="ESFP" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Interests (Select all that apply)</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestOption,
                  interests.includes(interest) && styles.interestOptionSelected
                ]}
                onPress={() => toggleInterest(interest)}
                disabled={isSubmitting}
              >
                <Text style={[
                  styles.interestOptionText,
                  interests.includes(interest) && styles.interestOptionTextSelected
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
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
    </ScrollView>
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  interestOptionSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#E91E63',
  },
  interestOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  interestOptionTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
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