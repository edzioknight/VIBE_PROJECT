# Frontend Phase 2 Plan: Discovery, Likes, and Basic Matching

## Phase 2 Objectives
Build the core discovery interface and interaction system for VibesMatch. This phase covers the main swiping screen, profile cards, interaction buttons, and basic match notifications.

## Screen Structure

### Discovery Screen (`app/(tabs)/index.tsx`)
Main discovery interface with profile cards and interaction buttons.

**Features:**
- Stack of user profile cards
- Heart (Like), Cross (Dislike), Super Like, Direct Message buttons
- Scroll-down to reveal detailed profile information
- Smooth card transitions and animations
- Match notification modals
- Empty state handling

### Profile Detail View (Integrated)
Detailed profile view revealed by scrolling down on cards.
The profile details are revealed through an animated expansion within the card itself, triggered by a scroll-up gesture.

**Features:**
- Full bio and extended information
- Multiple photos with swipe gallery
- All interests and lifestyle information
- Interaction buttons (no Dislike button on detail view)
- Smooth animation transitions with spring physics
- Animated expansion within the card (not a separate screen)
- Gesture-based interaction for natural feel
- Backdrop blur effect for visual depth

## API Integration

### Discovery API Client
```typescript
// services/discovery.ts
export interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  country: string;
  profile_photos: string[];
  bio?: string;
  interests: string[];
  sexuality?: string;
  mbti?: string;
  exercise?: string;
  education?: string;
  job?: string;
  drinking?: string;
  smoking?: string;
  kids?: string;
  ethnicity?: string;
  religion?: string;
  relationship_type?: string;
  current_status?: string;
  looking_for?: string;
  preferences: string[];
  is_online: boolean;
  last_active: string;
  distance?: number;
}

export interface ActionResult {
  message: string;
  action_id: string;
  match_found: boolean;
  match?: {
    id: string;
    user: {
      id: string;
      name: string;
      profile_photos: string[];
    };
    matched_at: string;
  };
}

export interface DiscoveryStats {
  likes_remaining: number;
  likes_reset_at: string;
  total_likes_sent: number;
  total_matches: number;
  profiles_viewed_today: number;
}

export const discoveryAPI = {
  async getProfiles(limit: number = 10, cursor?: string): Promise<APIResponse<{
    profiles: DiscoveryProfile[];
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
        total: number;
      };
    };
  }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });
    
    return apiClient.request(`/discovery/profiles?${params}`);
  },

  async recordAction(targetId: string, actionType: 'like' | 'dislike'): Promise<APIResponse<ActionResult>> {
    return apiClient.request('/discovery/action', {
      method: 'POST',
      body: JSON.stringify({
        target_id: targetId,
        action_type: actionType,
      }),
    });
  },

  async getStats(): Promise<APIResponse<DiscoveryStats>> {
    return apiClient.request('/discovery/stats');
  },

  async getUserProfile(userId: string): Promise<APIResponse<{
    profile: DiscoveryProfile;
    interaction_status: {
      has_liked: boolean;
      has_super_liked: boolean;
      has_messaged: boolean;
      is_matched: boolean;
      can_message: boolean;
    };
  }>> {
    return apiClient.request(`/users/${userId}/profile`);
  },
};
```

## State Management

