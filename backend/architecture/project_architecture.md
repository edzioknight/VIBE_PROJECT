# VibesMatch Project Architecture

## Project Overview

VibesMatch is a modern dating application designed to create meaningful connections based on compatibility, shared interests, and communication. The application follows a phased development approach, with each phase building upon the previous to create a comprehensive dating platform with premium features, real-time communication, and advanced matching algorithms.

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.io
- **File Storage**: AWS S3 (or compatible)
- **Caching**: Redis for session management & rate limiting
- **Validation**: Zod
- **API Documentation**: OpenAPI/Swagger
- **Payment Processing**: Stripe, Apple Pay, Google Pay

### Frontend
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **API Client**: Fetch API with custom hooks
- **Real-time**: Socket.io-client
- **UI Components**: Custom components with React Native
- **Styling**: StyleSheet with theme system
- **Icons**: Lucide React Native
- **Image Handling**: Expo Image Picker
- **Animations**: React Native Reanimated
- **Storage**: Expo SecureStore
- **Push Notifications**: Expo Notifications

### QA & Testing
- **API Testing**: Postman, Jest
- **Mobile Testing**: Detox for React Native E2E testing
- **Performance**: Artillery for load testing
- **Real-time**: Custom WebSocket testing scripts
- **Database**: SQL scripts for data setup/teardown

## System Architecture

### API Architecture
- **Base URL**: `/api/v1`
- **Authentication**: Bearer JWT tokens
- **Rate Limiting**: Redis-based per endpoint
- **Validation**: Zod schemas on all inputs
- **Error Handling**: Consistent error response format
- **Pagination**: Cursor-based pagination. The `cursor` will be a Base64 encoded JSON string containing the `id` and `created_at` timestamp of the last item in the previous page (e.g., `cursor: base64(JSON.stringify({ id: 'last_item_id', createdAt: 'last_item_timestamp' }))`)
- **File Uploads**: Multipart form data

### Database Schema Overview
- **users**: Profile data, preferences, location
- **auth_tokens**: JWT refresh tokens
- **user_actions**: Likes, super likes, blocks
- **messages**: Chat messages and requests
- **matches**: Match records
- **super_likes**: Purchase and usage tracking
- **subscriptions**: Premium subscription data
- **reports**: User reports and moderation
- **boosts**: Profile boost purchases
- **user_sessions**: Active sessions tracking
- **push_notification_tokens**: Device registration for notifications
- **user_compatibility**: Compatibility scores between users
- **advanced_search_preferences**: User search criteria

### Frontend Architecture
- **Navigation Structure**: Tab-based with nested stack navigation
- **State Management**: Zustand stores with persistence
- **API Integration**: Custom hooks with error handling
- **Real-time Features**: WebSocket connection with reconnection logic
- **Offline Strategy**: Utilize Zustand persist for critical UI state, Expo SecureStore for sensitive data, and a background synchronization mechanism for outgoing data (e.g., queued actions). UI should display network status indicators and provide optimistic updates where appropriate.
- **Theme Support**: Light/Dark mode with consistent styling
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Full screen reader and keyboard support

### Real-time Communication
- **WebSocket Server**: Socket.io for bidirectional communication
- **Event Types**: Message, typing, presence, discovery updates
- **Connection Management**: Authentication, reconnection, heartbeat
- **Presence System**: Online/offline status with activity tracking
- **Push Notifications**: Multi-provider support with intelligent delivery

## Authentication Flow
1. **Sign Up**: Email/Google → OTP verification → Multi-step profile creation
2. **Sign In**: Email/Google → JWT access token + refresh token
3. **Token Refresh**: Automatic token renewal with validation
4. **Session Management**: Active session tracking with multi-device logout capability
5. **User Verification**: Email existence check before OTP
6. **Onboarding Status**: Verification of onboarding completion

## Business Logic Rules

### User Tiers
- **Free Users**: 20 likes per 12 hours, message requests only, basic filters
- **Premium Users**: Unlimited likes, direct messages, read receipts, advanced filters

### Discovery Algorithm
- **Sorting**: Online users first, then by last_active timestamp
- **Filtering**: Age, gender, distance, and premium filters
- **Exclusion**: Already interacted users, blocked users
- **Boost**: Boosted profiles get priority visibility

### Matching Logic
- **Mutual Like**: User A likes User B, User B likes User A
- **Message Acceptance**: User accepts message request
- **Message Reply**: User replies to a message request
- **Like After Request**: User likes someone who sent them a request

