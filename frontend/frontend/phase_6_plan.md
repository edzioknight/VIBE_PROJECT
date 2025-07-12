# Frontend Phase 6 Plan: Advanced Features, Search, and Boost

## Phase 6 Objectives
Implement advanced features, sophisticated search capabilities, and enhanced profile boost system for VibesMatch. This final phase focuses on advanced algorithms, personalization, and features that provide a competitive edge in the dating app market.

## Screen Structure

### Advanced Search System
- **Advanced Search Screen**: Comprehensive multi-criteria search interface
- **Search Results**: Customized results display with compatibility scores
- **Saved Searches**: Management of saved search criteria with notifications
- **Search History**: View and reuse previous searches
- **Filter Builder**: Intuitive filter creation and management

### Recommendation System
- **Daily Picks**: Algorithm-selected daily recommendations
- **Compatibility Details**: In-depth compatibility breakdown
- **Conversation Starters**: AI-generated conversation suggestions
- **Recommendation Feedback**: User feedback for algorithm improvement
- **Recommendation Settings**: Personalization preferences

### Enhanced Boost System
- **Boost Analytics**: Comprehensive boost performance metrics
- **Optimal Timing**: Smart boost time recommendations
- **Boost Scheduling**: Schedule boosts for optimal times
- **Performance Comparison**: Compare boost effectiveness
- **ROI Visualization**: Visual representation of boost value

### Profile Analytics
- **Profile Performance**: Comprehensive profile metrics dashboard
- **Impression Analytics**: View and impression tracking
- **Conversion Funnel**: Like to match to conversation analytics
- **Profile Strength**: Profile completeness and effectiveness score
- **Improvement Suggestions**: AI-powered profile enhancement tips

## API Integration

### Advanced Search API Client
```typescript
// services/advancedSearch.ts
export interface SearchCriteria {
  distance?: {
    min: number;
    max: number;
  };
  age?: {
    min: number;
    max: number;
  };
  height?: {
    min: number;
    max: number;
  };
  education_levels?: string[];
  religions?: string[];
  relationship_types?: string[];
  has_children?: string;
  wants_children?: string;
  drinking_habits?: string[];
  smoking_habits?: string[];
  exercise_frequency?: string[];
  interests?: string[];
  limit?: number;
  save_search?: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  age: number;
  gender: string;
  profile_photos: string[];
  distance: number;
  compatibility_score: number;
  matching_factors: string[];
  is_online: boolean;
  last_active: string;
  has_liked_you: boolean;
  has_super_liked_you: boolean;
}

export interface SavedSearch {
  id: string;
  search_query: SearchCriteria;
  results_count: number;
  saved: boolean;
  search_name?: string;
  created_at: string;
}

export const advancedSearchAPI = {
  async performSearch(criteria: SearchCriteria): Promise<APIResponse<{
    results: SearchResult[];
    total_count: number;
    search_id: string;
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
      };
    };
  }>> {
    return apiClient.request('/search/advanced', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },

  async getSearchHistory(limit: number = 10, savedOnly: boolean = false): Promise<APIResponse<{
    searches: SavedSearch[];
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
      };
    };
  }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      saved_only: savedOnly.toString(),
    });
    
    return apiClient.request(`/search/history?${params}`);
  },

  async saveSearch(searchId: string, name: string, notificationEnabled: boolean = false, notificationFrequency: string = 'weekly'): Promise<APIResponse<{
    message: string;
    saved_search_id: string;
  }>> {
    return apiClient.request('/search/save', {
      method: 'POST',
      body: JSON.stringify({
        search_id: searchId,
        name,
        notification_enabled: notificationEnabled,
        notification_frequency: notificationFrequency,
      }),
    });
  },

  async updateDiscoveryFilters(filters: SearchCriteria): Promise<APIResponse<{
    message: string;
    estimated_matches: number;
  }>> {
    return apiClient.request('/discovery/filters', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },
};
```

### Recommendation API Client
```typescript
// services/recommendations.ts
export interface Recommendation {
  id: string;
  name: string;
  age: number;
  gender: string;
  profile_photos: string[];
  distance: number;
  compatibility_score: number;
  recommendation_reason: string;
  is_online: boolean;
  last_active: string;
}

export interface CompatibilityFactor {
  score: number;
  matching_items: string[];
  weight: number;
}

export interface CompatibilityDetails {
  compatibility_score: number;
  compatibility_factors: {
    interests: CompatibilityFactor;
    values: CompatibilityFactor;
    lifestyle: CompatibilityFactor;
    goals: CompatibilityFactor;
  };
  conversation_starters: string[];
}

export const recommendationsAPI = {
  async getRecommendations(limit: number = 10, refresh: boolean = false): Promise<APIResponse<{
    recommendations: Recommendation[];
    refresh_available_in: number;
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
      };
    };
  }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      refresh: refresh.toString(),
    });
    
    return apiClient.request(`/recommendations?${params}`);
  },

  async getCompatibility(userId: string): Promise<APIResponse<CompatibilityDetails>> {
    return apiClient.request(`/compatibility/${userId}`);
  },

  async provideFeedback(recommendationId: string, feedback: 'relevant' | 'not_relevant', reason?: string): Promise<APIResponse<{
    message: string;
  }>> {
    return apiClient.request(`/recommendations/${recommendationId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        feedback,
        reason,
      }),
    });
  },
};
```

### Enhanced Boost API Client
```typescript
// services/enhancedBoost.ts
export interface BoostAnalytics {
  boost: {
    id: string;
    boost_type: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
  };
  analytics: {
    total_impressions: number;
    profile_views: number;
    likes_received: number;
    super_likes_received: number;
    matches_created: number;
    conversations_started: number;
    roi_score: number;
    hourly_breakdown: {
      hour: string;
      impressions: number;
      profile_views: number;
      likes: number;
    }[];
    comparison_to_normal: {
      impressions_increase: string;
      likes_increase: string;
      matches_increase: string;
    };
  };
}

