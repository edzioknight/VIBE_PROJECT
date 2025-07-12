# Frontend Phase 5 Plan: Real-time Features and Push Notifications

## Phase 5 Objectives
Enhance the real-time user experience and implement comprehensive push notification system for VibesMatch. This phase focuses on advanced real-time features, background processing, notification management, and user engagement optimization.

## Screen Structure

### Notification Management
- **Notification Settings**: Comprehensive notification preference management
- **Notification History**: View and manage received notifications
- **Quiet Hours**: Configure do-not-disturb periods

### Enhanced Real-time Features
- **Advanced Presence**: Detailed online status with activity indicators
- **Real-time Discovery**: Live discovery feed updates and notifications
- **Enhanced Chat**: Improved real-time messaging with advanced indicators
- **Activity Status**: Detailed user activity and engagement tracking

### Background Features
- **Push Notification Handling**: Complete push notification integration
- **Background Sync**: Offline data synchronization
- **App State Management**: Proper foreground/background handling

## API Integration

### Push Notification API Client
```typescript
// services/notifications.ts
export interface NotificationSettings {
  notification_type: string;
  is_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
}

export interface QuietHours {
  start: string;
  end: string;
  timezone: string;
}

export interface DeviceToken {
  device_token: string;
  platform: 'ios' | 'android' | 'web';
  device_info: {
    model: string;
    os_version: string;
    app_version: string;
  };
}

export const notificationsAPI = {
  async registerDeviceToken(tokenData: DeviceToken): Promise<APIResponse<{
    message: string;
    token_id: string;
  }>> {
    return apiClient.request('/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify(tokenData),
    });
  },

  async unregisterDeviceToken(deviceToken: string): Promise<APIResponse<{
    message: string;
  }>> {
    return apiClient.request('/notifications/unregister-token', {
      method: 'DELETE',
      body: JSON.stringify({ device_token: deviceToken }),
    });
  },

  async getNotificationSettings(): Promise<APIResponse<{
    settings: NotificationSettings[];
    quiet_hours: QuietHours;
  }>> {
    return apiClient.request('/notifications/settings');
  },

  async updateNotificationSettings(
    settings: NotificationSettings[],
    quietHours?: QuietHours
  ): Promise<APIResponse<{
    message: string;
  }>> {
    return apiClient.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({
        settings,
        quiet_hours: quietHours,
      }),
    });
  },

  async getRealtimeStatus(): Promise<APIResponse<{
    websocket_connected: boolean;
    last_heartbeat: string;
    active_connections: number;
    server_status: string;
    features: {
      typing_indicators: boolean;
      read_receipts: boolean;
      presence_status: boolean;
      push_notifications: boolean;
    };
  }>> {
    return apiClient.request('/realtime/status');
  },

  async sendHeartbeat(): Promise<APIResponse<{
    server_timestamp: string;
    next_heartbeat_in: number;
  }>> {
    return apiClient.request('/realtime/heartbeat', {
      method: 'POST',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        client_info: {
          platform: Platform.OS,
          app_version: Constants.expoConfig?.version || '1.0.0',
        },
      }),
    });
  },
};
```