### Monetization
- **Subscription**: Monthly/Yearly premium plans with trial
- **Super Likes**: Monthly allocation for premium, packages for purchase
- **Boosts**: Increased visibility for set duration
- **Feature Gating**: Premium-only features throughout the app

## Security Measures
- **Input Validation**: All endpoints validated with Zod
- **Rate Limiting**: Per-user and per-IP limits
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **CORS**: Properly configured
- **Helmet**: Security headers
- **Data Sanitization**: XSS protection
- **Payment Security**: PCI compliance for payment processing
- **Token Security**: Secure JWT implementation

## Development Phases

### Phase 1: Authentication & User Management
- Authentication system with OTP
- User profile creation and management
- Session management with multi-device control
- Multi-step onboarding flow
- User existence verification
- Onboarding status tracking
- Basic settings and preferences

### Phase 2: Discovery, Likes, and Basic Matching
- Discovery feed with profile cards
- Like/dislike functionality
- Match creation on mutual likes
- Basic profile viewing

### Phase 3: Direct Messaging and Chat System
- Message requests for free users
- Real-time chat with typing indicators
- Conversation management
- Blocking and reporting functionality

### Phase 4: Premium Features, Super Likes, and Subscriptions
- Subscription management
- Super like functionality
- Profile boost system
- Premium features (who liked me, read receipts, etc.)

### Phase 5: Real-time Features and Push Notifications
- Enhanced real-time presence
- Push notification system
- Advanced typing indicators
- Background processing

### Phase 6: Advanced Features, Search, and Boost
- Multi-criteria search
- Recommendation engine
- Compatibility algorithm
- Analytics dashboards

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "pagination": {
      "cursor": "eyJpZCI6MTIz",
      "hasMore": true
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["Email is required", "Age must be 18+"]
  }
}
```

### HTTP Status Code to Error Code Mapping

| HTTP Status | APIResponse error.code | Description |
|-------------|------------------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., duplicate email) |
| 422 | UNPROCESSABLE_ENTITY | Valid data but cannot be processed |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_SERVER_ERROR | Unexpected server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## Frontend Screen Structure

### Authentication Flow
```
Landing Screen → Sign In/Sign Up → OTP Verification → [Existing User: Main App] | [New User: Onboarding Flow]
```

### Onboarding Flow
```
Basic Info → Location → Lifestyle → Preferences → Personality → Photos → Complete
```

### Main App (Tabs)
```
Discovery → Messages → Premium → Profile → Settings
```

## Testing Strategy

### API Contract Testing
- Validate all backend endpoints match specifications
- Test request/response formats, authentication, validation

### Business Logic Testing
- Verify all app rules and restrictions
- Test free user limits, premium features, matching logic

### UI/UX Flow Testing
- Test all user interface flows
- Verify screen transitions, form validation, error handling

### Integration Testing
- End-to-end user journey testing
- Test complete flows across multiple features

### Performance Testing
- Load testing for concurrent users
- Response time benchmarks for all endpoints
- Animation performance on mobile devices

### Security Testing
- Authentication and authorization testing
- Input validation and sanitization
- Payment security and PCI compliance

## Cross-Team Collaboration

### API Contracts
- Backend defines exact API endpoints and response formats
- Frontend consumes these endpoints exactly as specified
- QA validates the contract is fulfilled correctly

### Feature Gating
- Backend implements and enforces feature access rules
- Frontend respects these rules and provides appropriate UI
- QA verifies correct implementation of access controls

### Real-time Integration
- Backend provides WebSocket events and handlers
- Frontend connects and processes these events
- QA tests the real-time communication reliability

## Deployment Strategy

### Backend
- Node.js application with containerization
- Database migrations for schema changes
- WebSocket server deployment
- Background job processing

### Frontend
- Expo build system for iOS and Android
- Web deployment for browser access
- OTA updates for quick fixes
- App store submission process

### Monitoring
- API performance monitoring
- Error tracking and logging
- User engagement analytics
- Payment processing monitoring

## Success Criteria

Each phase must meet these criteria before moving to the next:
- **Zero Critical Bugs**: No bugs that break core functionality
- **API Contract Compliance**: All endpoints match specifications exactly
- **Business Logic Validation**: All rules and restrictions work correctly
- **UI/UX Compliance**: All screens and flows work as specified
- **Performance Benchmarks**: Meet defined performance requirements

This architecture document serves as the single source of truth for the VibesMatch project, providing a comprehensive overview for all team members regardless of their specific role or focus area.