### Discovery Store
```typescript
// stores/discoveryStore.ts
import { create } from 'zustand';

interface DiscoveryState {
  profiles: DiscoveryProfile[];
  currentIndex: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  stats: DiscoveryStats | null;
  hasMore: boolean;
  cursor: string | null;
}

interface DiscoveryActions {
  fetchProfiles: (refresh?: boolean) => Promise<void>;
  loadMoreProfiles: () => Promise<void>;
  recordAction: (targetId: string, actionType: 'like' | 'dislike') => Promise<ActionResult | null>;
  nextProfile: () => void;
  fetchStats: () => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDiscoveryStore = create<DiscoveryState & DiscoveryActions>((set, get) => ({
  profiles: [],
  currentIndex: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  stats: null,
  hasMore: true,
  cursor: null,

  fetchProfiles: async (refresh = false) => {
    const { isLoading, isLoadingMore } = get();
    if (isLoading || isLoadingMore) return;

    set({ isLoading: true, error: null });
    
    try {
      const response = await discoveryAPI.getProfiles(10, refresh ? undefined : get().cursor);
      
      if (response.success && response.data) {
        const newProfiles = response.data.profiles;
        const { pagination } = response.data.meta;
        
        set({
          profiles: refresh ? newProfiles : [...get().profiles, ...newProfiles],
          cursor: pagination.cursor,
          hasMore: pagination.hasMore,
          currentIndex: refresh ? 0 : get().currentIndex,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load profiles', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  loadMoreProfiles: async () => {
    const { hasMore, isLoading, isLoadingMore, profiles, currentIndex } = get();
    
    // Load more when we're near the end
    if (!hasMore || isLoading || isLoadingMore || profiles.length - currentIndex > 3) return;

    set({ isLoadingMore: true });
    
    try {
      const response = await discoveryAPI.getProfiles(10, get().cursor);
      
      if (response.success && response.data) {
        const newProfiles = response.data.profiles;
        const { pagination } = response.data.meta;
        
        set({
          profiles: [...get().profiles, ...newProfiles],
          cursor: pagination.cursor,
          hasMore: pagination.hasMore,
          isLoadingMore: false,
        });
      } else {
        set({ isLoadingMore: false });
      }
    } catch (error) {
      set({ isLoadingMore: false });
    }
  },

  recordAction: async (targetId: string, actionType: 'like' | 'dislike') => {
    try {
      const response = await discoveryAPI.recordAction(targetId, actionType);
      
      if (response.success && response.data) {
        // Remove the profile from the current list
        const { profiles, currentIndex } = get();
        const newProfiles = profiles.filter(p => p.id !== targetId);
        
        set({
          profiles: newProfiles,
          currentIndex: currentIndex >= newProfiles.length ? Math.max(0, newProfiles.length - 1) : currentIndex,
        });

        // Refresh stats
        get().fetchStats();
        
        // Load more profiles if needed
        get().loadMoreProfiles();
        
        return response.data;
      } else {
        set({ error: response.error?.message || 'Action failed' });
        return null;
      }
    } catch (error) {
      set({ error: 'Network error' });
      return null;
    }
  },

  nextProfile: () => {
    const { profiles, currentIndex } = get();
    if (currentIndex < profiles.length - 1) {
      set({ currentIndex: currentIndex + 1 });
      get().loadMoreProfiles();
    }
  },

  fetchStats: async () => {
    try {
      const response = await discoveryAPI.getStats();
      if (response.success && response.data) {
        set({ stats: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  setError: (error: string | null) => set({ error }),
  
  reset: () => set({
    profiles: [],
    currentIndex: 0,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    stats: null,
    hasMore: true,
    cursor: null,
  }),
}));
```

## UI Components

