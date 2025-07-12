# Backend Phase 2 Plan: Discovery, Likes, and Basic Matching

## Phase 2 Objectives
Build the core discovery system and basic matching functionality for VibesMatch. This phase covers profile discovery feed, like/dislike actions, and initial match creation logic.

## Database Schema Updates

### User Actions Table
```sql
CREATE TABLE user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('like', 'dislike', 'super_like', 'message_request')),
  message TEXT NULL, -- For super likes with messages
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (actor_id, target_id), -- One action per user pair
  INDEX idx_actor_id (actor_id),
  INDEX idx_target_id (target_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
);
```

### Matches Table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unmatched', 'blocked')),
  match_type VARCHAR(20) NOT NULL DEFAULT 'mutual_like' CHECK (match_type IN ('mutual_like', 'message_accepted', 'message_replied')),
  
  UNIQUE (user1_id, user2_id),
  INDEX idx_user1_id (user1_id),
  INDEX idx_user2_id (user2_id),
  INDEX idx_matched_at (matched_at),
  INDEX idx_status (status)
);
```

### User Profile Views Table
```sql
CREATE TABLE user_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (viewer_id, viewed_id),
  INDEX idx_viewer_id (viewer_id),
  INDEX idx_viewed_id (viewed_id),
  INDEX idx_viewed_at (viewed_at)
);
```

## API Endpoints

### GET /api/v1/discovery/profiles
Fetch user profiles for discovery feed.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Number of profiles (default: 10, max: 50)
- `cursor`: Pagination cursor (last profile ID)

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Doe",
        "age": 28,
        "gender": "female",
        "country": "United States",
        "profile_photos": [
          "https://storage.vibesmatch.com/photos/jane_1.jpg",
          "https://storage.vibesmatch.com/photos/jane_2.jpg"
        ],
        "bio": "Love hiking and good coffee ☕",
        "interests": ["travel", "music", "fitness"],
        "sexuality": "straight",
        "mbti": "ENFP",
        "exercise": "regularly",
        "education": "bachelor",
        "job": "marketing_manager",
        "drinking": "socially",
        "smoking": "never",
        "kids": "want_someday",
        "ethnicity": "mixed",
        "religion": "christian",
        "relationship_type": "serious",
        "current_status": "single",
        "looking_for": "dating",
        "preferences": ["long_term", "exclusive"],
        "is_online": true,
        "last_active": "2024-01-15T10:30:00Z",
        "distance": 5.2
      }
    ]
  },
  "meta": {
    "pagination": {
      "cursor": "550e8400-e29b-41d4-a716-446655440001",
      "hasMore": true,
      "total": 150
    }
  }
}
```

**Business Logic:**
- Exclude users already interacted with (liked, disliked, super liked)
- Exclude blocked users
- Exclude users who blocked current user
- Sort by: online status (online first), then last_active (recent first)
- Apply basic age and gender preferences
- Calculate distance from user's location

### POST /api/v1/discovery/action
Record user action (like/dislike) on target profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "target_id": "550e8400-e29b-41d4-a716-446655440001",
  "action_type": "like"
}
```

**Response (Success - No Match):**
```json
{
  "success": true,
  "data": {
    "message": "Action recorded successfully",
    "action_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "match_found": false
  }
}
```

**Response (Success - Match Created):**
```json
{
  "success": true,
  "data": {
    "message": "It's a match!",
    "action_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "match_found": true,
    "match": {
      "id": "match-uuid-here",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Doe",
        "profile_photos": ["https://storage.vibesmatch.com/photos/jane_1.jpg"]
      },
      "matched_at": "2024-01-15T10:35:00Z"
    }
  }
}
```

**Business Logic:**
- Record action in user_actions table
- For likes: Check if target has liked actor back
- If mutual like exists: Create match in matches table
- Update user's last_active timestamp
- Enforce free user like limits (20 per 12 hours)

### GET /api/v1/discovery/stats
Get discovery statistics for current user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "likes_remaining": 15,
    "likes_reset_at": "2024-01-15T22:00:00Z",
    "total_likes_sent": 45,
    "total_matches": 8,
    "profiles_viewed_today": 23
  }
}
```