### Enhanced WebSocket Service
```typescript
// services/enhancedWebSocket.ts
import io, { Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';

export interface EnhancedPresenceStatus {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activity: 'browsing_discovery' | 'in_chat' | 'idle';
  last_seen: string;
  device_type: 'mobile' | 'web';
}

export interface DiscoveryUpdate {
  type: 'new_profile' | 'profile_removed';
  profile_id: string;
  priority?: 'normal' | 'high';
  boost_active?: boolean;
  reason?: string;
}

export interface MatchUpdate {
  match_id: string;
  type: 'conversation_started' | 'match_expired' | 'match_unmatched';
  conversation_id?: string;
  initiated_by?: string;
  expires_in_hours?: number;
  other_user?: {
    name: string;
    photo: string;
  };
}

class EnhancedWebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentActivity: string = 'idle';

  connect(token: string) {
    this.socket = io(process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventListeners();
    this.setupHeartbeat();
    this.setupAppStateHandling();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Enhanced WebSocket connected');
      this.updateUserActivity('browsing_discovery');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Enhanced WebSocket disconnected:', reason);
      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnection();
    });
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (this.isConnected) {
        try {
          await notificationsAPI.sendHeartbeat();
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      }
    }, 30000); // 30 seconds
  }

  private setupAppStateHandling() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      this.updateUserActivity('browsing_discovery');
      if (!this.isConnected) {
        this.handleReconnection();
      }
    } else if (nextAppState === 'background') {
      this.updateUserActivity('idle');
    }
  };

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.socket?.connect();
      }, delay);
    }
  }

  // Enhanced presence methods
  updateUserActivity(activity: string) {
    this.currentActivity = activity;
    this.socket?.emit('user_activity_update', {
      activity,
      timestamp: new Date().toISOString(),
    });
  }

  onPresenceUpdate(callback: (presence: EnhancedPresenceStatus) => void) {
    this.socket?.on('user_presence_update', callback);
  }

  onPresenceBulkUpdate(callback: (updates: EnhancedPresenceStatus[]) => void) {
    this.socket?.on('presence_bulk_update', (data) => {
      callback(data.updates);
    });
  }

  // Enhanced typing methods
  startTyping(conversationId: string, typingType: 'text' | 'voice_message' | 'photo' = 'text') {
    this.socket?.emit('typing_start', {
      conversation_id: conversationId,
      typing_type: typingType,
      estimated_duration: 5000,
    });
  }

  updateTypingProgress(conversationId: string, progress: number, characterCount: number) {
    this.socket?.emit('typing_progress', {
      conversation_id: conversationId,
      progress,
      character_count: characterCount,
    });
  }

  onTypingProgress(callback: (data: {
    conversation_id: string;
    user_id: string;
    progress: number;
    character_count: number;
  }) => void) {
    this.socket?.on('typing_progress', callback);
  }

  // Discovery real-time updates
  onDiscoveryUpdate(callback: (update: DiscoveryUpdate) => void) {
    this.socket?.on('discovery_update', callback);
  }

  // Match real-time updates
  onMatchUpdate(callback: (update: MatchUpdate) => void) {
    this.socket?.on('match_update', callback);
  }

  onMatchExpirationWarning(callback: (warning: MatchUpdate) => void) {
    this.socket?.on('match_expiration_warning', callback);
  }

  // Connection management
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    AppState.removeEventListener('change', this.handleAppStateChange);
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getCurrentActivity(): string {
    return this.currentActivity;
  }
}

export const enhancedWebSocketService = new EnhancedWebSocketService();
```

### Push Notification Service
```typescript
// services/pushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

class PushNotificationService {
  private deviceToken: string | null = null;

  async initialize(): Promise<void> {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permissions
    await this.requestPermissions();
    
    // Register for push notifications
    await this.registerForPushNotifications();
    
    // Set up notification listeners
    this.setupNotificationListeners();
  }

  private async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permissions not granted');
      return false;
    }

    return true;
  }

  private async registerForPushNotifications(): Promise<void> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.deviceToken = token.data;

      // Register token with backend
      await notificationsAPI.registerDeviceToken({
        device_token: token.data,
        platform: Platform.OS as 'ios' | 'android',
        device_info: {
          model: Device.modelName || 'Unknown',
          os_version: Device.osVersion || 'Unknown',
          app_version: Constants.expoConfig?.version || '1.0.0',
        },
      });

      console.log('Push notification token registered:', token.data);
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      this.handleNotificationTapped(response);
    });
  }

  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { data } = notification.request.content;
    
    // Update app state based on notification type
    switch (data?.type) {
      case 'new_message':
        // Update message store
        break;
      case 'new_match':
        // Update discovery store
        break;
      case 'super_like_received':
        // Update premium store
        break;
    }
  }

  private handleNotificationTapped(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    // Navigate based on notification action
    switch (data?.action) {
      case 'open_conversation':
        // Navigate to specific conversation
        break;
      case 'open_match':
        // Navigate to match screen
        break;
      case 'open_super_likes':
        // Navigate to super likes
        break;
      case 'open_discovery':
        // Navigate to discovery
        break;
    }
  }

  async scheduleLocalNotification(notification: NotificationData, delay: number): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: notification.sound !== false,
        badge: notification.badge,
      },
      trigger: {
        seconds: delay,
      },
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async unregister(): Promise<void> {
    if (this.deviceToken) {
      try {
        await notificationsAPI.unregisterDeviceToken(this.deviceToken);
        this.deviceToken = null;
      } catch (error) {
        console.error('Failed to unregister device token:', error);
      }
    }
  }

  getDeviceToken(): string | null {
    return this.deviceToken;
  }
}

export const pushNotificationService = new PushNotificationService();
```