export interface BoostRecommendation {
  recommended_times: {
    day: string;
    time: string;
    expected_impressions: number;
    expected_likes: number;
    confidence: 'low' | 'medium' | 'high';
  }[];
  user_activity_peak: {
    day: string;
    time: string;
  };
  current_online_users: number;
  current_recommendation: string;
}

export interface ScheduledBoost {
  id: string;
  boost_type: string;
  scheduled_for: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const enhancedBoostAPI = {
  async getBoostAnalytics(boostId: string): Promise<APIResponse<BoostAnalytics>> {
    return apiClient.request(`/boosts/analytics/${boostId}`);
  },

  async getBoostRecommendation(boostType: string): Promise<APIResponse<BoostRecommendation>> {
    return apiClient.request('/analytics/boost-recommendation', {
      method: 'POST',
      body: JSON.stringify({
        boost_type: boostType,
      }),
    });
  },

  async scheduleBoost(boostType: string, scheduledTime: string): Promise<APIResponse<{
    message: string;
    scheduled_boost: ScheduledBoost;
  }>> {
    return apiClient.request('/boosts/schedule', {
      method: 'POST',
      body: JSON.stringify({
        boost_type: boostType,
        scheduled_time: scheduledTime,
      }),
    });
  },

  async cancelScheduledBoost(scheduledBoostId: string): Promise<APIResponse<{
    message: string;
  }>> {
    return apiClient.request(`/boosts/schedule/${scheduledBoostId}`, {
      method: 'DELETE',
    });
  },
};
```

### Profile Analytics API Client
```typescript
// services/profileAnalytics.ts
export interface ProfilePerformance {
  impressions: {
    total: number;
    change: string;
    breakdown: {
      discovery: number;
      search: number;
    };
  };
  profile_views: {
    total: number;
    change: string;
    conversion_rate: string;
  };
  likes: {
    received: number;
    sent: number;
    conversion_rate: string;
  };
  super_likes: {
    received: number;
    sent: number;
  };
  matches: {
    total: number;
    from_likes: number;
    from_super_likes: number;
  };
  conversations: {
    started: number;
    response_rate: string;
  };
  profile_strength: {
    score: number;
    improvements: string[];
  };
}

export const profileAnalyticsAPI = {
  async getProfilePerformance(period: 'day' | 'week' | 'month' | 'all' = 'week'): Promise<APIResponse<ProfilePerformance>> {
    return apiClient.request(`/analytics/profile?period=${period}`);
  },

  async getProfileStrength(): Promise<APIResponse<{
    score: number;
    breakdown: {
      photos: number;
      bio: number;
      interests: number;
      details: number;
    };
    improvements: {
      type: string;
      message: string;
      impact: 'low' | 'medium' | 'high';
    }[];
  }>> {
    return apiClient.request('/analytics/profile-strength');
  },

  async getPhotoPerformance(): Promise<APIResponse<{
    photos: {
      url: string;
      impressions: number;
      likes_generated: number;
      effectiveness_score: number;
      is_primary: boolean;
    }[];
    recommendations: string[];
  }>> {
    return apiClient.request('/analytics/photo-performance');
  },
};
```

## State Management

### Advanced Search Store
```typescript
// stores/advancedSearchStore.ts
import { create } from 'zustand';

interface AdvancedSearchState {
  searchCriteria: SearchCriteria;
  searchResults: SearchResult[];
  searchHistory: SavedSearch[];
  savedSearches: SavedSearch[];
  currentSearchId: string | null;
  totalResults: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  cursor: string | null;
  error: string | null;
}

interface AdvancedSearchActions {
  setSearchCriteria: (criteria: Partial<SearchCriteria>) => void;
  performSearch: () => Promise<void>;
  loadMoreResults: () => Promise<void>;
  fetchSearchHistory: (savedOnly?: boolean) => Promise<void>;
  saveSearch: (name: string, notificationEnabled?: boolean) => Promise<void>;
  updateDiscoveryFilters: () => Promise<void>;
  resetSearch: () => void;
  setError: (error: string | null) => void;
}

export const useAdvancedSearchStore = create<AdvancedSearchState & AdvancedSearchActions>((set, get) => ({
  searchCriteria: {
    distance: { min: 0, max: 100 },
    age: { min: 18, max: 65 }
  },
  searchResults: [],
  searchHistory: [],
  savedSearches: [],
  currentSearchId: null,
  totalResults: 0,
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  cursor: null,
  error: null,

  setSearchCriteria: (criteria) => {
    set((state) => ({
      searchCriteria: {
        ...state.searchCriteria,
        ...criteria,
      },
    }));
  },

  performSearch: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await advancedSearchAPI.performSearch(get().searchCriteria);
      
      if (response.success && response.data) {
        set({
          searchResults: response.data.results,
          totalResults: response.data.total_count,
          currentSearchId: response.data.search_id,
          hasMore: response.data.meta.pagination.hasMore,
          cursor: response.data.meta.pagination.cursor,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Search failed', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  loadMoreResults: async () => {
    const { isLoadingMore, hasMore, cursor, searchResults } = get();
    
    if (isLoadingMore || !hasMore || !cursor) return;

    set({ isLoadingMore: true });
    
    try {
      const criteria = { ...get().searchCriteria, cursor };
      const response = await advancedSearchAPI.performSearch(criteria);
      
      if (response.success && response.data) {
        set({
          searchResults: [...searchResults, ...response.data.results],
          hasMore: response.data.meta.pagination.hasMore,
          cursor: response.data.meta.pagination.cursor,
          isLoadingMore: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load more results', isLoadingMore: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoadingMore: false });
    }
  },

  fetchSearchHistory: async (savedOnly = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await advancedSearchAPI.getSearchHistory(20, savedOnly);
      
      if (response.success && response.data) {
        if (savedOnly) {
          set({ savedSearches: response.data.searches, isLoading: false });
        } else {
          set({ searchHistory: response.data.searches, isLoading: false });
        }
      } else {
        set({ error: response.error?.message || 'Failed to load search history', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  saveSearch: async (name, notificationEnabled = false) => {
    const { currentSearchId } = get();
    if (!currentSearchId) {
      set({ error: 'No active search to save' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await advancedSearchAPI.saveSearch(
        currentSearchId, 
        name, 
        notificationEnabled, 
        'weekly'
      );
      
      if (response.success) {
        // Refresh saved searches
        get().fetchSearchHistory(true);
        set({ isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to save search', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  updateDiscoveryFilters: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await advancedSearchAPI.updateDiscoveryFilters(get().searchCriteria);
      
      if (response.success) {
        set({ isLoading: false });
        return response.data.estimated_matches;
      } else {
        set({ error: response.error?.message || 'Failed to update filters', isLoading: false });
        return 0;
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
      return 0;
    }
  },

  resetSearch: () => {
    set({
      searchResults: [],
      currentSearchId: null,
      totalResults: 0,
      hasMore: false,
      cursor: null,
      error: null,
    });
  },

  setError: (error) => set({ error }),
}));
```

### Recommendations Store
```typescript
// stores/recommendationsStore.ts
import { create } from 'zustand';

interface RecommendationsState {
  recommendations: Recommendation[];
  currentIndex: number;
  compatibilityDetails: CompatibilityDetails | null;
  refreshAvailableIn: number;
  isLoading: boolean;
  isLoadingCompatibility: boolean;
  error: string | null;
}

interface RecommendationsActions {
  fetchRecommendations: (refresh?: boolean) => Promise<void>;
  fetchCompatibility: (userId: string) => Promise<void>;
  nextRecommendation: () => void;
  provideFeedback: (recommendationId: string, feedback: 'relevant' | 'not_relevant', reason?: string) => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useRecommendationsStore = create<RecommendationsState & RecommendationsActions>((set, get) => ({
  recommendations: [],
  currentIndex: 0,
  compatibilityDetails: null,
  refreshAvailableIn: 0,
  isLoading: false,
  isLoadingCompatibility: false,
  error: null,

  fetchRecommendations: async (refresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await recommendationsAPI.getRecommendations(10, refresh);
      
      if (response.success && response.data) {
        set({
          recommendations: response.data.recommendations,
          refreshAvailableIn: response.data.refresh_available_in,
          currentIndex: 0,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load recommendations', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  fetchCompatibility: async (userId) => {
    set({ isLoadingCompatibility: true, error: null });
    try {
      const response = await recommendationsAPI.getCompatibility(userId);
      
      if (response.success && response.data) {
        set({
          compatibilityDetails: response.data,
          isLoadingCompatibility: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load compatibility', isLoadingCompatibility: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoadingCompatibility: false });
    }
  },

  nextRecommendation: () => {
    const { currentIndex, recommendations } = get();
    if (currentIndex < recommendations.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  provideFeedback: async (recommendationId, feedback, reason) => {
    try {
      await recommendationsAPI.provideFeedback(recommendationId, feedback, reason);
      // No state update needed, just sending feedback
    } catch (error) {
      console.error('Failed to provide feedback:', error);
    }
  },

  setError: (error) => set({ error }),
  
  reset: () => set({
    recommendations: [],
    currentIndex: 0,
    compatibilityDetails: null,
    refreshAvailableIn: 0,
    isLoading: false,
    isLoadingCompatibility: false,
    error: null,
  }),
}));
```

### Enhanced Boost Store
```typescript
// stores/enhancedBoostStore.ts
import { create } from 'zustand';

interface EnhancedBoostState {
  boostAnalytics: BoostAnalytics | null;
  boostRecommendation: BoostRecommendation | null;
  scheduledBoosts: ScheduledBoost[];
  isLoading: boolean;
  isScheduling: boolean;
  error: string | null;
}

interface EnhancedBoostActions {
  fetchBoostAnalytics: (boostId: string) => Promise<void>;
  fetchBoostRecommendation: (boostType: string) => Promise<void>;
  scheduleBoost: (boostType: string, scheduledTime: string) => Promise<void>;
  cancelScheduledBoost: (scheduledBoostId: string) => Promise<void>;
  fetchScheduledBoosts: () => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useEnhancedBoostStore = create<EnhancedBoostState & EnhancedBoostActions>((set, get) => ({
  boostAnalytics: null,
  boostRecommendation: null,
  scheduledBoosts: [],
  isLoading: false,
  isScheduling: false,
  error: null,

  fetchBoostAnalytics: async (boostId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await enhancedBoostAPI.getBoostAnalytics(boostId);
      
      if (response.success && response.data) {
        set({
          boostAnalytics: response.data,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load boost analytics', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  fetchBoostRecommendation: async (boostType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await enhancedBoostAPI.getBoostRecommendation(boostType);
      
      if (response.success && response.data) {
        set({
          boostRecommendation: response.data,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load boost recommendation', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  scheduleBoost: async (boostType, scheduledTime) => {
    set({ isScheduling: true, error: null });
    try {
      const response = await enhancedBoostAPI.scheduleBoost(boostType, scheduledTime);
      
      if (response.success && response.data) {
        // Refresh scheduled boosts
        await get().fetchScheduledBoosts();
        set({ isScheduling: false });
      } else {
        set({ error: response.error?.message || 'Failed to schedule boost', isScheduling: false });
      }
    } catch (error) {
      set({ error: 'Network error', isScheduling: false });
    }
  },

  cancelScheduledBoost: async (scheduledBoostId) => {
    try {
      const response = await enhancedBoostAPI.cancelScheduledBoost(scheduledBoostId);
      
      if (response.success) {
        // Refresh scheduled boosts
        await get().fetchScheduledBoosts();
      } else {
        set({ error: response.error?.message || 'Failed to cancel scheduled boost' });
      }
    } catch (error) {
      set({ error: 'Network error' });
    }
  },

  fetchScheduledBoosts: async () => {
    // This endpoint would need to be added to the API
    set({ isLoading: true, error: null });
    try {
      // Placeholder for the actual API call
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  setError: (error) => set({ error }),
  
  reset: () => set({
    boostAnalytics: null,
    boostRecommendation: null,
    scheduledBoosts: [],
    isLoading: false,
    isScheduling: false,
    error: null,
  }),
}));
```

### Profile Analytics Store
```typescript
// stores/profileAnalyticsStore.ts
import { create } from 'zustand';

interface ProfileAnalyticsState {
  profilePerformance: ProfilePerformance | null;
  profileStrength: {
    score: number;
    breakdown: {
      photos: number;
      bio: number;
      interests: number;
      details: number;
    };
    improvements: {
      type: string;
      message: string;
      impact: 'low' | 'medium' | 'high';
    }[];
  } | null;
  photoPerformance: {
    photos: {
      url: string;
      impressions: number;
      likes_generated: number;
      effectiveness_score: number;
      is_primary: boolean;
    }[];
    recommendations: string[];
  } | null;
  selectedPeriod: 'day' | 'week' | 'month' | 'all';
  isLoading: boolean;
  error: string | null;
}

interface ProfileAnalyticsActions {
  fetchProfilePerformance: () => Promise<void>;
  fetchProfileStrength: () => Promise<void>;
  fetchPhotoPerformance: () => Promise<void>;
  setSelectedPeriod: (period: 'day' | 'week' | 'month' | 'all') => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProfileAnalyticsStore = create<ProfileAnalyticsState & ProfileAnalyticsActions>((set, get) => ({
  profilePerformance: null,
  profileStrength: null,
  photoPerformance: null,
  selectedPeriod: 'week',
  isLoading: false,
  error: null,

  fetchProfilePerformance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileAnalyticsAPI.getProfilePerformance(get().selectedPeriod);
      
      if (response.success && response.data) {
        set({
          profilePerformance: response.data,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load profile performance', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  fetchProfileStrength: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileAnalyticsAPI.getProfileStrength();
      
      if (response.success && response.data) {
        set({
          profileStrength: response.data,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load profile strength', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  fetchPhotoPerformance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileAnalyticsAPI.getPhotoPerformance();
      
      if (response.success && response.data) {
        set({
          photoPerformance: response.data,
          isLoading: false,
        });
      } else {
        set({ error: response.error?.message || 'Failed to load photo performance', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error', isLoading: false });
    }
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
    get().fetchProfilePerformance();
  },

  setError: (error) => set({ error }),
  
  reset: () => set({
    profilePerformance: null,
    profileStrength: null,
    photoPerformance: null,
    selectedPeriod: 'week',
    isLoading: false,
    error: null,
  }),
}));
```

## Screen Components

### Advanced Search Screen
```typescript
// app/search/advanced.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Search, Sliders, Save } from 'lucide-react-native';
import { useAdvancedSearchStore } from '@/stores/advancedSearchStore';
import { RangeSlider } from '@/components/search/RangeSlider';
import { MultiSelect } from '@/components/search/MultiSelect';
import { SingleSelect } from '@/components/search/SingleSelect';
import { InterestSelector } from '@/components/search/InterestSelector';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SaveSearchModal } from '@/components/search/SaveSearchModal';

export default function AdvancedSearchScreen() {
  const {
    searchCriteria,
    setSearchCriteria,
    performSearch,
    isLoading,
    error,
  } = useAdvancedSearchStore();

  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleSearch = async () => {
    await performSearch();
    router.push('/search/results');
  };

  const handleSaveSearch = () => {
    setShowSaveModal(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Sliders size={32} color="#E91E63" />
        <Text style={styles.title}>Advanced Search</Text>
        <Text style={styles.subtitle}>
          Find your perfect match with precise criteria
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distance</Text>
        <RangeSlider
          min={0}
          max={100}
          step={5}
          values={[searchCriteria.distance?.min || 0, searchCriteria.distance?.max || 100]}
          onValuesChange={(values) => setSearchCriteria({ distance: { min: values[0], max: values[1] } })}
          unit="km"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Age</Text>
        <RangeSlider
          min={18}
          max={65}
          step={1}
          values={[searchCriteria.age?.min || 18, searchCriteria.age?.max || 65]}
          onValuesChange={(values) => setSearchCriteria({ age: { min: values[0], max: values[1] } })}
          unit="years"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Height</Text>
        <RangeSlider
          min={150}
          max={210}
          step={1}
          values={[searchCriteria.height?.min || 150, searchCriteria.height?.max || 210]}
          onValuesChange={(values) => setSearchCriteria({ height: { min: values[0], max: values[1] } })}
          unit="cm"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <MultiSelect
          options={[
            { label: 'High School', value: 'high_school' },
            { label: 'Bachelor', value: 'bachelor' },
            { label: 'Master', value: 'master' },
            { label: 'PhD', value: 'phd' },
          ]}
          selectedValues={searchCriteria.education_levels || []}
          onSelectionChange={(values) => setSearchCriteria({ education_levels: values })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Religion</Text>
        <MultiSelect
          options={[
            { label: 'Christian', value: 'christian' },
            { label: 'Muslim', value: 'muslim' },
            { label: 'Jewish', value: 'jewish' },
            { label: 'Hindu', value: 'hindu' },
            { label: 'Buddhist', value: 'buddhist' },
            { label: 'Spiritual', value: 'spiritual' },
            { label: 'Agnostic', value: 'agnostic' },
            { label: 'Atheist', value: 'atheist' },
          ]}
          selectedValues={searchCriteria.religions || []}
          onSelectionChange={(values) => setSearchCriteria({ religions: values })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Relationship Type</Text>
        <MultiSelect
          options={[
            { label: 'Serious', value: 'serious' },
            { label: 'Casual', value: 'casual' },
            { label: 'Friendship', value: 'friendship' },
            { label: 'Not Sure Yet', value: 'not_sure' },
          ]}
          selectedValues={searchCriteria.relationship_types || []}
          onSelectionChange={(values) => setSearchCriteria({ relationship_types: values })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Has Children</Text>
        <SingleSelect
          options={[
            { label: 'No preference', value: '' },
            { label: 'No children', value: 'no_children' },
            { label: 'Has children', value: 'has_children' },
          ]}
          selectedValue={searchCriteria.has_children || ''}
          onSelectionChange={(value) => setSearchCriteria({ has_children: value })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wants Children</Text>
        <SingleSelect
          options={[
            { label: 'No preference', value: '' },
            { label: 'Wants children', value: 'wants_children' },
            { label: 'Wants someday', value: 'wants_someday' },
            { label: 'Doesn\'t want', value: 'doesnt_want' },
          ]}
          selectedValue={searchCriteria.wants_children || ''}
          onSelectionChange={(value) => setSearchCriteria({ wants_children: value })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Drinking Habits</Text>
        <MultiSelect
          options={[
            { label: 'Never', value: 'never' },
            { label: 'Rarely', value: 'rarely' },
            { label: 'Socially', value: 'socially' },
            { label: 'Regularly', value: 'regularly' },
          ]}
          selectedValues={searchCriteria.drinking_habits || []}
          onSelectionChange={(values) => setSearchCriteria({ drinking_habits: values })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Smoking Habits</Text>
        <MultiSelect
          options={[
            { label: 'Never', value: 'never' },
            { label: 'Socially', value: 'socially' },
            { label: 'Regularly', value: 'regularly' },
          ]}
          selectedValues={searchCriteria.smoking_habits || []}
          onSelectionChange={(values) => setSearchCriteria({ smoking_habits: values })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise Frequency</Text>
        <MultiSelect
          options={[
            { label: 'Never', value: 'never' },
            { label: 'Sometimes', value: 'sometimes' },
            { label: 'Regularly', value: 'regularly' },
            { label: 'Daily', value: 'daily' },
          ]}
          selectedValues={searchCriteria.exercise_frequency || []}
          onSelectionChange={(values) => setSearchCriteria({ exercise_frequency: values })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <InterestSelector
          selectedInterests={searchCriteria.interests || []}
          onSelectionChange={(interests) => setSearchCriteria({ interests })}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSearch}
        >
          <Save size={20} color="#E91E63" />
          <Text style={styles.saveButtonText}>Save Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Search size={20} color="#fff" />
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <SaveSearchModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
    gap: 15,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E91E63',
    gap: 10,
  },
  saveButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: '#E91E63',
    gap: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Daily Picks Screen
```typescript
// app/recommendations/daily-picks.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Heart, Star, RefreshCw } from 'lucide-react-native';
import { useRecommendationsStore } from '@/stores/recommendationsStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { CompatibilityScore } from '@/components/recommendations/CompatibilityScore';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DailyPicksScreen() {
  const {
    recommendations,
    currentIndex,
    refreshAvailableIn,
    isLoading,
    error,
    fetchRecommendations,
    nextRecommendation,
  } = useRecommendationsStore();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const formatRefreshTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleRefresh = async () => {
    if (refreshAvailableIn === 0) {
      await fetchRecommendations(true);
    }
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  if (isLoading && recommendations.length === 0) {
    return <LoadingScreen />;
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={64} color="#E91E63" />}
        title="No Recommendations Yet"
        subtitle="We're still learning your preferences. Check back soon for personalized recommendations!"
      />
    );
  }

  const currentRecommendation = recommendations[currentIndex];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Picks</Text>
        <Text style={styles.subtitle}>
          Personalized recommendations based on your preferences
        </Text>
        
        <View style={styles.refreshContainer}>
          <Text style={styles.refreshText}>
            {refreshAvailableIn > 0 
              ? `New recommendations in ${formatRefreshTime(refreshAvailableIn)}` 
              : 'Refresh available now'}
          </Text>
          <TouchableOpacity 
            style={[styles.refreshButton, refreshAvailableIn > 0 && styles.refreshButtonDisabled]} 
            onPress={handleRefresh}
            disabled={refreshAvailableIn > 0}
          >
            <RefreshCw size={16} color={refreshAvailableIn > 0 ? '#999' : '#E91E63'} />
          </TouchableOpacity>
        </View>
      </View>

      <RecommendationCard
        recommendation={currentRecommendation}
        onViewProfile={() => handleViewProfile(currentRecommendation.id)}
        onNext={nextRecommendation}
      />

      <View style={styles.compatibilitySection}>
        <Text style={styles.compatibilityTitle}>Why We Think You'll Match</Text>
        <CompatibilityScore score={currentRecommendation.compatibility_score} />
        <Text style={styles.compatibilityReason}>
          {currentRecommendation.recommendation_reason}
        </Text>
        
        <TouchableOpacity 
          style={styles.compatibilityButton}
          onPress={() => router.push(`/recommendations/compatibility/${currentRecommendation.id}`)}
        >
          <Text style={styles.compatibilityButtonText}>View Detailed Compatibility</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={nextRecommendation}
          disabled={currentIndex >= recommendations.length - 1}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => {
            // Handle like action
            router.push(`/profile/${currentRecommendation.id}`);
          }}
        >
          <Heart size={20} color="#fff" />
          <Text style={styles.likeButtonText}>Like</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.superLikeButton}
          onPress={() => {
            router.push(`/super-like/${currentRecommendation.id}`);
          }}
        >
          <Star size={20} color="#fff" />
          <Text style={styles.superLikeButtonText}>Super Like</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  refreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshText: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  compatibilitySection: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    margin: 20,
    alignItems: 'center',
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  compatibilityReason: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 15,
    marginBottom: 20,
  },
  compatibilityButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  compatibilityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#E91E63',
  },
  likeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  superLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#2196F3',
  },
  superLikeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
```

### Boost Analytics Screen
```typescript
// app/boosts/analytics/[boostId].tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Zap, Eye, Heart, Star, Users, MessageCircle } from 'lucide-react-native';
import { useEnhancedBoostStore } from '@/stores/enhancedBoostStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AnalyticCard } from '@/components/analytics/AnalyticCard';
import { BoostROICard } from '@/components/boosts/BoostROICard';

const screenWidth = Dimensions.get('window').width;

export default function BoostAnalyticsScreen() {
  const { boostId } = useLocalSearchParams<{ boostId: string }>();
  const { boostAnalytics, fetchBoostAnalytics, isLoading, error } = useEnhancedBoostStore();

  useEffect(() => {
    if (boostId) {
      fetchBoostAnalytics(boostId);
    }
  }, [boostId]);

  if (isLoading || !boostAnalytics) {
    return <LoadingScreen />;
  }

  const { boost, analytics } = boostAnalytics;
  
  // Format data for charts
  const hourlyData = {
    labels: analytics.hourly_breakdown.map(h => h.hour),
    datasets: [
      {
        data: analytics.hourly_breakdown.map(h => h.impressions),
        color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Zap size={32} color="#E91E63" />
        <Text style={styles.title}>Boost Analytics</Text>
        <Text style={styles.subtitle}>
          {boost.boost_type === 'discovery_boost' ? 'Discovery Boost' : 'Super Boost'} • {boost.duration_minutes} minutes
        </Text>
        <Text style={styles.dateText}>
          {new Date(boost.started_at).toLocaleDateString()} • {new Date(boost.started_at).toLocaleTimeString()} - {new Date(boost.ended_at).toLocaleTimeString()}
        </Text>
      </View>

      <BoostROICard roi={analytics.roi_score} />

      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <AnalyticCard
            icon={<Eye size={24} color="#E91E63" />}
            title="Impressions"
            value={analytics.total_impressions.toString()}
            change={analytics.comparison_to_normal.impressions_increase}
          />
          <AnalyticCard
            icon={<Users size={24} color="#E91E63" />}
            title="Profile Views"
            value={analytics.profile_views.toString()}
          />
        </View>
        
        <View style={styles.metricRow}>
          <AnalyticCard
            icon={<Heart size={24} color="#E91E63" />}
            title="Likes"
            value={analytics.likes_received.toString()}
            change={analytics.comparison_to_normal.likes_increase}
          />
          <AnalyticCard
            icon={<Star size={24} color="#E91E63" />}
            title="Super Likes"
            value={analytics.super_likes_received.toString()}
          />
        </View>
        
        <View style={styles.metricRow}>
          <AnalyticCard
            icon={<Users size={24} color="#E91E63" />}
            title="Matches"
            value={analytics.matches_created.toString()}
            change={analytics.comparison_to_normal.matches_increase}
          />
          <AnalyticCard
            icon={<MessageCircle size={24} color="#E91E63" />}
            title="Conversations"
            value={analytics.conversations_started.toString()}
          />
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Hourly Performance</Text>
        <LineChart
          data={hourlyData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#E91E63',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonTitle}>Boost Performance vs. Normal</Text>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Impressions</Text>
          <Text style={styles.comparisonValue}>{analytics.comparison_to_normal.impressions_increase}</Text>
        </View>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Likes</Text>
          <Text style={styles.comparisonValue}>{analytics.comparison_to_normal.likes_increase}</Text>
        </View>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Matches</Text>
          <Text style={styles.comparisonValue}>{analytics.comparison_to_normal.matches_increase}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  metricsContainer: {
    padding: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  chartContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    margin: 20,
    marginTop: 0,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  comparisonContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    margin: 20,
    marginTop: 0,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  comparisonLabel: {
    fontSize: 16,
    color: '#666',
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
  },
});
```

## UI Components

### Range Slider Component
```typescript
// components/search/RangeSlider.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  values: number[];
  onValuesChange: (values: number[]) => void;
  unit?: string;
}

export function RangeSlider({ min, max, step, values, onValuesChange, unit }: RangeSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{values[0]}{unit && ` ${unit}`}</Text>
        <Text style={styles.valueText}>{values[1]}{unit && ` ${unit}`}</Text>
      </View>
      <MultiSlider
        values={values}
        min={min}
        max={max}
        step={step}
        sliderLength={280}
        onValuesChange={onValuesChange}
        selectedStyle={styles.selectedTrack}
        unselectedStyle={styles.unselectedTrack}
        markerStyle={styles.marker}
        containerStyle={styles.sliderContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  valueText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  sliderContainer: {
    height: 40,
  },
  selectedTrack: {
    backgroundColor: '#E91E63',
    height: 4,
  },
  unselectedTrack: {
    backgroundColor: '#ddd',
    height: 4,
  },
  marker: {
    backgroundColor: '#E91E63',
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});
```

### Compatibility Score Component
```typescript
// components/recommendations/CompatibilityScore.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CompatibilityScoreProps {
  score: number;
  size?: number;
}

export function CompatibilityScore({ score, size = 100 }: CompatibilityScoreProps) {
  // Calculate circle properties
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#8BC34A'; // Light Green
    if (score >= 50) return '#FFC107'; // Amber
    if (score >= 30) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  const color = getColor();

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color }]}>{score}%</Text>
        <Text style={styles.labelText}>Match</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 12,
    color: '#666',
  },
});
```

### Boost ROI Card Component
```typescript
// components/boosts/BoostROICard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

interface BoostROICardProps {
  roi: number;
}

export function BoostROICard({ roi }: BoostROICardProps) {
  // Determine ROI rating
  const getRating = () => {
    if (roi >= 9) return 'Excellent';
    if (roi >= 7) return 'Very Good';
    if (roi >= 5) return 'Good';
    if (roi >= 3) return 'Fair';
    return 'Poor';
  };
  
  // Determine color based on ROI
  const getColor = () => {
    if (roi >= 9) return '#4CAF50'; // Green
    if (roi >= 7) return '#8BC34A'; // Light Green
    if (roi >= 5) return '#FFC107'; // Amber
    if (roi >= 3) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  const rating = getRating();
  const color = getColor();

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={styles.header}>
        <TrendingUp size={24} color={color} />
        <Text style={styles.title}>Boost ROI</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.roiScore, { color }]}>{roi.toFixed(1)}</Text>
        <Text style={styles.roiRating}>{rating}</Text>
      </View>
      
      <Text style={styles.description}>
        This score represents the return on investment for your boost, based on impressions, likes, and matches generated.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    alignItems: 'center',
    marginBottom: 15,
  },
  roiScore: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roiRating: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

## File Structure
```
app/
├── (tabs)/
│   ├── index.tsx # Discovery with advanced filters (UPDATED)
│   ├── analytics.tsx # Profile analytics dashboard (NEW)
│   └── _layout.tsx # Tab navigation (UPDATED)
├── search/
│   ├── advanced.tsx # Advanced search interface (NEW)
│   ├── results.tsx # Search results display (NEW)
│   ├── history.tsx # Search history management (NEW)
│   └── saved.tsx # Saved searches management (NEW)
├── recommendations/
│   ├── daily-picks.tsx # Algorithm recommendations (NEW)
│   ├── compatibility/
│   │   └── [userId].tsx # Detailed compatibility (NEW)
│   └── settings.tsx # Recommendation preferences (NEW)
├── boosts/
│   ├── analytics/
│   │   └── [boostId].tsx # Detailed boost analytics (NEW)
│   ├── schedule.tsx # Boost scheduling interface (NEW)
│   └── recommendation.tsx # Optimal boost timing (NEW)
└── analytics/
    ├── profile.tsx # Profile performance metrics (NEW)
    ├── photos.tsx # Photo performance analysis (NEW)
    └── engagement.tsx # User engagement metrics (NEW)

components/
├── search/
│   ├── RangeSlider.tsx # Range selection slider (NEW)
│   ├── MultiSelect.tsx # Multiple option selector (NEW)
│   ├── SingleSelect.tsx # Single option selector (NEW)
│   ├── InterestSelector.tsx # Interest tag selector (NEW)
│   ├── SaveSearchModal.tsx # Save search interface (NEW)
│   ├── SearchHistoryItem.tsx # History list item (NEW)
│   └── SearchResultCard.tsx # Search result display (NEW)
├── recommendations/
│   ├── RecommendationCard.tsx # Recommendation display (NEW)
│   ├── SavedSearchItem.tsx # Saved search list item (NEW)
│   ├── CompatibilityFactor.tsx # Factor breakdown (NEW)
│   ├── ConversationStarter.tsx # Suggested openers (NEW)
│   └── RecommendationFeedback.tsx # Feedback interface (NEW)
├── boosts/
│   ├── MetricCard.tsx # Analytics metric display component (NEW)
│   ├── ConversionFunnel.tsx # Visual conversion funnel visualization (NEW)
│   ├── PerformanceChart.tsx # Line/bar chart for metrics visualization (NEW)
│   ├── BoostROICard.tsx # Boost ROI visualization component (NEW)
│   ├── ActivityHeatmap.tsx # Activity pattern heatmap visualization (NEW)
│   └── ImprovementSuggestion.tsx # Profile improvement suggestion card (NEW)
│   ├── AnalyticCard.tsx # Metric display card (NEW)
│   ├── BoostScheduler.tsx # UI for scheduling boosts at optimal times (NEW)
│   │   ├── [boostId].tsx # Individual boost analytics (NEW)
│   │   └── schedule.tsx # Boost scheduler with optimal time recommendations (NEW)
│   └── PerformanceComparison.tsx # Component for comparing performance metrics (NEW)
└── ui/
    ├── EmptyState.tsx # Empty state display (UPDATED)
    ├── FilterChip.tsx # Filter selection chip (NEW)
    └── PercentageBadge.tsx # Percentage display (NEW)

services/
├── advancedSearch.ts # Advanced search API client (NEW)
├── recommendations.ts # Recommendation API client (NEW)
├── enhancedBoost.ts # Enhanced boost API client (NEW)
├── profileAnalytics.ts # Analytics API client (NEW)
└── api.ts # Base API client (UPDATED)

stores/
├── advancedSearchStore.ts # Search state management (NEW)
├── recommendationsStore.ts # Recommendations state (NEW)
├── enhancedBoostStore.ts # Boost analytics state (NEW)
├── profileAnalyticsStore.ts # Profile metrics state (NEW)
├── discoveryStore.ts # Discovery with advanced filters (UPDATED)
└── authStore.ts # Auth with analytics permissions (UPDATED)

types/
├── search.ts # Search criteria and results types (NEW)
├── recommendations.ts # Recommendation data types (NEW)
├── compatibility.ts # Compatibility score types (NEW)
├── analytics.ts # Analytics data types (NEW)
├── boost.ts # Enhanced boost types (NEW)
└── api.ts # API response types (UPDATED)

hooks/
├── useAdvancedSearch.ts # Search functionality hooks (NEW)
├── useRecommendations.ts # Recommendation hooks (NEW)
├── useCompatibility.ts # Compatibility calculation hooks (NEW)
├── useAnalytics.ts # Analytics data hooks (NEW)
├── useBoostOptimization.ts # Boost timing hooks (NEW)
└── useChartData.ts # Data visualization hooks (NEW)

utils/
├── searchHelpers.ts # Search utility functions (NEW)
├── recommendationHelpers.ts # Recommendation utilities (NEW)
├── compatibilityHelpers.ts # Compatibility utilities (NEW)
│   ├── Chart.tsx # Base component for rendering various data charts (NEW)
├── chartHelpers.ts # Chart formatting utilities (NEW)
└── dateHelpers.ts # Date formatting utilities (NEW)
```

## Testing Requirements

### Unit Tests
- Test search algorithm and filtering logic
- Test recommendation engine scoring
- Test compatibility calculation algorithms
- Test boost analytics calculations
- Test chart data formatting utilities

### Integration Tests
- Test complete search flow with results
- Test recommendation generation and display
- Test boost analytics data retrieval
- Test profile analytics data integration
- Test saved search functionality

### UI Tests
- Test advanced search interface
- Test recommendation cards and compatibility display
- Test boost analytics visualization
- Test profile analytics dashboard
- Test filter selection and management

### Performance Tests
- Test search performance with large user base
- Test recommendation generation speed
- Test analytics data loading and display
- Test chart rendering performance
- Test filter application speed

## Accessibility Features
- Screen reader support for all search and filter controls
- Keyboard navigation for search interface
- High contrast mode for analytics charts
- Voice control for search criteria
- Haptic feedback for search actions

## Security Considerations
- Search query validation and sanitization
- User data privacy in search results
- Analytics data anonymization
- Recommendation algorithm fairness
- Search history privacy protection

## Performance Optimizations
- Search query optimization for large user base
- Chart rendering optimization
- Analytics data caching
- Lazy loading for search results
- Efficient filter application

Phase 6 frontend implementation focuses on creating advanced features that provide a competitive edge in the dating app market, with sophisticated search capabilities, intelligent recommendations, and comprehensive analytics.