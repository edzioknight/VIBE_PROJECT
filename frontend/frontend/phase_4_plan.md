# Frontend Phase 4 Plan: Premium Features, Super Likes, and Subscriptions

## Phase 4 Objectives
Build the complete monetization interface for VibesMatch, including premium subscription management, super like functionality, profile boosts, and enhanced features for paying users. This phase introduces the revenue-generating user interfaces that drive app profitability.

## Screen Structure

### Premium Subscription Flow
- **Premium Paywall**: Feature-gated premium upgrade prompts
- **Subscription Plans**: Monthly/yearly plan selection with pricing
- **Payment Screen**: Secure payment processing interface
- **Subscription Management**: Cancel, upgrade, billing history

### Super Likes System
- **Super Like Button**: Enhanced like button in discovery
- **Super Like Compose**: Message composition for super likes
- **Super Likes Received**: Inbox for received super likes
- **Super Like Purchase**: Package selection and purchase flow

### Profile Boost System
- **Boost Activation**: Boost type selection and activation
- **Boost Status**: Active boost monitoring and analytics
- **Boost Purchase**: Boost package purchase interface

### Premium Features
- **Who Liked Me**: Grid view of users who liked your profile
- **Advanced Filters**: Enhanced discovery filtering options
- **Read Receipts**: Message read status indicators
- **Rewind**: Undo last swipe action functionality

## API Integration

### Premium API Client
```typescript
// services/premium.ts
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  discount_percentage?: number;
  features: string[];
  trial_days: number;
}

export interface SubscriptionStatus {
  is_premium: boolean;
  subscription?: {
    id: string;
    plan_type: string;
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    trial_end?: string;
  };
  features: {
    unlimited_likes: boolean;
    see_who_liked_you: boolean;
    read_receipts: boolean;
    advanced_filters: boolean;
    rewind_last_swipe: boolean;
    super_likes_remaining: number;
    boosts_remaining: number;
    priority_support: boolean;
  };
  usage: {
    super_likes_used_this_month: number;
    boosts_used_this_month: number;
    likes_today: number;
  };
}

export interface SuperLike {
  id: string;
  sender: {
    id: string;
    name: string;
    age: number;
    profile_photos: string[];
    bio?: string;
    interests: string[];
  };
  message?: string;
  status: 'pending' | 'matched' | 'expired' | 'declined';
  created_at: string;
  expires_at: string;
}

export interface BoostStatus {
  active_boost?: {
    id: string;
    boost_type: 'discovery_boost' | 'super_boost';
    expires_at: string;
    time_remaining_minutes: number;
    views_gained: number;
    likes_gained: number;
  };
  available_boosts: {
    discovery_boost: number;
    super_boost: number;
  };
}

export const premiumAPI = {
  async getPlans(): Promise<APIResponse<{ plans: SubscriptionPlan[] }>> {
    return apiClient.request('/premium/plans');
  },

  async subscribe(planId: string, paymentMethodId: string, provider: string = 'stripe'): Promise<APIResponse<{
    subscription_id: string;
    client_secret?: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    trial_end?: string;
  }>> {
    return apiClient.request('/premium/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        payment_method_id: paymentMethodId,
        provider,
      }),
    });
  },

  async cancelSubscription(cancelAtPeriodEnd: boolean = true, reason?: string): Promise<APIResponse<{
    message: string;
    cancellation_date: string;
    access_until: string;
  }>> {
    return apiClient.request('/premium/cancel', {
      method: 'POST',
      body: JSON.stringify({
        cancel_at_period_end: cancelAtPeriodEnd,
        reason,
      }),
    });
  },

  async getStatus(): Promise<APIResponse<SubscriptionStatus>> {
    return apiClient.request('/premium/status');
  },

  async getWhoLikedMe(limit: number = 20, cursor?: string): Promise<APIResponse<{
    profiles: any[];
    total_count: number;
    super_likes_count: number;
    meta: {
      pagination: {
        cursor: string;
        hasMore: boolean;
      };
    };
  }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });
    
    return apiClient.request(`/premium/who-liked-me?${params}`);
  },

  async rewindLastAction(): Promise<APIResponse<{
    message: string;
    restored_profile: {
      id: string;
      name: string;
      profile_photos: string[];
    };
    rewinds_remaining_today: number;
  }>> {
    return apiClient.request('/discovery/rewind', {
      method: 'POST',
    });
  },
};

export const superLikesAPI = {
  async sendSuperLike(targetId: string, message?: string): Promise<APIResponse<{
    super_like_id: string;
    message: string;
    target_user: {
      id: string;
      name: string;
      profile_photos: string[];
    };
    expires_at: string;
  }>> {
    return apiClient.request('/super-likes/send', {
      method: 'POST',
      body: JSON.stringify({
        target_id: targetId,
        message,
      }),
    });
  },

  async getReceived(status: string = 'pending', limit: number = 20): Promise<APIResponse<{
    super_likes: SuperLike[];
  }>> {
    const params = new URLSearchParams({
      status,
      limit: limit.toString(),
    });
    
    return apiClient.request(`/super-likes/received?${params}`);
  },

  async respond(superLikeId: string, action: 'like' | 'pass'): Promise<APIResponse<{
    message: string;
    match_created?: boolean;
    match_id?: string;
    conversation_id?: string;
  }>> {
    return apiClient.request(`/super-likes/${superLikeId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  async purchase(packageType: string, paymentMethodId: string, provider: string = 'stripe'): Promise<APIResponse<{
    purchase_id: string;
    package_type: string;
    quantity: number;
    amount_paid_cents: number;
    super_likes_balance: number;
    transaction_id: string;
  }>> {
    return apiClient.request('/super-likes/purchase', {
      method: 'POST',
      body: JSON.stringify({
        package_type: packageType,
        payment_method_id: paymentMethodId,
        provider,
      }),
    });
  },
};

