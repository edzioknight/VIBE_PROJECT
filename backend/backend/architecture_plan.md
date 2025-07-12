# VibesMatch Backend Architecture Plan

## Team Identity
**You are the Backend Team.** You will build the complete server-side architecture for VibesMatch dating app using Node.js + TypeScript + Express. You will follow instructions in this architecture_plan.md and each phase_x_plan.md exactly. Do not assume anything. Do not communicate with other teams. If anything is unclear, ask the uploader only.

## Tech Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.io
- **File Storage**: AWS S3 (or compatible)
- **Redis**: Session management & rate limiting
- **Validation**: Zod
- **API Documentation**: OpenAPI/Swagger

## Project Structure
```
src/
├── controllers/          # Route handlers
├── middleware/          # Auth, validation, rate limiting
├── models/             # Database models (Prisma)
├── services/           # Business logic
├── utils/              # Helper functions
├── routes/             # API route definitions
├── sockets/            # WebSocket handlers
├── types/              # TypeScript interfaces
├── config/             # Configuration files
├── migrations/         # Database migrations
└── tests/              # Test files
```

## Database Schema Overview
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

## API Architecture
- **Base URL**: `/api/v1`
- **Authentication**: Bearer JWT tokens
- **Session Management**: Comprehensive session tracking and control
- **Rate Limiting**: Redis-based per endpoint
- **Validation**: Zod schemas on all inputs
- **Error Handling**: Consistent error response format
- **Pagination**: Cursor-based pagination. The `cursor` will be a Base64 encoded JSON string containing the `id` and `created_at` timestamp of the last item in the previous page (e.g., `cursor: base64(JSON.stringify({ id: 'last_item_id', createdAt: 'last_item_timestamp' }))`)
- **File Uploads**: Multipart form data

## Authentication Flow
1. **Sign Up**: Email/Google → OTP verification → Multi-step profile creation
2. **Sign In**: Email/Google → JWT access token + refresh token
3. **Token Refresh**: Automatic token renewal with validation
4. **Session Management**: Active session tracking with multi-device logout capability
5. **User Verification**: Email existence check before OTP
6. **Onboarding Status**: Verification of onboarding completion

## Real-time Features
- **WebSocket Connection**: Authenticated socket connections
- **Message Delivery**: Real-time chat messages
- **Activity Status**: Online/offline status
- **Push Notifications**: Integration ready

## Security Measures
- **Input Validation**: All endpoints validated
- **Rate Limiting**: Per-user and per-IP limits
- **Session Control**: Comprehensive session management
- **SQL Injection Protection**: Prisma ORM
- **CORS**: Properly configured
- **Helmet**: Security headers
- **Data Sanitization**: XSS protection

## Business Logic Rules
- **Free Users**: 20 likes per 12 hours, no direct messages
- **Premium Users**: Unlimited likes, direct messages, read receipts
- **Super Likes**: Consumable purchases, bypass message restrictions
- **Discovery**: Activity-based ranking, filter compliance
- **Matching**: Only on message acceptance or reply

## Error Response Format
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

## Success Response Format
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

## HTTP Status Code to Error Code Mapping

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

## Phase Breakdown
- **Phase 1**: Authentication, User Management, Basic Profile
  - Complete user authentication with OTP
  - Multi-step onboarding flow
  - Session management with multi-device control
  - User existence verification
  - Onboarding status tracking
- **Phase 2**: Discovery, Likes, Basic Matching
- **Phase 3**: Messaging, Requests, Chat System
- **Phase 4**: Premium Features, Super Likes, Subscriptions
- **Phase 5**: Real-time Features, Push Notifications
- **Phase 6**: Advanced Features, Search, Boost

## Cross-Team Contracts
- **Frontend**: Will consume exact API endpoints and response formats defined here
- **QA**: Will test against exact API contracts and business rules defined here
- **No Mocking**: All endpoints must be fully functional, no placeholder responses