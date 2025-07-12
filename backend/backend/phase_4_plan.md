# Backend Phase 4 Plan: Premium Features, Super Likes, and Subscriptions

## Phase 4 Objectives
Build the complete monetization system for VibesMatch, including premium subscriptions, super likes, profile boosts, and enhanced features for paying users. This phase introduces the revenue generation capabilities that make the app financially sustainable.

## Database Schema Updates

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('premium_monthly', 'premium_yearly', 'premium_lifetime')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'apple', 'google')),
  provider_subscription_id VARCHAR(255) NOT NULL,
  provider_customer_id VARCHAR(255) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP NULL,
  trial_start TIMESTAMP NULL,
  trial_end TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (provider_subscription_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_current_period_end (current_period_end),
  INDEX idx_provider_subscription_id (provider_subscription_id)
);
```

### Super Likes Table
```sql
CREATE TABLE super_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NULL, -- Optional message with super like
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'expired', 'declined')),
  is_priority BOOLEAN DEFAULT TRUE, -- Shows in priority queue
  expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id, target_id),
  INDEX idx_user_id (user_id),
  INDEX idx_target_id (target_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_priority (is_priority)
);
```

### Super Like Purchases Table
```sql
CREATE TABLE super_like_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('single', 'pack_5', 'pack_15', 'pack_30')),
  quantity INT NOT NULL,
  price_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'apple', 'google')),
  provider_transaction_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_provider_transaction_id (provider_transaction_id)
);
```

### Profile Boosts Table
```sql
CREATE TABLE profile_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  boost_type VARCHAR(20) NOT NULL CHECK (boost_type IN ('discovery_boost', 'super_boost')),
  duration_minutes INT NOT NULL, -- 30 minutes or 180 minutes
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  views_gained INT DEFAULT 0,
  likes_gained INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_active (is_active),
  INDEX idx_boost_type (boost_type)
);
```

### User Premium Features Table
```sql
CREATE TABLE user_premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_name VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  usage_limit INT NULL, -- NULL for unlimited
  reset_period VARCHAR(20) NULL CHECK (reset_period IN ('daily', 'weekly', 'monthly')),
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id, feature_name),
  INDEX idx_user_id (user_id),
  INDEX idx_feature_name (feature_name)
);
```

### Payment Transactions Table
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('subscription', 'super_likes', 'boost', 'refund')),
  amount_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'apple', 'google')),
  provider_transaction_id VARCHAR(255) NOT NULL,
  provider_customer_id VARCHAR(255) NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_status (status),
  INDEX idx_provider_transaction_id (provider_transaction_id),
  INDEX idx_created_at (created_at)
);
```

## API Endpoints

### GET /api/v1/premium/plans
Get available subscription plans and pricing.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "premium_monthly",
        "name": "Premium Monthly",
        "description": "All premium features for one month",
        "price_cents": 1999,
        "currency": "USD",
        "billing_period": "monthly",
        "features": [
          "unlimited_likes",
          "see_who_liked_you",
          "read_receipts",
          "advanced_filters",
          "rewind_last_swipe",
          "5_super_likes_monthly",
          "1_boost_monthly",
          "priority_support"
        ],
        "trial_days": 7
      },
      {
        "id": "premium_yearly",
        "name": "Premium Yearly",
        "description": "All premium features for one year",
        "price_cents": 19999,
        "currency": "USD",
        "billing_period": "yearly",
        "discount_percentage": 17,
        "features": [
          "unlimited_likes",
          "see_who_liked_you",
          "read_receipts",
          "advanced_filters",
          "rewind_last_swipe",
          "5_super_likes_monthly",
          "1_boost_monthly",
          "priority_support"
        ],
        "trial_days": 7
      }
    ]
  }
}
```

### POST /api/v1/premium/subscribe
Create a subscription for the user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "plan_id": "premium_monthly",
  "payment_method_id": "pm_1234567890",
  "provider": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_1234567890",
    "client_secret": "pi_1234567890_secret_abc123",
    "status": "active",
    "current_period_start": "2024-01-15T10:00:00Z",
    "current_period_end": "2024-02-15T10:00:00Z",
    "trial_end": "2024-01-22T10:00:00Z"
  }
}
```