## State Management

### Enhanced Real-time Store
```typescript
// stores/realtimeStore.ts
import { create } from 'zustand';

interface RealtimeState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  lastHeartbeat: string | null;
  serverStatus: string;
  activeConnections: number;
  userPresence: Record<string, EnhancedPresenceStatus>;
  discoveryUpdates: DiscoveryUpdate[];
  matchUpdates: MatchUpdate[];
  typingProgress: Record<string, {
    user_id: string;
    progress: number;
    character_count: number;
  }>;
  features: {
    typing_indicators: boolean;
    read_receipts: boolean;
    presence_status: boolean;
    push_notifications: boolean;
  };
}

interface RealtimeActions {
  setConnectionStatus: (status: RealtimeState['connectionStatus']) => void;
  updateUserPresence: (userId: string, presence: EnhancedPresenceStatus) => void;
  bulkUpdatePresence: (updates: EnhancedPresenceStatus[]) => void;
  addDiscoveryUpdate: (update: DiscoveryUpdate) => void;
  addMatchUpdate: (update: MatchUpdate) => void;
  updateTypingProgress: (conversationId: string, data: any) => void;
  clearTypingProgress: (conversationId: string) => void;
  fetchRealtimeStatus: () => Promise<void>;
  updateActivity: (activity: string) => void;
  reset: () => void;
}

export const useRealtimeStore = create<RealtimeState & RealtimeActions>((set, get) => ({
  isConnected: false,
  connectionStatus: 'disconnected',
  lastHeartbeat: null,
  serverStatus: 'unknown',
  activeConnections: 0,
  userPresence: {},
  discoveryUpdates: [],
  matchUpdates: [],
  typingProgress: {},
  features: {
    typing_indicators: false,
    read_receipts: false,
    presence_status: false,
    push_notifications: false,
  },

  setConnectionStatus: (status) => {
    set({ 
      connectionStatus: status,
      isConnected: status === 'connected',
    });
  },

  updateUserPresence: (userId, presence) => {
    set(state => ({
      userPresence: {
        ...state.userPresence,
        [userId]: presence,
      },
    }));
  },

  bulkUpdatePresence: (updates) => {
    set(state => {
      const newPresence = { ...state.userPresence };
      updates.forEach(update => {
        newPresence[update.user_id] = update;
      });
      return { userPresence: newPresence };
    });
  },

  addDiscoveryUpdate: (update) => {
    set(state => ({
      discoveryUpdates: [update, ...state.discoveryUpdates.slice(0, 49)], // Keep last 50
    }));
  },

  addMatchUpdate: (update) => {
    set(state => ({
      matchUpdates: [update, ...state.matchUpdates.slice(0, 49)], // Keep last 50
    }));
  },

  updateTypingProgress: (conversationId, data) => {
    set(state => ({
      typingProgress: {
        ...state.typingProgress,
        [conversationId]: data,
      },
    }));
  },

  clearTypingProgress: (conversationId) => {
    set(state => {
      const newProgress = { ...state.typingProgress };
      delete newProgress[conversationId];
      return { typingProgress: newProgress };
    });
  },

  fetchRealtimeStatus: async () => {
    try {
      const response = await notificationsAPI.getRealtimeStatus();
      if (response.success && response.data) {
        set({
          lastHeartbeat: response.data.last_heartbeat,
          serverStatus: response.data.server_status,
          activeConnections: response.data.active_connections,
          features: response.data.features,
        });
      }
    } catch (error) {
      console.error('Failed to fetch realtime status:', error);
    }
  },

  updateActivity: (activity) => {
    enhancedWebSocketService.updateUserActivity(activity);
  },

  reset: () => set({
    isConnected: false,
    connectionStatus: 'disconnected',
    lastHeartbeat: null,
    serverStatus: 'unknown',
    activeConnections: 0,
    userPresence: {},
    discoveryUpdates: [],
    matchUpdates: [],
    typingProgress: {},
  }),
}));
```

