# Backend Phase 5 Plan: Real-time Features and Push Notifications

## Phase 5 Objectives
Enhance the real-time communication infrastructure and implement comprehensive push notification system for VibesMatch. This phase focuses on advanced real-time features, background processing, and user engagement through intelligent notifications.

## Database Schema Updates

### Push Notification Tokens Table
```sql
CREATE TABLE push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_token VARCHAR(255) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_info JSONB NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (device_token),
  INDEX idx_user_id (user_id),
  INDEX idx_platform (platform),
  INDEX idx_is_active (is_active),
  INDEX idx_last_used (last_used)
);
```

### Notification Queue Table
```sql
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  retry_count INT DEFAULT 0,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_status (status),
  INDEX idx_scheduled_for (scheduled_for),
  INDEX idx_priority (priority)
);
```

### User Notification Settings Table
```sql
CREATE TABLE user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME NULL,
  quiet_hours_end TIME NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id, notification_type),
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type)
);
```

### Real-time Events Table
```sql
CREATE TABLE realtime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  
  INDEX idx_event_type (event_type),
  INDEX idx_user_id (user_id),
  INDEX idx_target_user_id (target_user_id),
  INDEX idx_processed (processed),
  INDEX idx_created_at (created_at)
);
```

### User Activity Tracking Table
```sql
CREATE TABLE user_activity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  metadata JSONB NULL,
  ip_address INET NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
);
```

## API Endpoints

### POST /api/v1/notifications/register-token
Register device token for push notifications.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "device_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios",
  "device_info": {
    "model": "iPhone 14 Pro",
    "os_version": "17.0",
    "app_version": "1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Device token registered successfully",
    "token_id": "token-uuid-here"
  }
}
```

### DELETE /api/v1/notifications/unregister-token
Unregister device token.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "device_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Device token unregistered successfully"
  }
}
```

### GET /api/v1/notifications/settings
Get user notification preferences.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "notification_type": "new_match",
        "is_enabled": true,
        "push_enabled": true,
        "email_enabled": false
      },
      {
        "notification_type": "new_message",
        "is_enabled": true,
        "push_enabled": true,
        "email_enabled": false
      },
      {
        "notification_type": "super_like_received",
        "is_enabled": true,
        "push_enabled": true,
        "email_enabled": true
      },
      {
        "notification_type": "profile_liked",
        "is_enabled": false,
        "push_enabled": false,
        "email_enabled": false
      }
    ],
    "quiet_hours": {
      "start": "22:00",
      "end": "08:00",
      "timezone": "America/New_York"
    }
  }
}
```

### PUT /api/v1/notifications/settings
Update notification preferences.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "settings": [
    {
      "notification_type": "new_message",
      "is_enabled": true,
      "push_enabled": true,
      "email_enabled": false
    }
  ],
  "quiet_hours": {
    "start": "23:00",
    "end": "07:00",
    "timezone": "America/New_York"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notification settings updated successfully"
  }
}
```

### POST /api/v1/notifications/send
Send immediate notification (admin/system use).

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request:**
```json
{
  "user_ids": ["user-uuid-1", "user-uuid-2"],
  "notification_type": "system_announcement",
  "title": "New Feature Available!",
  "body": "Check out the new Super Boost feature in your discovery settings.",
  "data": {
    "action": "open_discovery",
    "feature": "super_boost"
  },
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notifications queued successfully",
    "queued_count": 2
  }
}
```

### GET /api/v1/realtime/status
Get real-time system status.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "websocket_connected": true,
    "last_heartbeat": "2024-01-15T10:35:00Z",
    "active_connections": 1247,
    "server_status": "healthy",
    "features": {
      "typing_indicators": true,
      "read_receipts": true,
      "presence_status": true,
      "push_notifications": true
    }
  }
}
```

### POST /api/v1/realtime/heartbeat
Send heartbeat to maintain connection.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "timestamp": "2024-01-15T10:35:00Z",
  "client_info": {
    "platform": "ios",
    "app_version": "1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "server_timestamp": "2024-01-15T10:35:01Z",
    "next_heartbeat_in": 30
  }
}
```

## Push Notification Types

### Match Notifications
```json
{
  "type": "new_match",
  "title": "It's a Match! 💕",
  "body": "You and Sarah both liked each other!",
  "data": {
    "match_id": "match-uuid",
    "user_id": "user-uuid",
    "user_name": "Sarah",
    "user_photo": "https://storage.vibesmatch.com/photos/sarah_1.jpg",
    "action": "open_match"
  }
}
```

### Message Notifications
```json
{
  "type": "new_message",
  "title": "New message from Alex",
  "body": "Hey! How was your hiking trip?",
  "data": {
    "conversation_id": "conv-uuid",
    "sender_id": "user-uuid",
    "sender_name": "Alex",
    "message_id": "msg-uuid",
    "action": "open_conversation"
  }
}
```

### Super Like Notifications
```json
{
  "type": "super_like_received",
  "title": "You received a Super Like! ⭐",
  "body": "Someone really likes your profile!",
  "data": {
    "super_like_id": "sl-uuid",
    "sender_id": "user-uuid",
    "sender_name": "Mike",
    "has_message": true,
    "action": "open_super_likes"
  }
}
```

