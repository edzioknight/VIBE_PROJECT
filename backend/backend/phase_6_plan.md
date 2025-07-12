# Backend Phase 6 Plan: Advanced Features, Search, and Boost

## Phase 6 Objectives
Implement advanced features, sophisticated search capabilities, and enhanced profile boost system for VibesMatch. This final phase focuses on advanced algorithms, personalization, and features that provide a competitive edge in the dating app market.

## Database Schema Updates

### Advanced Search Preferences Table
```sql
CREATE TABLE advanced_search_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  distance_min INT NOT NULL DEFAULT 0,
  distance_max INT NOT NULL DEFAULT 100,
  age_min INT NOT NULL DEFAULT 18,
  age_max INT NOT NULL DEFAULT 65,
  height_min INT NULL,
  height_max INT NULL,
  education_levels TEXT[] DEFAULT '{}',
  religions TEXT[] DEFAULT '{}',
  relationship_types TEXT[] DEFAULT '{}',
  has_children VARCHAR(50) NULL,
  wants_children VARCHAR(50) NULL,
  drinking_habits TEXT[] DEFAULT '{}',
  smoking_habits TEXT[] DEFAULT '{}',
  exercise_frequency TEXT[] DEFAULT '{}',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id),
  INDEX idx_user_id (user_id)
);
```

### User Search History Table
```sql
CREATE TABLE user_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_query JSONB NOT NULL,
  results_count INT NOT NULL,
  saved BOOLEAN DEFAULT FALSE,
  search_name VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_saved (saved)
);
```

### User Compatibility Table
```sql
CREATE TABLE user_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score DECIMAL(5,2) NOT NULL,
  compatibility_factors JSONB NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user1_id, user2_id),
  INDEX idx_user1_id (user1_id),
  INDEX idx_user2_id (user2_id),
  INDEX idx_compatibility_score (compatibility_score)
);
```

### Enhanced Boost Analytics Table
```sql
CREATE TABLE boost_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boost_id UUID NOT NULL REFERENCES profile_boosts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_impressions INT NOT NULL DEFAULT 0,
  profile_views INT NOT NULL DEFAULT 0,
  likes_received INT NOT NULL DEFAULT 0,
  super_likes_received INT NOT NULL DEFAULT 0,
  matches_created INT NOT NULL DEFAULT 0,
  conversations_started INT NOT NULL DEFAULT 0,
  roi_score DECIMAL(5,2) NULL,
  hourly_breakdown JSONB NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_boost_id (boost_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### Saved Searches Table
```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  search_query JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT FALSE,
  notification_frequency VARCHAR(20) DEFAULT 'daily' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly')),
  last_notified TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_notification_enabled (notification_enabled)
);
```

### User Recommendations Table
```sql
CREATE TABLE user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommended_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_score DECIMAL(5,2) NOT NULL,
  recommendation_factors JSONB NOT NULL,
  is_shown BOOLEAN DEFAULT FALSE,
  is_interacted BOOLEAN DEFAULT FALSE,
  interaction_type VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id, recommended_user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_recommended_user_id (recommended_user_id),
  INDEX idx_recommendation_score (recommendation_score),
  INDEX idx_is_shown (is_shown),
  INDEX idx_is_interacted (is_interacted)
);
```

## API Endpoints

### POST /api/v1/search/advanced
Perform advanced search with multiple criteria.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "distance": {
    "min": 0,
    "max": 50
  },
  "age": {
    "min": 25,
    "max": 35
  },
  "height": {
    "min": 165,
    "max": 185
  },
  "education_levels": ["bachelor", "master", "phd"],
  "religions": ["christian", "spiritual"],
  "relationship_types": ["serious", "casual"],
  "has_children": "no_children",
  "wants_children": "wants_someday",
  "drinking_habits": ["socially", "never"],
  "smoking_habits": ["never"],
  "exercise_frequency": ["regularly", "sometimes"],
  "interests": ["travel", "fitness", "cooking"],
  "limit": 20,
  "save_search": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Doe",
        "age": 28,
        "gender": "female",
        "profile_photos": ["https://storage.vibesmatch.com/photos/jane_1.jpg"],
        "distance": 12.5,
        "compatibility_score": 92.5,
        "matching_factors": ["interests", "education", "relationship_goals"],
        "is_online": true,
        "last_active": "2024-01-15T10:30:00Z",
        "has_liked_you": false,
        "has_super_liked_you": false
      }
    ],
    "total_count": 42,
    "search_id": "search-uuid-here"
  },
  "meta": {
    "pagination": {
      "cursor": "cursor-value-here",
      "hasMore": true
    }
  }
}
```

