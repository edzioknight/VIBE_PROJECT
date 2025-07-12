# Backend Phase 3 Plan: Direct Messaging and Chat System

## Phase 3 Objectives
Build the complete messaging system for VibesMatch, including message requests, real-time chat, and enhanced match logic. This phase introduces the core communication features that enable users to connect and build relationships.

## Database Schema Updates

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji')),
  is_request BOOLEAN NOT NULL DEFAULT FALSE,
  request_status VARCHAR(20) NULL CHECK (request_status IN ('pending', 'accepted', 'declined', 'cancelled')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_request (is_request),
  INDEX idx_request_status (request_status),
  INDEX idx_is_read (is_read)
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'archived')),
  last_message_id UUID NULL REFERENCES messages(id),
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user1_id, user2_id),
  INDEX idx_user1_id (user1_id),
  INDEX idx_user2_id (user2_id),
  INDEX idx_last_activity (last_activity),
  INDEX idx_status (status)
);
```

### Message Requests Table
```sql
CREATE TABLE message_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  preview_text TEXT NOT NULL, -- 250 character preview
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (sender_id, receiver_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### User Blocks Table
```sql
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (blocker_id, blocked_id),
  INDEX idx_blocker_id (blocker_id),
  INDEX idx_blocked_id (blocked_id)
);
```

### User Reports Table
```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  description TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_reporter_id (reporter_id),
  INDEX idx_reported_id (reported_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

## API Endpoints

### POST /api/v1/messages/request
Send a message request to another user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "receiver_id": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hi! I noticed we both love hiking. Would you like to chat about your favorite trails?"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "request_id": "req-uuid-here",
    "message_id": "msg-uuid-here",
    "message": "Message request sent successfully",
    "preview_text": "Hi! I noticed we both love hiking. Would you like to chat about your favorite trails?",
    "status": "pending"
  }
}
```

**Business Logic:**
- Content limited to 250 characters for message requests
- Creates message with `is_request: true` and `request_status: 'pending'`
- Creates message_request record
- Only one pending request allowed per user pair
- Premium users can send direct messages without requests
- Free users must wait for request acceptance

### POST /api/v1/messages/request/{request_id}/respond
Respond to a message request (accept/decline).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "action": "accept" // or "decline"
}
```

**Response (Accept):**
```json
{
  "success": true,
  "data": {
    "message": "Request accepted successfully",
    "conversation_id": "conv-uuid-here",
    "match_created": true,
    "match_id": "match-uuid-here"
  }
}
```

**Response (Decline):**
```json
{
  "success": true,
  "data": {
    "message": "Request declined successfully"
  }
}
```

**Business Logic:**
- Updates message_request status
- If accepted: Creates conversation and match (if not exists)
- If accepted: Updates message `request_status` to 'accepted'
- If declined: Updates message `request_status` to 'declined'
- Sender can send regular messages after acceptance

### POST /api/v1/messages/send
Send a message in an existing conversation.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "receiver_id": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Thanks for accepting! What's your favorite hiking spot?",
  "message_type": "text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message_id": "msg-uuid-here",
    "conversation_id": "conv-uuid-here",
    "message": "Message sent successfully",
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

**Business Logic:**
- Requires existing conversation or accepted message request
- Creates message with `is_request: false`
- Updates conversation `last_message_id` and `last_activity`
- Triggers real-time notification via WebSocket

### GET /api/v1/conversations
Get user's conversations list.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Number of conversations (default: 20, max: 50)
- `cursor`: Pagination cursor
- `type`: Filter by type ('active', 'archived') - default: 'active'

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv-uuid-here",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Jane Doe",
          "profile_photos": ["https://storage.vibesmatch.com/photos/jane_1.jpg"],
          "is_online": true,
          "last_active": "2024-01-15T10:30:00Z"
        },
        "last_message": {
          "id": "msg-uuid-here",
          "content": "Thanks for accepting! What's your favorite hiking spot?",
          "sender_id": "current-user-id",
          "created_at": "2024-01-15T10:35:00Z",
          "is_read": false
        },
        "unread_count": 2,
        "last_activity": "2024-01-15T10:35:00Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "cursor": "conv-cursor-here",
      "hasMore": true
    }
  }
}
```