export const boostAPI = {
  async activate(boostType: 'discovery_boost' | 'super_boost'): Promise<APIResponse<{
    boost_id: string;
    boost_type: string;
    duration_minutes: number;
    started_at: string;
    expires_at: string;
    estimated_extra_views: string;
  }>> {
    return apiClient.request('/boosts/activate', {
      method: 'POST',
      body: JSON.stringify({ boost_type: boostType }),
    });
  },

  async getStatus(): Promise<APIResponse<BoostStatus>> {
    return apiClient.request('/boosts/status');
  },
};
// components/modals/SuperLikeModal.tsx - Modal for Super Like confirmation and success feedback
// components/ui/EmptyState.tsx - Reusable component for displaying empty states in lists/views
```

### Payment Integration
```typescript
// services/payments.ts
import { loadStripe } from '@stripe/stripe-js';
import { CardField, useStripe } from '@stripe/stripe-react-native';

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

class PaymentService {
  private stripe: any = null;
  
  // For web
  async initializeStripe() {
    if (!this.stripe) {
      this.stripe = await loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }
    return this.stripe;
  }

  // For React Native using @stripe/stripe-react-native
  async createPaymentMethod(cardDetails: any): Promise<PaymentMethod> {
    const { createPaymentMethod, error } = useStripe();
    const { paymentMethod } = await createPaymentMethod({
      type: 'Card',
      card: cardDetails,
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentMethod;
  }

  async confirmPayment(clientSecret: string, paymentMethodId: string): Promise<any> {
    const stripe = await this.initializeStripe();
    return stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });
  }

  async createSetupIntent(): Promise<string> {
    const response = await apiClient.request('/payments/setup-intent', {
      method: 'POST',
    });
    
    if (response.success && response.data) {
      return response.data.client_secret;
    }
    
    throw new Error('Failed to create setup intent');
  }
}

export const paymentService = new PaymentService();
```

## State Management

### Premium Store
```typescript
// stores/premiumStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PremiumState {
  subscriptionStatus: SubscriptionStatus | null;
  plans: SubscriptionPlan[];
  superLikesReceived: SuperLike[];
  whoLikedMe: any[];
  boostStatus: BoostStatus | null;
  isLoading: boolean;
  error: string | null;
}