### Profile Activity Notifications
```json
{
  "type": "profile_liked",
  "title": "Someone liked your profile!",
  "body": "Check out who's interested in you",
  "data": {
    "action": "open_who_liked_me",
    "premium_required": true
  }
}
```

## WebSocket Events (Enhanced)

### Enhanced Presence System
```javascript
// Enhanced user presence with activity status
socket.on('user_presence_update', {
  user_id: 'user-uuid',
  status: 'online', // online, away, busy, offline
  activity: 'browsing_discovery', // browsing_discovery, in_chat, idle
  last_seen: '2024-01-15T10:35:00Z',
  device_type: 'mobile'
});

// Bulk presence updates for efficiency
socket.on('presence_bulk_update', {
  updates: [
    {
      user_id: 'user-uuid-1',
      status: 'online',
      activity: 'in_chat'
    },
    {
      user_id: 'user-uuid-2',
      status: 'away',
      activity: 'idle'
    }
  ]
});
```

### Enhanced Typing Indicators
```javascript
// Enhanced typing with conversation context
socket.emit('typing_start', {
  conversation_id: 'conv-uuid',
  typing_type: 'text', // text, voice_message, photo
  estimated_duration: 5000 // milliseconds
});

// Typing progress for longer messages
socket.emit('typing_progress', {
  conversation_id: 'conv-uuid',
  progress: 0.6, // 60% complete
  character_count: 150
});
```

### Real-time Discovery Updates
```javascript
// New profile available in discovery
socket.on('discovery_update', {
  type: 'new_profile',
  profile_id: 'user-uuid',
  priority: 'normal', // normal, high (for super likes)
  boost_active: false
});

// Profile removed from discovery
socket.on('discovery_update', {
  type: 'profile_removed',
  profile_id: 'user-uuid',
  reason: 'user_blocked' // user_blocked, user_deactivated, already_interacted
});
```

### Real-time Match Updates
```javascript
// Match status changes
socket.on('match_update', {
  match_id: 'match-uuid',
  type: 'conversation_started',
  conversation_id: 'conv-uuid',
  initiated_by: 'user-uuid'
});

// Match expiration warnings
socket.on('match_expiration_warning', {
  match_id: 'match-uuid',
  expires_in_hours: 24,
  other_user: {
    name: 'Sarah',
    photo: 'https://storage.vibesmatch.com/photos/sarah_1.jpg'
  }
});
```

## Background Processing Jobs

### Notification Processing Job
```typescript
class NotificationProcessor {
  async processNotificationQueue(): Promise<void>
  async sendPushNotification(notification: QueuedNotification): Promise<void>
  async handleFailedNotifications(): Promise<void>
  async cleanupOldNotifications(): Promise<void>
  private async checkQuietHours(userId: string): Promise<boolean>
  private async checkNotificationSettings(userId: string, type: string): Promise<boolean>
}
```

### Real-time Event Processor
```typescript
class RealtimeEventProcessor {
  async processRealtimeEvents(): Promise<void>
  async broadcastToConnectedUsers(event: RealtimeEvent): Promise<void>
  async handleUserPresenceUpdates(): Promise<void>
  async cleanupStaleConnections(): Promise<void>
}
```

### User Activity Analyzer
```typescript
class UserActivityAnalyzer {
  async analyzeUserActivity(): Promise<void>
  async detectInactiveUsers(): Promise<void>
  async generateEngagementNotifications(): Promise<void>
  async updateUserActivityScores(): Promise<void>
}
```

## Business Logic Rules

### Push Notification Rules
1. **Quiet Hours**: Respect user-defined quiet hours (default: 10 PM - 8 AM)
2. **Frequency Limits**: Max 10 notifications per day per user
3. **Priority System**: Critical > High > Normal > Low
4. **Batching**: Group similar notifications within 5-minute windows
5. **Personalization**: Customize content based on user preferences

### Real-time Presence Rules
1. **Activity Timeout**: Mark as away after 5 minutes of inactivity
2. **Offline Timeout**: Mark as offline after 30 minutes of disconnection
3. **Privacy Settings**: Respect user privacy preferences for presence
4. **Battery Optimization**: Reduce update frequency for low battery devices

### Notification Content Rules
1. **Personalization**: Use recipient's name and relevant context
2. **Localization**: Support multiple languages based on user preference
3. **Privacy**: Never include sensitive message content in notifications
4. **Actionability**: All notifications should have clear actions

## Services Implementation

### PushNotificationService
```typescript
class PushNotificationService {
  async registerDeviceToken(userId: string, token: string, platform: string): Promise<void>
  async unregisterDeviceToken(token: string): Promise<void>
  async sendNotification(userId: string, notification: NotificationData): Promise<void>
  async sendBulkNotifications(notifications: BulkNotificationData[]): Promise<void>
  async scheduleNotification(userId: string, notification: NotificationData, scheduledFor: Date): Promise<void>
  async cancelScheduledNotification(notificationId: string): Promise<void>
  private async validateDeviceToken(token: string, platform: string): Promise<boolean>
  private async handleNotificationFailure(notification: QueuedNotification, error: Error): Promise<void>
}
```