### POST /api/v1/premium/cancel
Cancel user's subscription.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "cancel_at_period_end": true,
  "reason": "too_expensive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Subscription will be cancelled at the end of current period",
    "cancellation_date": "2024-02-15T10:00:00Z",
    "access_until": "2024-02-15T10:00:00Z"
  }
}
```

### GET /api/v1/premium/status
Get user's current premium status and features.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_premium": true,
    "subscription": {
      "id": "sub_1234567890",
      "plan_type": "premium_monthly",
      "status": "active",
      "current_period_end": "2024-02-15T10:00:00Z",
      "cancel_at_period_end": false,
      "trial_end": null
    },
    "features": {
      "unlimited_likes": true,
      "see_who_liked_you": true,
      "read_receipts": true,
      "advanced_filters": true,
      "rewind_last_swipe": true,
      "super_likes_remaining": 3,
      "boosts_remaining": 1,
      "priority_support": true
    },
    "usage": {
      "super_likes_used_this_month": 2,
      "boosts_used_this_month": 0,
      "likes_today": 45
    }
  }
}
```

### POST /api/v1/super-likes/send
Send a super like to another user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "target_id": "550e8400-e29b-41d4-a716-446655440001",
  "message": "I love your hiking photos! Would love to chat about your adventures."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "super_like_id": "sl_1234567890",
    "message": "Super Like sent successfully",
    "target_user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Doe",
      "profile_photos": ["https://storage.vibesmatch.com/photos/jane_1.jpg"]
    },
    "expires_at": "2024-02-15T10:00:00Z"
  }
}
```

### GET /api/v1/super-likes/received
Get super likes received by the user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status`: 'pending', 'matched', 'expired', 'declined' (default: 'pending')
- `limit`: Number of super likes (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "super_likes": [
      {
        "id": "sl_1234567890",
        "sender": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "John Smith",
          "age": 29,
          "profile_photos": ["https://storage.vibesmatch.com/photos/john_1.jpg"],
          "bio": "Adventure seeker and coffee enthusiast",
          "interests": ["hiking", "photography", "travel"]
        },
        "message": "I love your hiking photos! Would love to chat about your adventures.",
        "status": "pending",
        "created_at": "2024-01-15T10:00:00Z",
        "expires_at": "2024-02-15T10:00:00Z"
      }
    ]
  }
}
```

### POST /api/v1/super-likes/{super_like_id}/respond
Respond to a received super like.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "action": "like" // or "pass"
}
```

**Response (Like Back):**
```json
{
  "success": true,
  "data": {
    "message": "It's a Super Match!",
    "match_created": true,
    "match_id": "match_1234567890",
    "conversation_id": "conv_1234567890"
  }
}
```

### POST /api/v1/super-likes/purchase
Purchase super likes package.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "package_type": "pack_5",
  "payment_method_id": "pm_1234567890",
  "provider": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchase_id": "slp_1234567890",
    "package_type": "pack_5",
    "quantity": 5,
    "amount_paid_cents": 999,
    "super_likes_balance": 8,
    "transaction_id": "txn_1234567890"
  }
}
```

### POST /api/v1/boosts/activate
Activate a profile boost.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "boost_type": "discovery_boost" // or "super_boost"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "boost_id": "boost_1234567890",
    "boost_type": "discovery_boost",
    "duration_minutes": 30,
    "started_at": "2024-01-15T10:00:00Z",
    "expires_at": "2024-01-15T10:30:00Z",
    "estimated_extra_views": "10x more profile views"
  }
}
```

### GET /api/v1/boosts/status
Get current boost status.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "active_boost": {
      "id": "boost_1234567890",
      "boost_type": "discovery_boost",
      "expires_at": "2024-01-15T10:30:00Z",
      "time_remaining_minutes": 15,
      "views_gained": 45,
      "likes_gained": 8
    },
    "available_boosts": {
      "discovery_boost": 1,
      "super_boost": 0
    }
  }
}
```

### GET /api/v1/premium/who-liked-me
Get users who liked the current user (Premium feature).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Number of profiles (default: 20, max: 50)
- `cursor`: Pagination cursor

**Response:**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Doe",
        "age": 28,
        "profile_photos": ["https://storage.vibesmatch.com/photos/jane_1.jpg"],
        "bio": "Love hiking and good coffee",
        "interests": ["travel", "music", "fitness"],
        "liked_at": "2024-01-15T09:30:00Z",
        "is_super_like": false
      }
    ],
    "total_count": 15,
    "super_likes_count": 3
  },
  "meta": {
    "pagination": {
      "cursor": "like_cursor_here",
      "hasMore": true
    }
  }
}
```