### Discovery Screen Component
```typescript
// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { InteractionButtons } from '@/components/ui/InteractionButtons';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { EmptyDiscoveryState } from '@/components/ui/EmptyDiscoveryState';
import { MatchModal } from '@/components/modals/MatchModal';
import { LikeLimitModal } from '@/components/modals/LikeLimitModal';

export default function DiscoveryScreen() {
  const {
    profiles,
    currentIndex,
    isLoading,
    error,
    stats,
    fetchProfiles,
    recordAction,
    nextProfile,
    fetchStats,
    setError,
  } = useDiscoveryStore();

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [showLikeLimitModal, setShowLikeLimitModal] = useState(false);

  useEffect(() => {
    fetchProfiles(true);
    fetchStats();
  }, []);

  const currentProfile = profiles[currentIndex];

  const handleLike = async () => {
    if (!currentProfile) return;
    
    if (stats?.likes_remaining === 0) {
      setShowLikeLimitModal(true);
      return;
    }

    const result = await recordAction(currentProfile.id, 'like');
    
    if (result?.match_found && result.match) {
      setMatchData(result.match);
      setShowMatchModal(true);
    }
  };

  const handleDislike = async () => {
    if (!currentProfile) return;
    await recordAction(currentProfile.id, 'dislike');
  };

  const handleSuperLike = () => {
    // Will be implemented in Phase 4
    Alert.alert('Coming Soon', 'Super Like feature will be available soon!');
  };

  const handleMessage = () => {
    // Will be implemented in Phase 3
    Alert.alert('Coming Soon', 'Direct messaging will be available soon!');
  };

  if (isLoading && profiles.length === 0) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => {
          setError(null);
          fetchProfiles(true);
        }}
      />
    );
  }

  if (profiles.length === 0) {
    return <EmptyDiscoveryState onRefresh={() => fetchProfiles(true)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {currentProfile && (
          <ProfileCard
            profile={currentProfile}
            onSwipeUp={() => {/* Handle profile detail view */}}
          />
        )}
      </View>
      
      <InteractionButtons
        onLike={handleLike}
        onDislike={handleDislike}
        onSuperLike={handleSuperLike}
        onMessage={handleMessage}
        likesRemaining={stats?.likes_remaining}
        showDetailView={false}
      />

      <MatchModal
        visible={showMatchModal}
        matchData={matchData}
        onClose={() => {
          setShowMatchModal(false);
          setMatchData(null);
        }}
      />

      <LikeLimitModal
        visible={showLikeLimitModal}
        resetTime={stats?.likes_reset_at}
        onClose={() => setShowLikeLimitModal(false)}
        onUpgrade={() => {
          setShowLikeLimitModal(false);
          // Navigate to premium upgrade
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
```

### Profile Card Component
```typescript
// components/cards/ProfileCard.tsx
import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { DiscoveryProfile } from '@/services/discovery';

interface ProfileCardProps {
  profile: DiscoveryProfile;
  onSwipeUp?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DETAIL_THRESHOLD = -100;

export function ProfileCard({ profile, onSwipeUp }: ProfileCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      if (event.translationY < DETAIL_THRESHOLD) {
        translateY.value = withSpring(-SCREEN_HEIGHT * 0.6);
        runOnJS(setShowDetails)(true);
        runOnJS(onSwipeUp)?.();
      } else {
        translateY.value = withSpring(0);
        runOnJS(setShowDetails)(false);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: profile.profile_photos[0] }} style={styles.mainImage} />
        
        <View style={styles.overlay}>
          <View style={styles.basicInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.location}>{profile.country}</Text>
              {profile.distance && (
                <Text style={styles.distance}>{profile.distance.toFixed(1)} km away</Text>
              )}
            </View>
            {profile.is_online && (
              <View style={styles.onlineIndicator}>
                <Text style={styles.onlineText}>Online now</Text>
              </View>
            )}
          </View>
        </View>

        {showDetails && (
          <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsContent}>
              {profile.bio && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.bio}>{profile.bio}</Text>
                </View>
              )}

              {profile.interests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Interests</Text>
                  <View style={styles.interestsContainer}>
                    {profile.interests.map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.detailsGrid}>
                  {profile.exercise && (
                    <DetailItem label="Exercise" value={profile.exercise} />
                  )}
                  {profile.education && (
                    <DetailItem label="Education" value={profile.education} />
                  )}
                  {profile.job && (
                    <DetailItem label="Job" value={profile.job} />
                  )}
                  {profile.drinking && (
                    <DetailItem label="Drinking" value={profile.drinking} />
                  )}
                  {profile.smoking && (
                    <DetailItem label="Smoking" value={profile.smoking} />
                  )}
                  {profile.kids && (
                    <DetailItem label="Kids" value={profile.kids} />
                  )}
                  {profile.mbti && (
                    <DetailItem label="Personality" value={profile.mbti} />
                  )}
                  {profile.sexuality && (
                    <DetailItem label="Sexuality" value={profile.sexuality} />
                  )}
                </View>
              </View>

              {profile.profile_photos.length > 1 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>More Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {profile.profile_photos.slice(1).map((photo, index) => (
                      <Image key={index} source={{ uri: photo }} style={styles.additionalPhoto} />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    padding: 20,
  },
  basicInfo: {
    gap: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  age: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  distance: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  onlineIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  onlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  detailsContent: {
    padding: 20,
    paddingTop: 60,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  additionalPhoto: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
  },
});
```