### Notification Settings Store
```typescript
// stores/notificationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  settings: NotificationSettings[];
  quietHours: QuietHours | null;
  deviceToken: string | null;
  permissionsGranted: boolean;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: NotificationSettings[], quietHours?: QuietHours) => Promise<void>;
  updateSingleSetting: (type: string, enabled: boolean, pushEnabled?: boolean) => Promise<void>;
  setQuietHours: (start: string, end: string, timezone: string) => Promise<void>;
  registerDevice: () => Promise<void>;
  unregisterDevice: () => Promise<void>;
  setPermissionsGranted: (granted: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      settings: [],
      quietHours: null,
      deviceToken: null,
      permissionsGranted: false,
      isLoading: false,
      error: null,

      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await notificationsAPI.getNotificationSettings();
          if (response.success && response.data) {
            set({
              settings: response.data.settings,
              quietHours: response.data.quiet_hours,
              isLoading: false,
            });
          } else {
            set({ error: response.error?.message || 'Failed to load settings', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      updateSettings: async (settings, quietHours) => {
        set({ isLoading: true, error: null });
        try {
          const response = await notificationsAPI.updateNotificationSettings(settings, quietHours);
          if (response.success) {
            set({
              settings,
              quietHours: quietHours || get().quietHours,
              isLoading: false,
            });
          } else {
            set({ error: response.error?.message || 'Failed to update settings', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      updateSingleSetting: async (type, enabled, pushEnabled) => {
        const currentSettings = get().settings;
        const updatedSettings = currentSettings.map(setting =>
          setting.notification_type === type
            ? {
                ...setting,
                is_enabled: enabled,
                push_enabled: pushEnabled !== undefined ? pushEnabled : setting.push_enabled,
              }
            : setting
        );
        
        await get().updateSettings(updatedSettings);
      },

      setQuietHours: async (start, end, timezone) => {
        const quietHours = { start, end, timezone };
        await get().updateSettings(get().settings, quietHours);
      },

      registerDevice: async () => {
        try {
          await pushNotificationService.initialize();
          const token = pushNotificationService.getDeviceToken();
          set({ 
            deviceToken: token,
            permissionsGranted: !!token,
          });
        } catch (error) {
          set({ error: 'Failed to register for notifications' });
        }
      },

      unregisterDevice: async () => {
        try {
          await pushNotificationService.unregister();
          set({ 
            deviceToken: null,
            permissionsGranted: false,
          });
        } catch (error) {
          set({ error: 'Failed to unregister device' });
        }
      },

      setPermissionsGranted: (granted) => set({ permissionsGranted: granted }),
      setError: (error) => set({ error }),
      
      reset: () => set({
        settings: [],
        quietHours: null,
        deviceToken: null,
        permissionsGranted: false,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        settings: state.settings,
        quietHours: state.quietHours,
        permissionsGranted: state.permissionsGranted,
      }),
    }
  )
);
```

## Screen Components