### GET /api/v1/users/{user_id}/profile
Get detailed profile for specific user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Doe",
      "age": 28,
      "gender": "female",
      "country": "United States",
      "profile_photos": [
        "https://storage.vibesmatch.com/photos/jane_1.jpg",
        "https://storage.vibesmatch.com/photos/jane_2.jpg",
        "https://storage.vibesmatch.com/photos/jane_3.jpg"
      ],
      "bio": "Love hiking and good coffee ☕",
      "interests": ["travel", "music", "fitness", "cooking", "reading"],
      "sexuality": "straight",
      "mbti": "ENFP",
      "exercise": "regularly",
      "education": "bachelor",
      "job": "marketing_manager",
      "drinking": "socially",
      "smoking": "never",
      "kids": "want_someday",
      "ethnicity": "mixed",
      "religion": "christian",
      "relationship_type": "serious",
      "current_status": "single",
      "looking_for": "dating",
      "preferences": ["long_term", "exclusive"],
      "is_online": true,
      "last_active": "2024-01-15T10:30:00Z",
      "distance": 5.2
    },
    "interaction_status": {
      "has_liked": false,
      "has_super_liked": false,
      "has_messaged": false,
      "is_matched": false,
      "can_message": true
    }
  }
}
```

**Business Logic:**
- Record profile view in user_profile_views table
- Return interaction status for UI state management
- Check if users are matched
- Determine available actions based on user status

## Business Logic Rules

### Discovery Algorithm
1. **Exclusion Rules:**
   - Users already interacted with (any action type)
   - Blocked users (both directions)
   - Users outside age preferences (basic filtering)
   - Users outside gender preferences

2. **Sorting Priority:**
   - Online users first (is_online = true)
   - Then by last_active (most recent first)
   - Then by profile completeness score
   - Then by join date (newer first)

3. **Batch Size:**
   - Default: 10 profiles
   - Maximum: 50 profiles
   - Minimum: 1 profile

### Like System Rules
1. **Free User Limits:**
   - 20 likes per 12-hour period
   - Counter resets every 12 hours from first like
   - Super likes don't count toward limit
   - Display remaining likes in UI

2. **Action Recording:**
   - One action per user pair (upsert behavior)
   - Changing from dislike to like is allowed
   - Changing from like to dislike is allowed
   - Track action history for analytics

### Match Creation Rules
1. **Mutual Like Match:**
   - User A likes User B
   - User B likes User A back
   - Match created immediately

2. **Match Data:**
   - Store both user IDs (smaller ID as user1_id)
   - Record match timestamp
   - Set initial status as 'active'
   - Set match_type as 'mutual_like'

## Services Implementation

### DiscoveryService
```typescript
class DiscoveryService {
  async getDiscoveryProfiles(userId: string, limit: number, cursor?: string): Promise<Profile[]>
  async recordUserAction(actorId: string, targetId: string, actionType: string): Promise<ActionResult>
  async checkForMatch(actorId: string, targetId: string): Promise<Match | null>
  async getDiscoveryStats(userId: string): Promise<DiscoveryStats>
  async getUserProfile(userId: string, viewerId: string): Promise<DetailedProfile>
  private async applyDiscoveryFilters(userId: string): Promise<QueryBuilder>
  private async calculateDistance(user1: User, user2: User): Promise<number>
}
```

### MatchService
```typescript
class MatchService {
  async createMatch(user1Id: string, user2Id: string, matchType: string): Promise<Match>
  async getUserMatches(userId: string): Promise<Match[]>
  async getMatchById(matchId: string): Promise<Match>
  async updateMatchStatus(matchId: string, status: string): Promise<Match>
}
```

## Rate Limiting

### Discovery Endpoints
- GET /discovery/profiles: 60 requests per minute
- POST /discovery/action: 30 requests per minute
- GET /discovery/stats: 20 requests per minute
- GET /users/{id}/profile: 100 requests per minute

### Like Limits (Business Logic)
- Free users: 20 likes per 12 hours
- Premium users: Unlimited likes
- Track in Redis with sliding window

## Error Handling

### Error Codes
- `LIKE_LIMIT_EXCEEDED`: Free user hit 20 like limit
- `ALREADY_INTERACTED`: User already performed action on target
- `USER_NOT_FOUND`: Target user doesn't exist
- `SELF_ACTION_NOT_ALLOWED`: User trying to like themselves
- `USER_BLOCKED`: Target user has blocked current user
- `INVALID_ACTION_TYPE`: Invalid action type provided

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "LIKE_LIMIT_EXCEEDED",
    "message": "You've reached your daily like limit. Upgrade to Premium for unlimited likes.",
    "details": {
      "likes_remaining": 0,
      "reset_at": "2024-01-15T22:00:00Z"
    }
  }
}
```

## File Structure
```
src/
├── controllers/
│   ├── discovery.controller.ts (NEW)
│   └── profile.controller.ts (UPDATED)
├── services/
│   ├── discovery.service.ts (NEW)
│   ├── match.service.ts (NEW)
│   └── user.service.ts (UPDATED)
├── middleware/
│   ├── discovery.middleware.ts (NEW)
│   └── rateLimit.middleware.ts (UPDATED)
├── models/
│   └── schema.prisma (UPDATED)
├── routes/
│   ├── discovery.routes.ts (NEW)
│   └── user.routes.ts (UPDATED)
├── types/
│   ├── discovery.types.ts (NEW)
│   └── match.types.ts (NEW)
└── utils/
    ├── distance.util.ts (NEW)
    └── discovery.util.ts (NEW)
```

## Testing Requirements
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Like limit enforcement tests
- Match creation logic tests
- Discovery algorithm tests
- Performance tests for profile fetching
- Rate limiting tests

## Performance Considerations
- Index all foreign keys and frequently queried fields
- Use database query optimization for discovery feed
- Implement Redis caching for frequently accessed profiles
- Use connection pooling for database connections
- Optimize image URLs for fast loading

## Security Measures
- Validate all user inputs
- Prevent users from liking themselves
- Check user permissions for all actions
- Implement proper rate limiting
- Sanitize all text inputs
- Validate image URLs before serving

## Monitoring and Analytics
- Track discovery feed performance
- Monitor like/match conversion rates
- Track user engagement metrics
- Monitor API response times
- Alert on error rate spikes
- Track free vs premium user behavior