### GET /api/v1/conversations/{conversation_id}/messages
Get messages in a conversation.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Number of messages (default: 50, max: 100)
- `cursor`: Pagination cursor (for loading older messages)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-uuid-1",
        "sender_id": "550e8400-e29b-41d4-a716-446655440001",
        "receiver_id": "current-user-id",
        "content": "Hi! I noticed we both love hiking. Would you like to chat about your favorite trails?",
        "message_type": "text",
        "is_request": true,
        "request_status": "accepted",
        "is_read": true,
        "read_at": "2024-01-15T10:32:00Z",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "msg-uuid-2",
        "sender_id": "current-user-id",
        "receiver_id": "550e8400-e29b-41d4-a716-446655440001",
        "content": "Thanks for accepting! What's your favorite hiking spot?",
        "message_type": "text",
        "is_request": false,
        "is_read": false,
        "created_at": "2024-01-15T10:35:00Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "cursor": "msg-cursor-here",
      "hasMore": true
    }
  }
}
```

### GET /api/v1/messages/requests
Get message requests (received and sent).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `type`: 'received' or 'sent' (default: 'received')
- `status`: 'pending', 'accepted', 'declined', 'cancelled' (default: 'pending')
- `limit`: Number of requests (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req-uuid-here",
        "sender": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "John Smith",
          "profile_photos": ["https://storage.vibesmatch.com/photos/john_1.jpg"],
          "age": 29,
          "is_online": false,
          "last_active": "2024-01-15T09:00:00Z"
        },
        "preview_text": "Hey! I saw you're into photography too. Would love to chat about it!",
        "status": "pending",
        "created_at": "2024-01-15T08:30:00Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "cursor": "req-cursor-here",
      "hasMore": false
    }
  }
}
```

### PUT /api/v1/messages/{message_id}/read
Mark a message as read.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Message marked as read",
    "read_at": "2024-01-15T10:40:00Z"
  }
}
```

### POST /api/v1/users/{user_id}/block
Block a user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "reason": "inappropriate_behavior"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "User blocked successfully"
  }
}
```

**Business Logic:**
- Creates user_blocks record
- Removes any existing matches
- Hides user from discovery for both parties
- Prevents future message requests

### POST /api/v1/users/{user_id}/report
Report a user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "reason": "fake_profile",
  "description": "Profile photos appear to be stock images"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Report submitted successfully",
    "report_id": "report-uuid-here"
  }
}
```

### DELETE /api/v1/matches/{match_id}
Unmatch with a user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Unmatched successfully"
  }
}
```

**Business Logic:**
- Updates match status to 'unmatched'
- Archives conversation
- Removes users from each other's discovery feed

## WebSocket Events

### Connection
```javascript
// Client connects with JWT token
socket.emit('authenticate', { token: 'jwt-token-here' });

// Server confirms authentication
socket.emit('authenticated', { user_id: 'user-uuid' });
```

### Real-time Messaging
```javascript
// Send message
socket.emit('send_message', {
  conversation_id: 'conv-uuid',
  receiver_id: 'user-uuid',
  content: 'Hello!',
  message_type: 'text'
});

// Receive message
socket.on('new_message', {
  message_id: 'msg-uuid',
  conversation_id: 'conv-uuid',
  sender_id: 'user-uuid',
  receiver_id: 'current-user-id',
  content: 'Hello!',
  message_type: 'text',
  created_at: '2024-01-15T10:35:00Z'
});

// Message read receipt
socket.emit('mark_read', {
  message_id: 'msg-uuid'
});

socket.on('message_read', {
  message_id: 'msg-uuid',
  read_by: 'user-uuid',
  read_at: '2024-01-15T10:40:00Z'
});
```

### Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', {
  conversation_id: 'conv-uuid'
});

// Stop typing
socket.emit('typing_stop', {
  conversation_id: 'conv-uuid'
});

// Receive typing status
socket.on('user_typing', {
  conversation_id: 'conv-uuid',
  user_id: 'user-uuid',
  is_typing: true
});
```

### Online Status
```javascript
// User comes online
socket.on('user_online', {
  user_id: 'user-uuid'
});