### Notification Settings Screen
```typescript
// app/settings/notifications.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Clock, Smartphone } from 'lucide-react-native';
import { useNotificationStore } from '@/stores/notificationStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function NotificationSettingsScreen() {
  const {
    settings,
    quietHours,
    permissionsGranted,
    isLoading,
    fetchSettings,
    updateSingleSetting,
    setQuietHours,
    registerDevice,
  } = useNotificationStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const notificationTypes = [
    {
      type: 'new_match',
      title: 'New Matches',
      description: 'When someone likes you back',
      icon: '💕',
    },
    {
      type: 'new_message',
      title: 'New Messages',
      description: 'When you receive a message',
      icon: '💬',
    },
    {
      type: 'super_like_received',
      title: 'Super Likes',
      description: 'When someone super likes you',
      icon: '⭐',
    },
    {
      type: 'profile_liked',
      title: 'Profile Likes',
      description: 'When someone likes your profile',
      icon: '❤️',
    },
    {
      type: 'message_request',
      title: 'Message Requests',
      description: 'When you receive a message request',
      icon: '📩',
    },
  ];

  if (isLoading && settings.length === 0) {
    return <LoadingScreen />;
  }

  const getSetting = (type: string) => {
    return settings.find(s => s.notification_type === type);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Bell size={32} color="#E91E63" />
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>
          Customize when and how you receive notifications
        </Text>
      </View>

      {!permissionsGranted && (
        <View style={styles.permissionCard}>
          <Smartphone size={24} color="#FF9800" />
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>Enable Push Notifications</Text>
            <Text style={styles.permissionDescription}>
              Allow notifications to stay updated on matches and messages
            </Text>
          </View>
          <TouchableOpacity style={styles.enableButton} onPress={registerDevice}>
            <Text style={styles.enableButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        {notificationTypes.map((type) => {
          const setting = getSetting(type.type);
          return (
            <View key={type.type} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>{type.icon}</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{type.title}</Text>
                  <Text style={styles.settingDescription}>{type.description}</Text>
                </View>
              </View>
              <Switch
                value={setting?.is_enabled || false}
                onValueChange={(enabled) => updateSingleSetting(type.type, enabled)}
                trackColor={{ false: '#ccc', true: '#E91E63' }}
                thumbColor="#fff"
              />
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quiet Hours</Text>
        <Text style={styles.sectionDescription}>
          Set times when you don't want to receive notifications
        </Text>
        
        <TouchableOpacity style={styles.quietHoursCard}>
          <Clock size={24} color="#666" />
          <View style={styles.quietHoursText}>
            <Text style={styles.quietHoursTitle}>Do Not Disturb</Text>
            <Text style={styles.quietHoursTime}>
              {quietHours ? `${quietHours.start} - ${quietHours.end}` : 'Not set'}
            </Text>
          </View>
          <Text style={styles.quietHoursArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Settings</Text>
        
        <TouchableOpacity style={styles.advancedItem}>
          <Text style={styles.advancedTitle}>Notification Sound</Text>
          <Text style={styles.advancedValue}>Default</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.advancedItem}>
          <Text style={styles.advancedTitle}>Vibration</Text>
          <Text style={styles.advancedValue}>Enabled</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.advancedItem}>
          <Text style={styles.advancedTitle}>Badge Count</Text>
          <Text style={styles.advancedValue}>Enabled</Text>
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
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
  },
  enableButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 15,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  quietHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  quietHoursText: {
    flex: 1,
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  quietHoursTime: {
    fontSize: 14,
    color: '#666',
  },
  quietHoursArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  advancedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  advancedTitle: {
    fontSize: 16,
    color: '#333',
  },
  advancedValue: {
    fontSize: 16,
    color: '#666',
  },
});
```