interface PremiumActions {
  // Subscription
  fetchPlans: () => Promise<void>;
  fetchSubscriptionStatus: () => Promise<void>;
  subscribe: (planId: string, paymentMethodId: string) => Promise<void>;
  cancelSubscription: (reason?: string) => Promise<void>;
  
  // Super Likes
  sendSuperLike: (targetId: string, message?: string) => Promise<void>;
  fetchSuperLikesReceived: () => Promise<void>;
  respondToSuperLike: (superLikeId: string, action: 'like' | 'pass') => Promise<void>;
  purchaseSuperLikes: (packageType: string, paymentMethodId: string) => Promise<void>;
  
  // Who Liked Me
  fetchWhoLikedMe: (refresh?: boolean) => Promise<void>;
  
  // Boosts
  activateBoost: (boostType: 'discovery_boost' | 'super_boost') => Promise<void>;
  fetchBoostStatus: () => Promise<void>;
  
  // Rewind
  rewindLastAction: () => Promise<any>;
  
  // Utility
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePremiumStore = create<PremiumState & PremiumActions>()(
  persist(
    (set, get) => ({
      subscriptionStatus: null,
      plans: [],
      superLikesReceived: [],
      whoLikedMe: [],
      boostStatus: null,
      isLoading: false,
      error: null,

      fetchPlans: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await premiumAPI.getPlans();
          if (response.success && response.data) {
            set({ plans: response.data.plans, isLoading: false });
          } else {
            set({ error: response.error?.message || 'Failed to load plans', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      fetchSubscriptionStatus: async () => {
        try {
          const response = await premiumAPI.getStatus();
          if (response.success && response.data) {
            set({ subscriptionStatus: response.data });
          }
        } catch (error) {
          console.error('Failed to fetch subscription status:', error);
        }
      },

      subscribe: async (planId: string, paymentMethodId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await premiumAPI.subscribe(planId, paymentMethodId);
          if (response.success) {
            // Refresh subscription status
            await get().fetchSubscriptionStatus();
            set({ isLoading: false });
          } else {
            set({ error: response.error?.message || 'Subscription failed', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Payment failed', isLoading: false });
        }
      },

      cancelSubscription: async (reason?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await premiumAPI.cancelSubscription(true, reason);
          if (response.success) {
            await get().fetchSubscriptionStatus();
            set({ isLoading: false });
          } else {
            set({ error: response.error?.message || 'Cancellation failed', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      sendSuperLike: async (targetId: string, message?: string) => {
        try {
          const response = await superLikesAPI.sendSuperLike(targetId, message);
          if (response.success) {
            // Refresh subscription status to update super likes count
            await get().fetchSubscriptionStatus();
          } else {
            set({ error: response.error?.message || 'Failed to send Super Like' });
          }
        } catch (error) {
          set({ error: 'Network error' });
        }
      },

      fetchSuperLikesReceived: async () => {
        try {
          const response = await superLikesAPI.getReceived();
          if (response.success && response.data) {
            set({ superLikesReceived: response.data.super_likes });
          }
        } catch (error) {
          set({ error: 'Failed to load Super Likes' });
        }
      },

      respondToSuperLike: async (superLikeId: string, action: 'like' | 'pass') => {
        try {
          const response = await superLikesAPI.respond(superLikeId, action);
          if (response.success) {
            // Remove from received list
            set(state => ({
              superLikesReceived: state.superLikesReceived.filter(sl => sl.id !== superLikeId),
            }));
          } else {
            set({ error: response.error?.message || 'Failed to respond to Super Like' });
          }
        } catch (error) {
          set({ error: 'Network error' });
        }
      },

      purchaseSuperLikes: async (packageType: string, paymentMethodId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await superLikesAPI.purchase(packageType, paymentMethodId);
          if (response.success) {
            await get().fetchSubscriptionStatus();
            set({ isLoading: false });
          } else {
            set({ error: response.error?.message || 'Purchase failed', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Payment failed', isLoading: false });
        }
      },

      fetchWhoLikedMe: async (refresh = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await premiumAPI.getWhoLikedMe();
          if (response.success && response.data) {
            set({
              whoLikedMe: refresh ? response.data.profiles : [...get().whoLikedMe, ...response.data.profiles],
              isLoading: false,
            });
          } else {
            set({ error: response.error?.message || 'Failed to load who liked you', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      activateBoost: async (boostType: 'discovery_boost' | 'super_boost') => {
        set({ isLoading: true, error: null });
        try {
          const response = await boostAPI.activate(boostType);
          if (response.success) {
            await get().fetchBoostStatus();
            set({ isLoading: false });
          } else {
            set({ error: response.error?.message || 'Failed to activate boost', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      fetchBoostStatus: async () => {
        try {
          const response = await boostAPI.getStatus();
          if (response.success && response.data) {
            set({ boostStatus: response.data });
          }
        } catch (error) {
          console.error('Failed to fetch boost status:', error);
        }
      },

      rewindLastAction: async () => {
        try {
          const response = await premiumAPI.rewindLastAction();
          if (response.success && response.data) {
            return response.data;
          } else {
            set({ error: response.error?.message || 'Failed to rewind' });
            return null;
          }
        } catch (error) {
          set({ error: 'Network error' });
          return null;
        }
      },

      setError: (error: string | null) => set({ error }),
      
      reset: () => set({
        subscriptionStatus: null,
        plans: [],
        superLikesReceived: [],
        whoLikedMe: [],
        boostStatus: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'premium-store',
      partialize: (state) => ({
        subscriptionStatus: state.subscriptionStatus,
        plans: state.plans,
      }),
    }
  )
);
```

## Screen Components

### Premium Paywall Screen
```typescript
// app/premium/paywall.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Crown, Heart, Eye, MessageCircle, RotateCcw, Zap } from 'lucide-react-native';
import { usePremiumStore } from '@/stores/premiumStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function PremiumPaywallScreen() {
  const { feature } = useLocalSearchParams<{ feature?: string }>();
  const { plans, fetchPlans, isLoading } = usePremiumStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const getFeatureMessage = () => {
    switch (feature) {
      case 'unlimited_likes':
        return 'Get unlimited likes to find your perfect match!';
      case 'who_liked_you':
        return 'See who already likes you and match instantly!';
      case 'read_receipts':
        return 'Know when your messages are read!';
      case 'rewind':
        return 'Undo your last swipe and get a second chance!';
      case 'super_likes':
        return 'Stand out with Super Likes and get noticed!';
      default:
        return 'Unlock all premium features and find love faster!';
    }
  };

  const premiumFeatures = [
    {
      icon: <Heart size={24} color="#E91E63" />,
      title: 'Unlimited Likes',
      description: 'Like as many profiles as you want',
    },
    {
      icon: <Eye size={24} color="#E91E63" />,
      title: 'See Who Liked You',
      description: 'View everyone who already likes you',
    },
    {
      icon: <MessageCircle size={24} color="#E91E63" />,
      title: 'Read Receipts',
      description: 'Know when your messages are read',
    },
    {
      icon: <RotateCcw size={24} color="#E91E63" />,
      title: 'Rewind',
      description: 'Undo your last swipe action',
    },
    {
      icon: <Zap size={24} color="#E91E63" />,
      title: 'Monthly Boosts',
      description: 'Get 10x more profile views',
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Crown size={48} color="#FFD700" />
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>{getFeatureMessage()}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {premiumFeatures.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureIcon}>{feature.icon}</View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              plan.billing_period === 'yearly' && styles.popularPlan,
            ]}
            onPress={() => router.push({
              pathname: '/premium/subscribe',
              params: { planId: plan.id },
            })}
          >
            {plan.billing_period === 'yearly' && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              ${(plan.price_cents / 100).toFixed(2)}
              <Text style={styles.planPeriod}>/{plan.billing_period === 'monthly' ? 'month' : 'year'}</Text>
            </Text>
            {plan.discount_percentage && (
              <Text style={styles.discount}>Save {plan.discount_percentage}%</Text>
            )}
            <Text style={styles.trialText}>{plan.trial_days}-day free trial</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => router.back()}
      >
        <Text style={styles.continueButtonText}>Maybe Later</Text>
      </TouchableOpacity>
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
    fontSize: 28,
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
  featuresContainer: {
    padding: 20,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  plansContainer: {
    padding: 20,
    gap: 15,
  },
  planCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  popularPlan: {
    backgroundColor: '#fce4ec',
    borderColor: '#E91E63',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#E91E63',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  discount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 5,
  },
  trialText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  continueButton: {
    margin: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Super Like Compose Screen
```typescript
// app/super-like/[userId].tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Star } from 'lucide-react-native';
import { usePremiumStore } from '@/stores/premiumStore';
import { useDiscoveryStore } from '@/stores/discoveryStore';

export default function SuperLikeComposeScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [message, setMessage] = useState('');
  const { sendSuperLike, subscriptionStatus } = usePremiumStore();
  const { profiles } = useDiscoveryStore();

  const targetUser = profiles.find(p => p.id === userId);
  const characterLimit = 280;
  const remainingChars = characterLimit - message.length;
  const superLikesRemaining = subscriptionStatus?.features.super_likes_remaining || 0;

  const handleSendSuperLike = async () => {
    if (superLikesRemaining === 0) {
      Alert.alert(
        'No Super Likes',
        'You need Super Likes to send this. Purchase more or upgrade to Premium.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Super Likes', onPress: () => router.push('/super-likes/purchase') },
        ]
      );
      return;
    }

    try {
      await sendSuperLike(userId!, message.trim() || undefined);
      Alert.alert(
        'Super Like Sent! ⭐',
        `Your Super Like has been sent to ${targetUser?.name}. They'll see it first in their discovery feed!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send Super Like. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Star size={48} color="#2196F3" />
        <Text style={styles.title}>Send Super Like</Text>
        <Text style={styles.subtitle}>
          Stand out to {targetUser?.name} with a Super Like and optional message
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Super Likes remaining: {superLikesRemaining}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Add a message (optional)</Text>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Say something to get their attention..."
          multiline
          maxLength={characterLimit}
          textAlignVertical="top"
        />
        <Text style={[
          styles.characterCount,
          remainingChars < 20 && styles.characterCountWarning
        ]}>
          {remainingChars} characters remaining
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.sendButton, superLikesRemaining === 0 && styles.sendButtonDisabled]}
          onPress={handleSendSuperLike}
          disabled={superLikesRemaining === 0}
        >
          <Star size={20} color="#fff" />
          <Text style={styles.sendButtonText}>Send Super Like</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  statusContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  inputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  characterCountWarning: {
    color: '#E91E63',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Who Liked Me Screen
```typescript
// app/premium/who-liked-me.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Heart, Star } from 'lucide-react-native';
import { usePremiumStore } from '@/stores/premiumStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';

export default function WhoLikedMeScreen() {
  const { whoLikedMe, fetchWhoLikedMe, isLoading, subscriptionStatus } = usePremiumStore();

  useEffect(() => {
    if (subscriptionStatus?.is_premium) {
      fetchWhoLikedMe(true);
    }
  }, [subscriptionStatus]);

  const renderProfile = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      <Image source={{ uri: item.profile_photos[0] }} style={styles.profileImage} />
      {item.is_super_like && (
        <View style={styles.superLikeBadge}>
          <Star size={16} color="#fff" />
        </View>
      )}
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.name}</Text>
        <Text style={styles.profileAge}>{item.age}</Text>
        {item.bio && (
          <Text style={styles.profileBio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => {
          // Handle like back
          router.push(`/profile/${item.id}`);
        }}
      >
        <Heart size={20} color="#E91E63" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!subscriptionStatus?.is_premium) {
    return (
      <View style={styles.container}>
        <View style={styles.paywallContainer}>
          <Heart size={64} color="#E91E63" />
          <Text style={styles.paywallTitle}>See Who Likes You</Text>
          <Text style={styles.paywallSubtitle}>
            Upgrade to Premium to see everyone who already likes you and match instantly!
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/premium/paywall?feature=who_liked_you')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading && whoLikedMe.length === 0) {
    return <LoadingScreen />;
  }

  if (whoLikedMe.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={64} color="#E91E63" />}
        title="No Likes Yet"
        subtitle="When someone likes your profile, they'll appear here. Keep swiping to find your matches!"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={whoLikedMe}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  paywallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  paywallSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  upgradeButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  profileCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  superLikeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2196F3',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    padding: 15,
    paddingBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  profileAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileBio: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    lineHeight: 16,
  },
  likeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

## Enhanced Discovery Integration

### Updated Discovery Screen
```typescript
// app/(tabs)/index.tsx (UPDATED)
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { InteractionButtons } from '@/components/ui/InteractionButtons';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { EmptyDiscoveryState } from '@/components/ui/EmptyDiscoveryState';
import { MatchModal } from '@/components/modals/MatchModal';
import { LikeLimitModal } from '@/components/modals/LikeLimitModal';
import { SuperLikeModal } from '@/components/modals/SuperLikeModal';
import { router } from 'expo-router';

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

  const {
    subscriptionStatus,
    sendSuperLike,
    rewindLastAction,
    fetchSubscriptionStatus,
  } = usePremiumStore();

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [showLikeLimitModal, setShowLikeLimitModal] = useState(false);
  const [showSuperLikeModal, setShowSuperLikeModal] = useState(false);

  useEffect(() => {
    fetchProfiles(true);
    fetchStats();
    fetchSubscriptionStatus();
  }, []);

  const currentProfile = profiles[currentIndex];
  const isPremium = subscriptionStatus?.is_premium || false;
  const likesRemaining = isPremium ? 999 : (stats?.likes_remaining || 0);
  const superLikesRemaining = subscriptionStatus?.features.super_likes_remaining || 0;

  const handleLike = async () => {
    if (!currentProfile) return;
    
    if (!isPremium && likesRemaining === 0) {
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
    if (!currentProfile) return;

    if (superLikesRemaining === 0) {
      Alert.alert(
        'No Super Likes',
        'You need Super Likes to use this feature. Purchase more or upgrade to Premium.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Super Likes', onPress: () => router.push('/super-likes/purchase') },
        ]
      );
      return;
    }

    router.push(`/super-like/${currentProfile.id}`);
  };

  const handleMessage = () => {
    if (!currentProfile) return;

    if (isPremium) {
      // Premium users can send direct messages
      router.push(`/messages/request/${currentProfile.id}`);
    } else {
      // Free users need to send message requests
      router.push(`/messages/request/${currentProfile.id}`);
    }
  };

  const handleRewind = async () => {
    if (!isPremium) {
      router.push('/premium/paywall?feature=rewind');
      return;
    }

    const result = await rewindLastAction();
    if (result) {
      Alert.alert(
        'Action Rewound',
        `Your last action on ${result.restored_profile.name} has been undone.`,
        [{ text: 'OK' }]
      );
      fetchProfiles(true);
    }
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
        onRewind={handleRewind}
        likesRemaining={likesRemaining}
        superLikesRemaining={superLikesRemaining}
        isPremium={isPremium}
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
          router.push('/premium/paywall?feature=unlimited_likes');
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

## Navigation Updates

### Tab Navigation with Premium Badge
```typescript
// app/(tabs)/_layout.tsx (UPDATED)
import { Tabs } from 'expo-router';
import { Heart, MessageCircle, User, Settings, Crown } from 'lucide-react-native';
import { usePremiumStore } from '@/stores/premiumStore';
import { useMessagesStore } from '@/stores/messagesStore';

export default function TabLayout() {
  const { unreadCounts } = useMessagesStore();
  const { subscriptionStatus } = usePremiumStore();
  
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  const isPremium = subscriptionStatus?.is_premium || false;

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
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: isPremium ? 'Premium' : 'Upgrade',
          tabBarIcon: ({ size, color }) => (
            <Crown size={size} color={isPremium ? '#FFD700' : color} />
          ),
          tabBarBadge: isPremium ? undefined : '!',
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
  onMessage: () => void;
  onRewind?: () => void; // For premium users to undo last action
    </Tabs>
  );
}
```

## File Structure
```
app/
├── (tabs)/
│   ├── index.tsx # Discovery screen (UPDATED)
│   ├── premium.tsx # Premium hub screen (NEW)
│   └── _layout.tsx # Tab navigation (UPDATED)
├── premium/
│   ├── paywall.tsx # Premium paywall (NEW)
│   ├── subscribe.tsx # Subscription flow (NEW)
│   ├── manage.tsx # Subscription management (NEW)
│   └── who-liked-me.tsx # Who liked me screen (NEW)
├── super-likes/
│   ├── [userId].tsx # Super like compose (NEW)
│   ├── received.tsx # Received super likes (NEW)
│   └── purchase.tsx # Super like purchase (NEW)
├── boosts/
│   ├── activate.tsx # Boost activation (NEW)
│   └── status.tsx # Boost status (NEW)
└── payments/
    └── success.tsx # Payment success (NEW)

components/
├── premium/
│   ├── PremiumFeatureCard.tsx # Feature showcase (NEW)
│   ├── SubscriptionPlan.tsx # Plan selection (NEW)
│   ├── PaymentForm.tsx # Payment form (NEW)
│   └── PremiumBadge.tsx # Premium user badge (NEW)
├── super-likes/
│   ├── SuperLikeCard.tsx # Super like display (NEW)
│   ├── SuperLikeButton.tsx # Enhanced super like button (NEW)
│   └── SuperLikePackage.tsx # Purchase package (NEW)
├── boosts/
│   ├── BoostCard.tsx # Boost display (NEW)
│   ├── BoostTimer.tsx # Active boost timer (NEW)
│   └── BoostAnalytics.tsx # Boost performance (NEW)
└── ui/
    ├── InteractionButtons.tsx # Enhanced with premium features (UPDATED)
    └── PremiumGate.tsx # Premium feature gate (NEW)

services/
├── premium.ts # Premium API client (NEW)
├── payments.ts # Payment processing (NEW)
└── api.ts # Base API client (UPDATED)

stores/
├── premiumStore.ts # Premium state management (NEW)
├── discoveryStore.ts # Discovery store (UPDATED)
└── authStore.ts # Authentication store (UPDATED)

types/
├── premium.ts # Premium types (NEW)
├── payments.ts # Payment types (NEW)
└── api.ts # API response types (UPDATED)

hooks/
├── usePremiumFeatures.ts # Premium feature hooks (NEW)
├── usePayments.ts # Payment processing hooks (NEW)
└── useSubscription.ts # Subscription management hooks (NEW)

utils/
├── premiumHelpers.ts # Premium utility functions (NEW)
├── paymentHelpers.ts # Payment utilities (NEW)
└── subscriptionHelpers.ts # Subscription utilities (NEW)
```

## Testing Requirements

### Unit Tests
- Test premium store actions and state updates
- Test payment service functions
- Test subscription management logic
- Test super like and boost functionality

### Integration Tests
- Test complete subscription flow
- Test super like sending and receiving
- Test boost activation and analytics
- Test premium feature access control

### UI Tests
- Test premium paywall displays
- Test subscription plan selection
- Test payment form functionality
- Test premium feature interfaces

### Payment Tests
- Test Stripe payment integration
- Test subscription webhook handling
- Test payment failure scenarios
- Test refund processing

## Security Considerations
- Secure payment data handling
- Subscription status validation
- Premium feature authorization
- Payment webhook verification
- Fraud detection and prevention

## Performance Optimizations
- Subscription status caching
- Premium feature access optimization
- Payment form optimization
- Super like and boost query optimization

Phase 4 frontend implementation focuses on creating a comprehensive monetization system that drives revenue through premium subscriptions, super likes, and profile boosts while maintaining excellent user experience and security.