### Interaction Buttons Component
```typescript
// components/ui/InteractionButtons.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Heart, X, Star, MessageCircle } from 'lucide-react-native';

interface InteractionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onSuperLike: () => void;
  onMessage: () => void;
  likesRemaining?: number;
  showDetailView?: boolean;
}

export function InteractionButtons({
  onLike,
  onDislike,
  onSuperLike,
  onMessage,
  likesRemaining,
  showDetailView = false,
}: InteractionButtonsProps) {
  return (
    <View style={styles.container}>
      {likesRemaining !== undefined && likesRemaining <= 5 && (
        <View style={styles.likesRemaining}>
          <Text style={styles.likesText}>
            {likesRemaining} likes remaining
          </Text>
        </View>
      )}
      
      <View style={styles.buttonsContainer}>
        {!showDetailView && (
          <TouchableOpacity style={[styles.button, styles.dislikeButton]} onPress={onDislike}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={[styles.button, styles.superLikeButton]} onPress={onSuperLike}>
          <Star size={20} color="#2196F3" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={onLike}>
          <Heart size={24} color="#E91E63" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.messageButton]} onPress={onMessage}>
          <MessageCircle size={20} color="#9C27B0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  likesRemaining: {
    alignItems: 'center',
    marginBottom: 15,
  },
  likesText: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dislikeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  superLikeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  messageButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
});
```

## Modal Components

### Match Modal
```typescript
// components/modals/MatchModal.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { BlurView } from 'expo-blur';

interface MatchModalProps {
  visible: boolean;
  matchData: any;
  onClose: () => void;
}

export function MatchModal({ visible, matchData, onClose }: MatchModalProps) {
  if (!matchData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={50} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>It's a Match! 💕</Text>
          
          <View style={styles.profileContainer}>
            <Image 
              source={{ uri: matchData.user.profile_photos[0] }} 
              style={styles.profileImage} 
            />
            <Text style={styles.profileName}>{matchData.user.name}</Text>
          </View>
          
          <Text style={styles.subtitle}>
            You and {matchData.user.name} liked each other!
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.messageButton} onPress={onClose}>
              <Text style={styles.messageButtonText}>Send Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
  },
  messageButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  continueButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Like Limit Modal
```typescript
// components/modals/LikeLimitModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Heart } from 'lucide-react-native';

interface LikeLimitModalProps {
  visible: boolean;
  resetTime?: string;
  onClose: () => void;
  onUpgrade: () => void;
}