### Enhanced Chat Screen with Real-time Features
```typescript
// app/chat/[conversationId].tsx (UPDATED)
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Send, MoreVertical, Circle } from 'lucide-react-native';
import { useMessagesStore } from '@/stores/messagesStore';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { enhancedWebSocketService } from '@/services/enhancedWebSocket';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { EnhancedTypingIndicator } from '@/components/messages/EnhancedTypingIndicator';
import { useAuthStore } from '@/stores/authStore';

export default function EnhancedChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    messages,
    conversations,
    fetchMessages,
    setCurrentConversation,
    sendMessage,
    markMessageAsRead,
  } = useMessagesStore();

  const {
    userPresence,
    typingProgress,
    updateActivity,
  } = useRealtimeStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const conversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = messages[conversationId!] || [];
  const otherUser = conversation?.user;
  const otherUserPresence = otherUser ? userPresence[otherUser.id] : null;
  const currentTypingProgress = typingProgress[conversationId!];

  useEffect(() => {
    if (conversationId) {
      setCurrentConversation(conversationId);
      fetchMessages(conversationId);
      updateActivity('in_chat');
      
      // Set navigation title with presence
      navigation.setOptions({
        title: otherUser?.name || 'Chat',
        headerRight: () => (
          <View style={styles.headerRight}>
            {otherUserPresence && (
              <View style={styles.presenceContainer}>
                <Circle 
                  size={8} 
                  color={getPresenceColor(otherUserPresence.status)} 
                  fill={getPresenceColor(otherUserPresence.status)}
                />
                <Text style={styles.presenceText}>
                  {getPresenceText(otherUserPresence)}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={() => {/* Open profile actions */}}>
              <MoreVertical size={24} color="#333" />
            </TouchableOpacity>
          </View>
        ),
      });
    }

    return () => {
      setCurrentConversation(null);
      updateActivity('browsing_discovery');
    };
  }, [conversationId, otherUser, otherUserPresence]);

  const getPresenceColor = (status: string) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'away': return '#FF9800';
      case 'busy': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPresenceText = (presence: any) => {
    if (presence.status === 'online') {
      switch (presence.activity) {
        case 'in_chat': return 'Active now';
        case 'browsing_discovery': return 'Online';
        default: return 'Online';
      }
    }
    return 'Last seen recently';
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    
    // Handle typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      enhancedWebSocketService.startTyping(conversationId!);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      enhancedWebSocketService.stopTyping(conversationId!);
    }

    // Update typing progress
    if (text.length > 0) {
      const progress = Math.min(text.length / 100, 1); // Assume 100 chars is "complete"
      enhancedWebSocketService.updateTypingProgress(conversationId!, progress, text.length);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        enhancedWebSocketService.stopTyping(conversationId!);
      }
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !otherUser) return;

    const messageContent = inputText.trim();
    setInputText('');
    
    // Stop typing indicator
    if (isTyping) {
      enhancedWebSocketService.stopTyping(conversationId!);
      setIsTyping(false);
    }

    await sendMessage(otherUser.id, messageContent);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item: message }: { item: any }) => (
    <MessageBubble
      message={message}
      isOwn={message.sender_id === user?.id}
      showReadReceipt={message.sender_id === user?.id && message.is_read}
      onRead={() => {
        if (message.sender_id !== user?.id && !message.is_read) {
          markMessageAsRead(message.id);
        }
      }}
    />
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {currentTypingProgress && (
        <EnhancedTypingIndicator
          userName={otherUser?.name || 'User'}
          progress={currentTypingProgress.progress}
          characterCount={currentTypingProgress.character_count}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Send size={20} color={inputText.trim() ? '#E91E63' : '#ccc'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  presenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  presenceText: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
```

## Enhanced Components

### Enhanced Typing Indicator
```typescript
// components/messages/EnhancedTypingIndicator.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface EnhancedTypingIndicatorProps {
  userName: string;
  progress?: number;
  characterCount?: number;
}

export function EnhancedTypingIndicator({ 
  userName, 
  progress = 0, 
  characterCount = 0 
}: EnhancedTypingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
      animation.start();
      return animation;
    };

    const animation = animateDots();
    return () => animation.stop();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.header}>
          <Text style={styles.text}>{userName} is typing</Text>
          {characterCount > 0 && (
            <Text style={styles.characterCount}>{characterCount} chars</Text>
          )}
        </View>
        
        <View style={styles.content}>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
          
          {progress > 0 && (
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]} 
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    minWidth: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
  },
  progressContainer: {
    height: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 1,
  },
});
```

