import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-gesture-handler';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingAPI } from '@/services/onboarding';
import { validateName, validateAge } from '@/utils/validation';
import { handleAPIError } from '@/utils/errorHandler';

export default function BasicInfo() {
  const { setFormData, setCurrentStep, isSubmitting, setSubmitting, setError } = useOnboardingStore();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [date, setDate] = useState(new Date(2000, 0, 1)); // Default to January 1, 2000
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>('male');

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    // Format date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setDateOfBirth(`${year}-${month}-${day}`);
  };

  const handleContinue = async () => {
    if (!name || !dateOfBirth) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateName(name)) {
      Alert.alert('Error', 'Name must be between 2 and 50 characters');
      return;
    }

    if (!validateAge(dateOfBirth)) {
      Alert.alert('Error', 'You must be 18 or older to use this app');
      return;
    }

    setSubmitting(true);
    try {
      const response = await onboardingAPI.submitBasicInfo({
        name,
        date_of_birth: dateOfBirth,
        gender,
      });

      if (response.success) {
        setFormData({ name, date_of_birth: dateOfBirth, gender });
        setCurrentStep(1);
        router.push('/onboarding/location');
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
      <Text style={styles.title}>Basic Information</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            editable={!isSubmitting}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
            disabled={isSubmitting}
          >
            <Text style={dateOfBirth ? styles.dateText : styles.datePlaceholder}>
              {dateOfBirth || "Select your date of birth"}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))} // 18+ only
              minimumDate={new Date(1920, 0, 1)} // Reasonable minimum
            />
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Non-binary" value="non-binary" />
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#999',
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