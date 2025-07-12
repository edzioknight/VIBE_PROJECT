import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { onboardingAPI } from '@/services/onboarding';
import { handleAPIError } from '@/utils/errorHandler';
import { setAuthToken, setRefreshToken } from '@/services/storage';

export default function Photos() {
  const { isSubmitting, setSubmitting, setError } = useOnboardingStore();
  const { setUser, setTokens } = useAuthStore();
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can upload up to 6 photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }

    setSubmitting(true);
    try {
      // Convert URIs to File objects for upload
      const photoFiles: File[] = [];
      for (const photoUri of photos) {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        photoFiles.push(file);
      }

      const response = await onboardingAPI.submitPhotos(photoFiles);

      if (response.success && response.data) {
        // Store tokens and user data
        await setAuthToken(response.data.access_token);
        await setRefreshToken(response.data.refresh_token);
        
        setTokens(response.data.access_token, response.data.refresh_token);
        setUser(response.data.user);
        
        Alert.alert(
          'Welcome to VibesMatch!',
          'Your profile has been created successfully.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        setError(handleAPIError(response.error));
        Alert.alert('Error', handleAPIError(response.error));
      }
    } catch (error) {
      const errorMessage = 'Failed to upload photos. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Add Photos</Text>
      <Text style={styles.subtitle}>Add at least one photo to complete your profile</Text>
      
      <View style={styles.photosGrid}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
              disabled={isSubmitting}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {photos.length < 6 && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={pickImage}
            disabled={isSubmitting}
          >
            <Text style={styles.addPhotoText}>+</Text>
            <Text style={styles.addPhotoLabel}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.photoCount}>
        {photos.length}/6 photos
      </Text>
      
      <TouchableOpacity
        style={[styles.button, (photos.length === 0 || isSubmitting) && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={photos.length === 0 || isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
        </Text>
      </TouchableOpacity>
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
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    width: '48%',
    aspectRatio: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: '48%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  addPhotoText: {
    fontSize: 40,
    color: '#ccc',
    marginBottom: 5,
  },
  addPhotoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  photoCount: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
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