## File Structure
```
app/
├── (tabs)/
│   ├── index.tsx # Discovery with real-time updates (UPDATED)
│   ├── messages.tsx # Messages with enhanced real-time (UPDATED)
│   └── _layout.tsx # Tab navigation (UPDATED)
├── chat/
│   └── [conversationId].tsx # Enhanced chat screen (UPDATED)
├── settings/
│   ├── notifications.tsx # Notification settings (NEW)
│   └── privacy.tsx # Privacy settings with presence (NEW)
└── notifications/
    ├── history.tsx # Notification history (NEW)
    └── test.tsx # Notification testing (NEW)

components/
├── messages/
│   ├── EnhancedTypingIndicator.tsx # Enhanced typing with progress (NEW)
│   ├── PresenceIndicator.tsx # User presence display (NEW)
│   └── MessageBubble.tsx # Enhanced with read receipts (UPDATED)
├── notifications/
│   ├── NotificationCard.tsx # Notification display (NEW)
│   ├── QuietHoursSelector.tsx # Quiet hours picker (NEW)
│   └── PermissionPrompt.tsx # Permission request (NEW)
├── realtime/
│   ├── ConnectionStatus.tsx # Connection status indicator (NEW)
│   ├── ActivityIndicator.tsx # User activity display (NEW)
│   └── PresenceList.tsx # Online users list (NEW)
└── ui/
    ├── LoadingScreen.tsx # Loading states (UPDATED)
    └── ErrorScreen.tsx # Error handling (UPDATED)

services/
├── notifications.ts # Push notification API (NEW)
├── enhancedWebSocket.ts # Enhanced WebSocket service (NEW)
├── pushNotifications.ts # Expo push notifications (NEW)
├── backgroundTasks.ts # Background processing (NEW)
└── api.ts # Base API client (UPDATED)

stores/
├── realtimeStore.ts # Enhanced real-time state (NEW)
├── notificationStore.ts # Notification settings state (NEW)
├── messagesStore.ts # Messages with real-time (UPDATED)
├── discoveryStore.ts # Discovery with real-time (UPDATED)
└── authStore.ts # Auth with presence (UPDATED)

types/
├── notifications.ts # Notification types (NEW)
├── realtime.ts # Real-time event types (NEW)
├── presence.ts # Presence status types (NEW)
└── api.ts # API response types (UPDATED)

hooks/
├── useNotifications.ts # Notification management hooks (NEW)
├── useRealtime.ts # Real-time connection hooks (NEW)
├── usePresence.ts # Presence tracking hooks (NEW)
├── useBackgroundTasks.ts # Background task hooks (NEW)
└── useAppState.ts # App state management hooks (NEW)

utils/
├── notificationHelpers.ts # Notification utilities (NEW)
├── realtimeHelpers.ts # Real-time utilities (NEW)
├── presenceHelpers.ts # Presence utilities (NEW)
└── backgroundHelpers.ts # Background task utilities (NEW)
```

## Testing Requirements

### Unit Tests
- Test notification store actions and state updates
- Test enhanced WebSocket service functionality
- Test push notification service integration
- Test real-time event processing

### Integration Tests
- Test complete notification flow from backend to device
- Test real-time messaging with enhanced features
- Test presence status updates and synchronization
- Test background task processing

### UI Tests
### Notification Settings Interface
**Settings Management:**
- Test notification type toggle functionality
- Test quiet hours configuration interface with QuietHoursSelector.tsx - Component for selecting quiet hours range
- Test settings persistence
- Test settings synchronization
- PermissionPrompt.tsx - UI for requesting notification permissions
- NotificationHistory.tsx - Screen to display past notifications
- NotificationTesting.tsx - Internal screen for testing notification delivery

**Permission Management:**
- Test push notification permission request
- Test device token registration and management
- Test permission state persistence

### Performance Tests
- Test WebSocket connection stability under load
- Test notification delivery performance
- Test real-time event processing performance
- Test background task efficiency

## Environment Configuration

### Development Environment
```env
EXPO_PUBLIC_API_URL=https://api-dev.vibesmatch.com/api/v1
EXPO_PUBLIC_WS_URL=wss://ws-dev.vibesmatch.com
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_DEBUG_MODE=true
```

### Production Environment
```env
EXPO_PUBLIC_API_URL=https://api.vibesmatch.com/api/v1
EXPO_PUBLIC_WS_URL=wss://ws.vibesmatch.com
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_DEBUG_MODE=false
```

## Security Considerations
- Secure device token management
- Notification content privacy
- Real-time event authorization
- Background task security
- User presence privacy settings

## Performance Optimizations
- Efficient WebSocket connection management
- Notification batching and queuing
- Real-time event processing optimization
- Background task scheduling
- Memory management for long-running connections

Phase 5 frontend implementation focuses on creating an advanced real-time experience with comprehensive push notification management, enhanced presence tracking, and optimized background processing for maximum user engagement.