export function LikeLimitModal({ visible, resetTime, onClose, onUpgrade }: LikeLimitModalProps) {
  const formatResetTime = (time?: string) => {
    if (!time) return '';
    const resetDate = new Date(time);
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Heart size={48} color="#E91E63" />
          </View>
          
          <Text style={styles.title}>Out of Likes!</Text>
          
          <Text style={styles.subtitle}>
            You've used all your likes for now. Come back in {formatResetTime(resetTime)} or upgrade to Premium for unlimited likes.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.waitButton} onPress={onClose}>
              <Text style={styles.waitButtonText}>I'll Wait</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
  },
  upgradeButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  waitButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  waitButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Empty State Component
```typescript
// components/ui/EmptyDiscoveryState.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RefreshCw, Heart } from 'lucide-react-native';

interface EmptyDiscoveryStateProps {
  onRefresh: () => void;
}

export function EmptyDiscoveryState({ onRefresh }: EmptyDiscoveryStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Heart size={64} color="#E91E63" />
      </View>
      
      <Text style={styles.title}>No New Profiles</Text>
      <Text style={styles.subtitle}>
        You've seen everyone in your area! Check back later for new profiles or expand your search preferences.
      </Text>
      
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <RefreshCw size={20} color="#E91E63" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E91E63',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Navigation Updates

### Tab Navigation
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Heart, MessageCircle, User, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E91E63',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discovery',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## Error Handling

### API Error Handling
```typescript
// utils/discoveryErrorHandler.ts
export const handleDiscoveryError = (error: any) => {
  if (error.code === 'LIKE_LIMIT_EXCEEDED') {
    return {
      title: 'Out of Likes!',
      message: 'You\'ve reached your daily like limit. Upgrade to Premium for unlimited likes.',
      action: 'upgrade',
    };
  }
  
  if (error.code === 'USER_BLOCKED') {
    return {
      title: 'Unable to Like',
      message: 'This user is not available.',
      action: 'continue',
    };
  }
  
  if (error.code === 'ALREADY_INTERACTED') {
    return {
      title: 'Already Interacted',
      message: 'You\'ve already liked or disliked this profile.',
      action: 'continue',
    };
  }
  
  return {
    title: 'Something went wrong',
    message: error.message || 'Please try again later.',
    action: 'retry',
  };
};
```

## Performance Optimizations

### Image Optimization
```typescript
// components/ui/OptimizedImage.tsx
import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

interface OptimizedImageProps {
  source: { uri: string };
  style?: any;
  placeholder?: string;
}

export function OptimizedImage({ source, style, placeholder }: OptimizedImageProps) {
  return (
    <Image
      source={source}
      style={style}
      placeholder={placeholder}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
  );
}
```

### Memory Management
```typescript
// hooks/useDiscoveryOptimization.ts
import { useEffect } from 'react';
import { useDiscoveryStore } from '@/stores/discoveryStore';

export function useDiscoveryOptimization() {
  const { profiles, currentIndex } = useDiscoveryStore();

  useEffect(() => {
    // Clean up old profiles to prevent memory leaks
    if (profiles.length > 20 && currentIndex > 10) {
      // Keep only current and next 10 profiles
      const optimizedProfiles = profiles.slice(currentIndex);
      // Update store with optimized profiles
    }
  }, [profiles.length, currentIndex]);
}
```

## Testing Requirements

### Unit Tests
- Test discovery store actions and state updates
- Test API service functions
- Test utility functions (distance calculation, error handling)
- Test component rendering and interactions

### Integration Tests
- Test complete discovery flow
- Test like/dislike actions with API integration
- Test match creation flow
- Test error handling scenarios

### UI Tests
- Test profile card interactions
- Test button functionality
- Test modal displays
- Test empty states and loading states

### Performance Tests
- Test image loading performance
- Test scroll performance with large profile lists
- Test memory usage during extended usage
- Test animation smoothness

## File Structure
```
app/
├── (tabs)/
│   └── index.tsx # Discovery Screen (UPDATED)
components/
├── cards/
│   └── ProfileCard.tsx # NEW
├── ui/
│   ├── InteractionButtons.tsx # NEW
│   ├── EmptyDiscoveryState.tsx # NEW
│   └── OptimizedImage.tsx # NEW
├── modals/
│   ├── MatchModal.tsx # NEW
│   └── LikeLimitModal.tsx # NEW
hooks/
├── useDiscoveryOptimization.ts # NEW
services/
├── discovery.ts # NEW
stores/
├── discoveryStore.ts # NEW
types/
├── discovery.ts # NEW
utils/
├── discoveryErrorHandler.ts # NEW
```

## Accessibility Features
- Screen reader support for all interactive elements
- Proper focus management for modals
- High contrast mode support
- Voice control compatibility
- Haptic feedback for interactions

## Analytics Integration
- Track profile views and interactions
- Monitor like/match conversion rates
- Track user engagement metrics
- Monitor performance metrics
- Track error rates and types

Phase 2 frontend implementation focuses on creating an intuitive, performant, and engaging discovery experience that perfectly integrates with the backend APIs while providing smooth animations and excellent user experience.