### POST /api/v1/discovery/rewind
Rewind last swipe action (Premium feature).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Last action rewound successfully",
    "restored_profile": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Doe",
      "profile_photos": ["https://storage.vibesmatch.com/photos/jane_1.jpg"]
    },
    "rewinds_remaining_today": 2
  }
}
```

## Business Logic Rules

### Subscription Management
1. **Free Trial**: 7-day free trial for new Premium subscribers
2. **Billing Cycles**: Monthly ($19.99) or Yearly ($199.99, 17% discount)
3. **Cancellation**: Cancel anytime, access until period end
4. **Downgrade**: Lose premium features immediately on cancellation
5. **Upgrade**: Immediate access to all premium features

### Super Likes System
1. **Premium Allocation**: 5 super likes per month for Premium users
2. **Purchase Packages**: Single ($2.99), 5-pack ($9.99), 15-pack ($24.99), 30-pack ($39.99)
3. **Expiration**: Super likes expire after 30 days if not responded to
4. **Priority Display**: Super likes appear first in recipient's discovery feed
5. **Message Limit**: 280 characters for super like messages
6. **Match Creation**: Instant match if recipient likes back

### Profile Boost System
1. **Discovery Boost**: 30 minutes, 10x more profile views ($4.99)
2. **Super Boost**: 3 hours, 100x more profile views ($9.99)
3. **Premium Allocation**: 1 boost per month for Premium users
4. **Cooldown**: 24-hour cooldown between boosts
5. **Analytics**: Track views and likes gained during boost

### Premium Features
1. **Unlimited Likes**: No daily like limit
2. **See Who Liked You**: View all users who liked your profile
3. **Read Receipts**: See when messages are read
4. **Advanced Filters**: Age, distance, education, lifestyle filters
5. **Rewind**: Undo last 3 swipe actions per day
6. **Priority Support**: Faster customer support response

### Free User Restrictions
1. **Like Limit**: 20 likes per 12 hours
2. **No Read Receipts**: Cannot see message read status
3. **Basic Filters**: Only age and distance filters
4. **No Rewind**: Cannot undo swipe actions
5. **Message Requests**: Must send requests, cannot direct message

## Services Implementation

### SubscriptionService
```typescript
class SubscriptionService {
  async createSubscription(userId: string, planId: string, paymentMethodId: string): Promise<Subscription>
  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean): Promise<void>
  async updateSubscription(userId: string, newPlanId: string): Promise<Subscription>
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>
  async handleWebhook(provider: string, event: any): Promise<void>
  async syncSubscriptionStatus(userId: string): Promise<void>
}
```

### SuperLikeService
```typescript
class SuperLikeService {
  async sendSuperLike(senderId: string, targetId: string, message?: string): Promise<SuperLike>
  async respondToSuperLike(superLikeId: string, action: 'like' | 'pass', userId: string): Promise<SuperLikeResponse>
  async getReceivedSuperLikes(userId: string, status?: string): Promise<SuperLike[]>
  async purchaseSuperLikes(userId: string, packageType: string, paymentMethodId: string): Promise<Purchase>
  async getSuperLikeBalance(userId: string): Promise<number>
  async expireSuperLikes(): Promise<void>
}
```

### BoostService
```typescript
class BoostService {
  async activateBoost(userId: string, boostType: string): Promise<Boost>
  async getBoostStatus(userId: string): Promise<BoostStatus>
  async purchaseBoost(userId: string, boostType: string, paymentMethodId: string): Promise<Purchase>
  async getBoostAnalytics(boostId: string): Promise<BoostAnalytics>
  async deactivateExpiredBoosts(): Promise<void>
}
```

### PremiumService
```typescript
class PremiumService {
  async getUserPremiumStatus(userId: string): Promise<PremiumStatus>
  async enablePremiumFeatures(userId: string): Promise<void>
  async disablePremiumFeatures(userId: string): Promise<void>
  async getWhoLikedMe(userId: string, limit: number, cursor?: string): Promise<Profile[]>
  async rewindLastAction(userId: string): Promise<RewindResult>
  async updateFeatureUsage(userId: string, featureName: string): Promise<void>
}
```

### PaymentService
```typescript
class PaymentService {
  async processPayment(userId: string, amount: number, paymentMethodId: string, type: string): Promise<Transaction>
  async refundPayment(transactionId: string, reason: string): Promise<Refund>
  async getPaymentHistory(userId: string): Promise<Transaction[]>
  async handleStripeWebhook(event: any): Promise<void>
  async handleAppleWebhook(event: any): Promise<void>
  async handleGoogleWebhook(event: any): Promise<void>
}
```

## Rate Limiting

### Premium Endpoints
- GET /premium/plans: 10 requests per minute
- POST /premium/subscribe: 3 requests per hour per user
- POST /premium/cancel: 2 requests per hour per user
- GET /premium/status: 60 requests per minute per user

### Super Like Endpoints
- POST /super-likes/send: 10 requests per hour per user
- GET /super-likes/received: 60 requests per minute per user
- POST /super-likes/respond: 20 requests per hour per user
- POST /super-likes/purchase: 5 requests per hour per user

### Boost Endpoints
- POST /boosts/activate: 5 requests per day per user
- GET /boosts/status: 60 requests per minute per user

## Error Handling

### Error Codes
- `SUBSCRIPTION_NOT_FOUND`: User has no active subscription
- `PAYMENT_FAILED`: Payment processing failed
- `INSUFFICIENT_SUPER_LIKES`: User has no super likes remaining
- `SUPER_LIKE_ALREADY_SENT`: User already sent super like to target
- `BOOST_COOLDOWN_ACTIVE`: User must wait before next boost
- `PREMIUM_FEATURE_REQUIRED`: Feature requires premium subscription
- `INVALID_PAYMENT_METHOD`: Payment method is invalid or expired
- `SUBSCRIPTION_CANCELLED`: Subscription is cancelled or expired

## File Structure
```
src/
├── controllers/
│   ├── subscription.controller.ts (NEW)
│   ├── superlike.controller.ts (NEW)
│   ├── boost.controller.ts (NEW)
│   └── premium.controller.ts (NEW)
├── services/
│   ├── subscription.service.ts (NEW)
│   ├── superlike.service.ts (NEW)
│   ├── boost.service.ts (NEW)
│   ├── premium.service.ts (NEW)
│   └── payment.service.ts (NEW)
├── middleware/
│   ├── premium.middleware.ts (NEW)
│   └── payment.middleware.ts (NEW)
├── models/
│   └── schema.prisma (UPDATED)
├── routes/
│   ├── subscription.routes.ts (NEW)
│   ├── superlike.routes.ts (NEW)
│   ├── boost.routes.ts (NEW)
│   └── premium.routes.ts (NEW)
├── webhooks/
│   ├── stripe.webhook.ts (NEW)
│   ├── apple.webhook.ts (NEW)
│   └── google.webhook.ts (NEW)
├── types/
│   ├── subscription.types.ts (NEW)
│   ├── superlike.types.ts (NEW)
│   ├── boost.types.ts (NEW)
│   └── payment.types.ts (NEW)
└── utils/
    ├── payment.util.ts (NEW)
    └── subscription.util.ts (NEW)
```

## Testing Requirements
- Unit tests for all services and utilities
- Integration tests for payment processing
- Webhook testing for all payment providers
- Subscription lifecycle testing
- Super like flow testing
- Boost activation and analytics testing
- Premium feature access testing
- Rate limiting tests

## Security Measures
- Payment data encryption and PCI compliance
- Webhook signature verification
- Subscription status validation
- Premium feature authorization
- Payment method validation
- Fraud detection and prevention

## Performance Considerations
- Database indexes on all payment and subscription fields
- Caching of premium status and feature access
- Efficient subscription status checks
- Optimized super like and boost queries
- Payment processing optimization

## Monitoring and Analytics
- Subscription conversion rates
- Payment success/failure rates
- Super like usage and conversion
- Boost effectiveness analytics
- Premium feature usage tracking
- Revenue and churn analytics