### GET /api/v1/search/history
Get user's search history.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Number of searches (default: 10, max: 50)
- `saved_only`: Only return saved searches (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "searches": [
      {
        "id": "search-uuid-1",
        "search_query": {
          "distance": {"min": 0, "max": 50},
          "age": {"min": 25, "max": 35}
        },
        "results_count": 42,
        "saved": true,
        "search_name": "My ideal match",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "cursor": "cursor-value-here",
      "hasMore": true
    }
  }
}
```

### POST /api/v1/search/save
Save a search for future use.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "search_id": "search-uuid-here",
  "name": "My ideal match",
  "notification_enabled": true,
  "notification_frequency": "weekly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Search saved successfully",
    "saved_search_id": "saved-search-uuid-here"
  }
}
```

### GET /api/v1/recommendations
Get personalized user recommendations.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Number of recommendations (default: 10, max: 50)
- `refresh`: Force refresh recommendations (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Doe",
        "age": 28,
        "gender": "female",
        "profile_photos": ["https://storage.vibesmatch.com/photos/jane_1.jpg"],
        "distance": 12.5,
        "compatibility_score": 92.5,
        "recommendation_reason": "You both love hiking and share similar values",
        "is_online": true,
        "last_active": "2024-01-15T10:30:00Z"
      }
    ],
    "refresh_available_in": 86400
  },
  "meta": {
    "pagination": {
      "cursor": "cursor-value-here",
      "hasMore": true
    }
  }
}
```

### GET /api/v1/boosts/analytics/{boost_id}
Get detailed analytics for a specific boost.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "boost": {
      "id": "boost-uuid-here",
      "boost_type": "discovery_boost",
      "started_at": "2024-01-15T10:00:00Z",
      "ended_at": "2024-01-15T10:30:00Z",
      "duration_minutes": 30
    },
    "analytics": {
      "total_impressions": 245,
      "profile_views": 78,
      "likes_received": 15,
      "super_likes_received": 3,
      "matches_created": 5,
      "conversations_started": 2,
      "roi_score": 8.7,
      "hourly_breakdown": [
        {
          "hour": "10:00-10:30",
          "impressions": 245,
          "profile_views": 78,
          "likes": 15
        }
      ],
      "comparison_to_normal": {
        "impressions_increase": "10.2x",
        "likes_increase": "8.5x",
        "matches_increase": "7.3x"
      }
    }
  }
}
```

### GET /api/v1/compatibility/{user_id}
Get compatibility details with another user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "compatibility_score": 92.5,
    "compatibility_factors": {
      "interests": {
        "score": 95,
        "matching_interests": ["hiking", "travel", "cooking"],
        "weight": 0.3
      },
      "values": {
        "score": 90,
        "matching_values": ["family_oriented", "ambitious"],
        "weight": 0.25
      },
      "lifestyle": {
        "score": 85,
        "matching_aspects": ["exercise_frequency", "drinking_habits"],
        "weight": 0.2
      },
      "goals": {
        "score": 100,
        "matching_goals": ["relationship_type", "wants_children"],
        "weight": 0.25
      }
    },
    "conversation_starters": [
      "You both love hiking in national parks!",
      "Ask about their recent trip to Italy"
    ]
  }
}
```

### POST /api/v1/discovery/filters
Update advanced discovery filters.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "distance": {
    "min": 0,
    "max": 50
  },
  "age": {
    "min": 25,
    "max": 35
  },
  "height": {
    "min": 165,
    "max": 185
  },
  "education_levels": ["bachelor", "master", "phd"],
  "religions": ["christian", "spiritual"],
  "relationship_types": ["serious", "casual"],
  "has_children": "no_children",
  "wants_children": "wants_someday",
  "drinking_habits": ["socially", "never"],
  "smoking_habits": ["never"],
  "exercise_frequency": ["regularly", "sometimes"],
  "interests": ["travel", "fitness", "cooking"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Discovery filters updated successfully",
    "estimated_matches": 156
  }
}
```

### GET /api/v1/analytics/profile
Get profile performance analytics.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `period`: Time period (default: 'week', options: 'day', 'week', 'month', 'all')

**Response:**
```json
{
  "success": true,
  "data": {
    "impressions": {
      "total": 1245,
      "change": "+15%",
      "breakdown": {
        "discovery": 980,
        "search": 265
      }
    },
    "profile_views": {
      "total": 320,
      "change": "+22%",
      "conversion_rate": "25.7%"
    },
    "likes": {
      "received": 85,
      "sent": 120,
      "conversion_rate": "6.8%"
    },
    "super_likes": {
      "received": 12,
      "sent": 8
    },
    "matches": {
      "total": 15,
      "from_likes": 10,
      "from_super_likes": 5
    },
    "conversations": {
      "started": 8,
      "response_rate": "53%"
    },
    "profile_strength": {
      "score": 85,
      "improvements": [
        "Add more photos",
        "Complete your bio"
      ]
    }
  }
}
```

