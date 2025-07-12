import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingAPI } from '@/services/onboarding';
import { handleAPIError } from '@/utils/errorHandler';

export default function Preferences() {
  const { setFormData, setCurrentStep, isSubmitting, setSubmitting, setError } = useOnboardingStore();
  const [relationshipType, setRelationshipType] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [sexuality, setSexuality] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [preferredGenders, setPreferredGenders] = useState<string[]>([]);

  const togglePreferredGender = (gender: string) => {
    setPreferredGenders(prev => 
      prev.includes(gender) 
        ? prev.filter(g => g !== gender)
        : [...prev, gender]
    );
  };

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      const response = await onboardingAPI.submitPreferences({
        relationship_type: relationshipType || undefined,
        current_status: currentStatus || undefined,
        sexuality: sexuality || undefined,
        looking_for: lookingFor || undefined,
        preferences: [], // Will be set in personality step
        preferred_genders: preferredGenders,
      });

      if (response.success) {
        setFormData({
          relationship_type: relationshipType || undefined,
          current_status: currentStatus || undefined,
          sexuality: sexuality || undefined,
          looking_for: lookingFor || undefined,
          preferences: [],
          preferred_genders: preferredGenders,
        });
        setCurrentStep(4);
        router.push('/onboarding/personality');
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
      <Text style={styles.title}>Preferences</Text>
      <Text style={styles.subtitle}>What are you looking for?</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Relationship Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={relationshipType}
              onValueChange={setRelationshipType}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="Casual Dating" value="casual" />
              <Picker.Item label="Serious Relationship" value="serious" />
              <Picker.Item label="Marriage" value="marriage" />
              <Picker.Item label="Friendship" value="friendship" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currentStatus}
              onValueChange={setCurrentStatus}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="Single" value="single" />
              <Picker.Item label="Divorced" value="divorced" />
              <Picker.Item label="Widowed" value="widowed" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sexuality</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sexuality}
              onValueChange={setSexuality}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="Straight" value="straight" />
              <Picker.Item label="Gay" value="gay" />
              <Picker.Item label="Lesbian" value="lesbian" />
              <Picker.Item label="Bisexual" value="bisexual" />
              <Picker.Item label="Pansexual" value="pansexual" />
              <Picker.Item label="Asexual" value="asexual" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Interested In</Text>
          <View style={styles.genderOptions}>
            {['male', 'female', 'non-binary'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  preferredGenders.includes(gender) && styles.genderOptionSelected
                ]}
                onPress={() => togglePreferredGender(gender)}
                disabled={isSubmitting}
              >
                <Text style={[
                  styles.genderOptionText,
                  preferredGenders.includes(gender) && styles.genderOptionTextSelected
                ]}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
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
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genderOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  genderOptionSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#E91E63',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderOptionTextSelected: {
    color: '#fff',
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