### RealtimeService (Enhanced)
```typescript
class RealtimeService {
  async broadcastToUser(userId: string, event: string, data: any): Promise<void>
  async broadcastToConversation(conversationId: string, event: string, data: any): Promise<void>
  async broadcastToRoom(roomId: string, event: string, data: any): Promise<void>
  async updateUserPresence(userId: string, status: PresenceStatus): Promise<void>
  async getUserPresence(userId: string): Promise<PresenceStatus>
  async getActiveConnections(): Promise<ConnectionInfo[]>
  async disconnectUser(userId: string, reason?: string): Promise<void>
  private async handleConnectionCleanup(): Promise<void>
}
```

### NotificationSettingsService
```typescript
class NotificationSettingsService {
  async getUserSettings(userId: string): Promise<NotificationSettings>
  async updateUserSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void>
  async checkNotificationAllowed(userId: string, type: string): Promise<boolean>
  async setQuietHours(userId: string, start: string, end: string, timezone: string): Promise<void>
  async getDefaultSettings(): Promise<NotificationSettings>
}
```

### UserActivityService
```typescript
class UserActivityService {
  async trackActivity(userId: string, activityType: string, metadata?: any): Promise<void>
  async getUserActivityScore(userId: string): Promise<number>
  async getInactiveUsers(days: number): Promise<string[]>
  async generateEngagementInsights(userId: string): Promise<EngagementInsights>
  async updateLastSeen(userId: string): Promise<void>
}
```

## Rate Limiting

### Notification Endpoints
- POST /notifications/register-token: 10 requests per hour per user
- PUT /notifications/settings: 20 requests per hour per user
- POST /notifications/send: 100 requests per hour (admin only)

### Real-time Events
- Presence updates: 1 per second per user
- Typing events: 10 per minute per conversation
- Heartbeat: 1 per 30 seconds per connection

### Push Notification Limits
- Per user: 10 notifications per day
- Per type: 3 notifications per hour per type
- Critical notifications: No limit

## Error Handling

### Error Codes
- `INVALID_DEVICE_TOKEN`: Device token format is invalid
- `TOKEN_REGISTRATION_FAILED`: Failed to register device token
- `NOTIFICATION_SEND_FAILED`: Failed to send push notification
- `QUIET_HOURS_ACTIVE`: Notification blocked due to quiet hours
- `NOTIFICATION_DISABLED`: User has disabled this notification type
- `RATE_LIMIT_EXCEEDED`: Too many notifications sent
- `REALTIME_CONNECTION_FAILED`: WebSocket connection failed

## File Structure
```
src/
├── controllers/
│   ├── notification.controller.ts (NEW)
│   ├── realtime.controller.ts (UPDATED)
│   └── activity.controller.ts (NEW)
├── services/
│   ├── pushNotification.service.ts (NEW)
│   ├── realtimeService.ts (UPDATED)
│   ├── notificationSettings.service.ts (NEW)
│   └── userActivity.service.ts (NEW)
├── jobs/
│   ├── notificationProcessor.job.ts (NEW)
│   ├── realtimeEventProcessor.job.ts (NEW)
│   └── userActivityAnalyzer.job.ts (NEW)
├── middleware/
│   ├── notification.middleware.ts (NEW)
│   └── realtime.middleware.ts (UPDATED)
├── models/
│   └── schema.prisma (UPDATED)
├── routes/
│   ├── notification.routes.ts (NEW)
│   ├── realtime.routes.ts (UPDATED)
│   └── activity.routes.ts (NEW)
├── sockets/
│   ├── presence.socket.ts (UPDATED)
│   ├── discovery.socket.ts (NEW)
│   └── notification.socket.ts (NEW)
├── types/
│   ├── notification.types.ts (NEW)
│   ├── realtime.types.ts (UPDATED)
│   └── activity.types.ts (NEW)
└── utils/
    ├── notification.util.ts (NEW)
    ├── realtime.util.ts (UPDATED)
    └── activity.util.ts (NEW)
```

## Testing Requirements
- Unit tests for all notification and real-time services
- Integration tests for push notification delivery
- WebSocket connection and event testing
- Background job processing tests
- Notification settings and preferences tests
- Real-time presence and activity tests
- Performance tests for high-volume notifications

## Security Measures
- Device token validation and encryption
- Notification content sanitization
- Rate limiting on all notification endpoints
- User privacy settings enforcement
- Secure WebSocket authentication
- Activity tracking data protection

## Performance Considerations
- Efficient notification batching and queuing
- WebSocket connection pooling and optimization
- Database indexes for notification and activity queries
- Redis caching for user presence and settings
- Background job optimization for high throughput
- Push notification delivery optimization

## Monitoring and Analytics
- Push notification delivery rates and failures
- WebSocket connection stability and performance
- User engagement and activity metrics
- Real-time event processing performance
- Notification open rates and user interactions
- System health and performance monitoring