// User goes offline
socket.on('user_offline', {
  user_id: 'user-uuid',
  last_active: '2024-01-15T10:35:00Z'
});
```

## Business Logic Rules

### Message Request Rules
1. **Free Users**: Must send message request and wait for acceptance
2. **Premium Users**: Can send direct messages without requests
3. **Request Limit**: One pending request per user pair
4. **Character Limit**: 250 characters for message requests
5. **Discovery Removal**: Premium user messages remove target from discovery

### Match Creation Rules (Enhanced)
1. **Mutual Like**: User A likes User B, User B likes User A back
2. **Message Acceptance**: User accepts message request from another user
3. **Message Reply**: User replies to a message request (auto-accepts)
4. **Like Back**: User likes someone who sent them a message request

### Conversation Rules
1. **Message Limit**: Only one message until request accepted
2. **Read Receipts**: Premium users see read receipts
3. **Typing Indicators**: Real-time typing status
4. **Message History**: Full message history preserved

### Blocking and Reporting
1. **Block Effect**: Removes matches, hides from discovery, prevents messages
2. **Report Categories**: Fake profile, inappropriate behavior, spam, other
3. **Unmatch Effect**: Archives conversation, removes from discovery

## Services Implementation

### MessageService
```typescript
class MessageService {
  async sendMessageRequest(senderId: string, receiverId: string, content: string): Promise<MessageRequest>
  async respondToRequest(requestId: string, action: 'accept' | 'decline', userId: string): Promise<RequestResponse>
  async sendMessage(senderId: string, receiverId: string, content: string, messageType: string): Promise<Message>
  async getConversations(userId: string, limit: number, cursor?: string): Promise<Conversation[]>
  async getMessages(conversationId: string, userId: string, limit: number, cursor?: string): Promise<Message[]>
  async markMessageAsRead(messageId: string, userId: string): Promise<void>
  async getMessageRequests(userId: string, type: 'received' | 'sent', status?: string): Promise<MessageRequest[]>
}
```

### ConversationService
```typescript
class ConversationService {
  async createConversation(user1Id: string, user2Id: string): Promise<Conversation>
  async getConversation(user1Id: string, user2Id: string): Promise<Conversation | null>
  async updateLastActivity(conversationId: string, messageId: string): Promise<void>
  async archiveConversation(conversationId: string): Promise<void>
  async getUnreadCount(userId: string): Promise<number>
}
```

### WebSocketService
```typescript
class WebSocketService {
  async handleConnection(socket: Socket, token: string): Promise<void>
  async handleSendMessage(socket: Socket, data: SendMessageData): Promise<void>
  async handleTypingStart(socket: Socket, data: TypingData): Promise<void>
  async handleTypingStop(socket: Socket, data: TypingData): Promise<void>
  async handleMarkRead(socket: Socket, data: MarkReadData): Promise<void>
  async broadcastToUser(userId: string, event: string, data: any): Promise<void>
  async broadcastToConversation(conversationId: string, event: string, data: any, excludeUserId?: string): Promise<void>
}
```

### ModerationService
```typescript
class ModerationService {
  async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void>
  async unblockUser(blockerId: string, blockedId: string): Promise<void>
  async reportUser(reporterId: string, reportedId: string, reason: string, description?: string): Promise<Report>
  async isBlocked(user1Id: string, user2Id: string): Promise<boolean>
  async getBlockedUsers(userId: string): Promise<string[]>
}
```

## Rate Limiting

### Message Endpoints
- POST /messages/request: 10 requests per hour per user
- POST /messages/send: 100 messages per hour per user
- GET /conversations: 60 requests per minute per user
- GET /messages: 120 requests per minute per user

### WebSocket Events
- send_message: 2 messages per second per user
- typing events: 10 events per minute per conversation
- mark_read: 50 events per minute per user

## Error Handling

### Error Codes
- `MESSAGE_REQUEST_EXISTS`: User already has pending request
- `CONVERSATION_NOT_FOUND`: Conversation doesn't exist
- `MESSAGE_NOT_FOUND`: Message doesn't exist
- `REQUEST_NOT_FOUND`: Message request doesn't exist
- `UNAUTHORIZED_ACTION`: User not authorized for action
- `USER_BLOCKED`: User is blocked
- `CONTENT_TOO_LONG`: Message content exceeds limit
- `INVALID_MESSAGE_TYPE`: Invalid message type
- `RATE_LIMIT_EXCEEDED`: Too many requests

## File Structure
```
src/
├── controllers/
│   ├── message.controller.ts (NEW)
│   ├── conversation.controller.ts (NEW)
│   └── moderation.controller.ts (NEW)
├── services/
│   ├── message.service.ts (NEW)
│   ├── conversation.service.ts (NEW)
│   ├── websocket.service.ts (NEW)
│   └── moderation.service.ts (NEW)
├── middleware/
│   ├── message.middleware.ts (NEW)
│   └── websocket.middleware.ts (NEW)
├── models/
│   └── schema.prisma (UPDATED)
├── routes/
│   ├── message.routes.ts (NEW)
│   ├── conversation.routes.ts (NEW)
│   └── moderation.routes.ts (NEW)
├── sockets/
│   ├── message.socket.ts (NEW)
│   ├── typing.socket.ts (NEW)
│   └── presence.socket.ts (NEW)
├── types/
│   ├── message.types.ts (NEW)
│   ├── conversation.types.ts (NEW)
│   └── websocket.types.ts (NEW)
└── utils/
    ├── message.util.ts (NEW)
    └── websocket.util.ts (NEW)
```

## Testing Requirements
- Unit tests for all services and utilities
- Integration tests for API endpoints
- WebSocket connection and event testing
- Message request flow testing
- Real-time messaging testing
- Blocking and reporting functionality
- Rate limiting tests
- Database transaction tests

## Security Measures
- JWT authentication for WebSocket connections
- Message content validation and sanitization
- Rate limiting on all endpoints and WebSocket events
- User authorization checks for all actions
- Blocked user interaction prevention
- Input validation for all message content

## Performance Considerations
- Database indexes on all foreign keys and query fields
- Message pagination for large conversations
- WebSocket connection pooling
- Redis for real-time presence tracking
- Message caching for frequently accessed conversations
- Efficient query optimization for conversation lists

## Monitoring and Analytics
- Message delivery success rates
- WebSocket connection stability
- Response times for message endpoints
- User engagement metrics (messages per conversation)
- Report and block frequency tracking
- Real-time active user counts