### POST /api/v1/analytics/boost-recommendation
Get personalized boost time recommendation.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "boost_type": "discovery_boost"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommended_times": [
      {
        "day": "Sunday",
        "time": "20:00",
        "expected_impressions": 320,
        "expected_likes": 25,
        "confidence": "high"
      },
      {
        "day": "Wednesday",
        "time": "19:00",
        "expected_impressions": 280,
        "expected_likes": 22,
        "confidence": "medium"
      }
    ],
    "user_activity_peak": {
      "day": "Sunday",
      "time": "20:00-22:00"
    },
    "current_online_users": 1250,
    "current_recommendation": "Good time to boost"
  }
}
```

## Business Logic Rules

### Advanced Search Algorithm
1. **Weighted Criteria**: Different search criteria have different weights
2. **Compatibility Scoring**: Calculate match percentage based on multiple factors
3. **Performance Optimization**: Efficient search with large user base
4. **Premium Prioritization**: Premium users get more search criteria
5. **Search History**: Track and save search patterns for recommendations

### Recommendation Engine
1. **Multi-factor Analysis**: Consider interests, values, goals, behavior
2. **Activity-based Weighting**: More weight to active users
3. **Feedback Loop**: Learn from user interactions
4. **Diversity Injection**: Prevent recommendation bubbles
5. **Daily Refresh**: New recommendations daily with weekly major refresh

### Enhanced Boost System
1. **Time Optimization**: Recommend optimal boost times based on user activity
2. **ROI Calculation**: Track and display boost effectiveness
3. **Targeting Improvement**: Better targeting based on user preferences
4. **Analytics Dashboard**: Comprehensive boost performance metrics
5. **Automatic Scheduling**: Schedule boosts for optimal times

### Compatibility Algorithm
1. **Interest Matching**: Weighted interest compatibility
2. **Value Alignment**: Core values and lifestyle compatibility
3. **Communication Style**: Messaging patterns and engagement
4. **Relationship Goals**: Long-term compatibility factors
5. **Activity Compatibility**: Shared activities and hobbies

## Services Implementation

### AdvancedSearchService
```typescript
class AdvancedSearchService {
  async performAdvancedSearch(userId: string, criteria: SearchCriteria): Promise<SearchResults>
  async saveSearch(userId: string, searchId: string, name: string, notificationSettings?: NotificationSettings): Promise<SavedSearch>
  async getUserSearchHistory(userId: string, limit: number, savedOnly?: boolean): Promise<SearchHistory[]>
  async deleteSavedSearch(userId: string, savedSearchId: string): Promise<void>
  async getSearchById(searchId: string): Promise<SearchResults>
  async processNotificationsForSavedSearches(): Promise<void>
  private async buildSearchQuery(criteria: SearchCriteria): Promise<QueryBuilder>
  private async calculateRelevanceScores(userId: string, results: User[]): Promise<ScoredResults>
}
```

### RecommendationService
```typescript
class RecommendationService {
  async generateRecommendations(userId: string, limit: number, refresh?: boolean): Promise<Recommendation[]>
  async markRecommendationShown(userId: string, recommendedUserId: string): Promise<void>
  async recordRecommendationInteraction(userId: string, recommendedUserId: string, interactionType: string): Promise<void>
  async getRecommendationFactors(userId: string, recommendedUserId: string): Promise<RecommendationFactors>
  async refreshAllRecommendations(): Promise<void>
  private async calculateRecommendationScore(userId: string, candidateId: string): Promise<number>
  private async analyzeUserPreferences(userId: string): Promise<UserPreferences>
}
```

### CompatibilityService
```typescript
class CompatibilityService {
  async calculateCompatibility(user1Id: string, user2Id: string): Promise<CompatibilityResult>
  async getCompatibilityDetails(userId: string, otherUserId: string): Promise<CompatibilityDetails>
  async generateConversationStarters(userId: string, otherUserId: string): Promise<string[]>
  async batchCalculateCompatibility(userId: string, candidateIds: string[]): Promise<Record<string, number>>
  async updateCompatibilityScores(userId: string): Promise<void>
  private async calculateInterestCompatibility(user1Interests: string[], user2Interests: string[]): Promise<number>
  private async calculateValueCompatibility(user1: User, user2: User): Promise<number>
}
```

### EnhancedBoostService
```typescript
class EnhancedBoostService {
  async getBoostAnalytics(boostId: string): Promise<BoostAnalytics>
  async getBoostRecommendation(userId: string, boostType: string): Promise<BoostRecommendation>
  async scheduleBoost(userId: string, boostType: string, scheduledTime: Date): Promise<ScheduledBoost>
  async calculateBoostROI(boostId: string): Promise<number>
  async compareBoostPerformance(userId: string, boostId: string): Promise<BoostComparison>
  async trackBoostImpression(boostId: string): Promise<void>
  async trackBoostInteraction(boostId: string, interactionType: string): Promise<void>
  private async analyzeUserActivityPatterns(userId: string): Promise<ActivityPattern>
  private async getPlatformActivityPeaks(): Promise<ActivityPeaks>
}
```

### ProfileAnalyticsService
```typescript
class ProfileAnalyticsService {
  async getProfilePerformance(userId: string, period: string): Promise<ProfilePerformance>
  async getProfileStrengthScore(userId: string): Promise<ProfileStrength>
  async getProfileImprovementSuggestions(userId: string): Promise<Suggestion[]>
  async trackProfileImpression(userId: string, viewerId: string, source: string): Promise<void>
  async trackProfileInteraction(userId: string, viewerId: string, interactionType: string): Promise<void>
  async getConversionFunnelAnalytics(userId: string): Promise<ConversionFunnel>
  private async analyzePhotoEffectiveness(userId: string): Promise<PhotoAnalytics>
  private async analyzeProfileCompleteness(userId: string): Promise<CompletenessScore>
}
```

## Rate Limiting

### Advanced Search Endpoints
- POST /search/advanced: 20 requests per hour (free), 100 per hour (premium)
- GET /search/history: 60 requests per hour
- POST /search/save: 20 requests per day

### Recommendation Endpoints
- GET /recommendations: 60 requests per hour
- POST /recommendations/feedback: 100 requests per hour

### Analytics Endpoints
- GET /analytics/profile: 60 requests per hour
- POST /analytics/boost-recommendation: 20 requests per hour

## Error Handling

### Error Codes
- `SEARCH_CRITERIA_INVALID`: Invalid search parameters
- `SEARCH_LIMIT_EXCEEDED`: Too many search requests
- `SEARCH_NOT_FOUND`: Search ID not found
- `RECOMMENDATION_REFRESH_LIMIT`: Recommendation refresh limit reached
- `BOOST_ANALYTICS_UNAVAILABLE`: Boost analytics not available
- `COMPATIBILITY_CALCULATION_FAILED`: Failed to calculate compatibility
- `PREMIUM_FEATURE_REQUIRED`: Feature requires premium subscription

## File Structure
```
src/
├── controllers/
│   ├── search.controller.ts (NEW)
│   ├── recommendation.controller.ts (NEW)
│   ├── compatibility.controller.ts (NEW)
│   ├── analytics.controller.ts (NEW)
│   └── boost.controller.ts (UPDATED)
├── services/
│   ├── advancedSearch.service.ts (NEW)
│   ├── recommendation.service.ts (NEW)
│   ├── compatibility.service.ts (NEW)
│   ├── profileAnalytics.service.ts (NEW)
│   └── enhancedBoost.service.ts (UPDATED)
├── middleware/
│   ├── search.middleware.ts (NEW)
│   └── analytics.middleware.ts (NEW)
├── models/
│   └── schema.prisma (UPDATED)
├── routes/
│   ├── search.routes.ts (NEW)
│   ├── recommendation.routes.ts (NEW)
│   ├── compatibility.routes.ts (NEW)
│   └── analytics.routes.ts (NEW)
├── jobs/
│   ├── recommendationGenerator.job.ts (NEW)
│   ├── compatibilityCalculator.job.ts (NEW)
│   └── analyticsProcessor.job.ts (NEW)
├── types/
│   ├── search.types.ts (NEW)
│   ├── recommendation.types.ts (NEW)
│   ├── compatibility.types.ts (NEW)
│   └── analytics.types.ts (NEW)
└── utils/
    ├── search.util.ts (NEW)
    ├── recommendation.util.ts (NEW)
    ├── compatibility.util.ts (NEW)
    └── analytics.util.ts (NEW)
```

## Testing Requirements
- Unit tests for all search and recommendation algorithms
- Integration tests for advanced search functionality
- Performance tests for search with large user base
- Compatibility algorithm accuracy testing
- Boost analytics calculation testing
- Recommendation quality assessment
- Search filter effectiveness testing

## Security Measures
- Search query validation and sanitization
- Rate limiting for resource-intensive operations
- User data privacy in search results
- Analytics data anonymization
- Recommendation algorithm fairness
- Premium feature access control
- Search history privacy protection

## Performance Considerations
- Search query optimization for large user base
- Recommendation pre-calculation and caching
- Compatibility score caching and batch updates
- Analytics data aggregation and summarization
- Database indexing for search performance
- Background processing for intensive calculations
- Real-time vs. batch processing balance

## Monitoring and Analytics
- Search performance and usage patterns
- Recommendation effectiveness and conversion
- Boost ROI and performance metrics
- User engagement with advanced features
- Compatibility algorithm accuracy
- Feature usage by user segment
- Premium vs. free user behavior