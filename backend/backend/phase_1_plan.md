# Backend Phase 1 Plan: Authentication & User Management

## Phase 1 Objectives
Build the foundation authentication system and basic user management for VibesMatch. This phase covers user registration, login, profile creation, and session management.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE NULL,
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'non-binary')),
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  bio TEXT NULL,
  profile_photos TEXT[] DEFAULT '{}',
  
  -- Lifestyle Info
  exercise VARCHAR(50) NULL,
  education VARCHAR(100) NULL,
  job VARCHAR(100) NULL,
  drinking VARCHAR(50) NULL,
  smoking VARCHAR(50) NULL,
  kids VARCHAR(50) NULL,
  ethnicity VARCHAR(100) NULL,
  religion VARCHAR(100) NULL,
  
  -- Preferences
  relationship_type VARCHAR(50) NULL,
  current_status VARCHAR(50) NULL,
  sexuality VARCHAR(50) NULL,
  looking_for VARCHAR(50) NULL,
  preferences TEXT[] DEFAULT '{}',
  preferred_genders TEXT[] DEFAULT '{}',
  
  -- Personality
  mbti VARCHAR(4) NULL,
  interests TEXT[] DEFAULT '{}',
  
  -- Settings
  allow_search BOOLEAN DEFAULT FALSE,
  show_activity_status BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'system',
  
  -- Subscription
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP NULL,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Auth Tokens Table
```sql
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  token_type VARCHAR(20) NOT NULL CHECK (token_type IN ('refresh', 'access')),
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at)
);
```

### OTP Codes Table
```sql
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_code (code),
  INDEX idx_expires_at (expires_at)
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  device_info JSONB NULL,
  ip_address INET NULL,
  user_agent TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_session_token (session_token),
  INDEX idx_last_activity (last_activity)
);
```

## API Endpoints

### POST /api/v1/auth/send-otp
Send OTP code to email for verification.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expires_in": 300
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many OTP requests. Please wait 60 seconds.",
    "details": []
  }
}
```

**Rate Limit:** 3 requests per 60 seconds per email

### POST /api/v1/auth/verify-otp
Verify OTP code and return user status.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "data": {
    "user_exists": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "onboarding_completed": true,
      "is_premium": false
    }
  }
}
```

**Response (New User):**
```json
{
  "success": true,
  "data": {
    "user_exists": false,
    "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Please complete signup process"
  }
}
```

### POST /api/v1/auth/google-signin
Sign in with Google OAuth.

**Request:**
```json
{
  "id_token": "google_id_token_here"
}
```

**Response:** Same as verify-otp endpoint

### POST /api/v1/auth/signup/basic-info
Complete basic information step of signup.

**Headers:**
```
Authorization: Bearer {temp_token}
```

**Request:**
```json
{
  "name": "John Doe",
  "date_of_birth": "1995-05-15",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Basic info saved successfully",
    "next_step": "location"
  }
}
```

### POST /api/v1/auth/signup/location
Complete location step of signup.

**Headers:**
```
Authorization: Bearer {temp_token}
```

**Request:**
```json
{
  "country": "United States",
  "state": "California",
  "city": "Los Angeles"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Location saved successfully",
    "next_step": "lifestyle"
  }
}
```

### POST /api/v1/auth/signup/lifestyle
Complete lifestyle information step.

**Headers:**
```
Authorization: Bearer {temp_token}
```

**Request:**
```json
{
  "exercise": "regularly",
  "education": "bachelor",
  "job": "software_engineer",
  "drinking": "socially",
  "smoking": "never",
  "kids": "want_someday",
  "ethnicity": "mixed",
  "religion": "christian"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Lifestyle info saved successfully",
    "next_step": "preferences"
  }
}
```

### POST /api/v1/auth/signup/preferences
Complete relationship preferences step.

**Headers:**
```
Authorization: Bearer {temp_token}
```

**Request:**
```json
{
  "relationship_type": "serious",
  "current_status": "single",
  "sexuality": "straight",
  "looking_for": "dating",
  "preferences": ["long_term", "exclusive"],
  "preferred_genders": ["female"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Preferences saved successfully",
    "next_step": "personality"
  }
}
```

### POST /api/v1/auth/signup/personality
Complete personality and interests step.

**Headers:**
```
Authorization: Bearer {temp_token}
```

**Request:**
```json
{
  "mbti": "ENFP",
  "interests": ["travel", "music", "fitness", "cooking", "reading"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Personality saved successfully",
    "next_step": "photos"
  }
}
```

### POST /api/v1/auth/signup/photos
Upload profile photos and complete signup.

**Headers:**
```
Authorization: Bearer {temp_token}
Content-Type: multipart/form-data
```

**Request:**
```
photo1: [File]
photo2: [File]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Signup completed successfully",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "onboarding_completed": true,
      "is_premium": false
    }
  }
}
```

### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/v1/auth/logout
Logout and revoke tokens.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### POST /api/v1/auth/logout-all
Logout from all devices by revoking all active tokens for the user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out from all devices successfully"
  }
}
```

### POST /api/v1/auth/validate-token
Validate a JWT token and return its payload information. Primarily for development and testing purposes.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Valid Token):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "payload": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "tokenType": "access",
      "issuedAt": "2024-07-12T10:00:00.000Z",
      "expiresAt": "2024-07-12T11:00:00.000Z",
      "timeUntilExpiry": 3599999
    }
  }
}
```

**Response (Invalid Token):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "error": "Token has expired"
  }
}
```

### GET /api/v1/users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "date_of_birth": "1995-05-15",
      "gender": "male",
      "country": "United States",
      "state": "California",
      "city": "Los Angeles",
      "bio": "Love hiking and good coffee",
      "profile_photos": [
        "https://storage.vibesmatch.com/photos/user1_1.jpg",
        "https://storage.vibesmatch.com/photos/user1_2.jpg"
      ],
      "exercise": "regularly",
      "education": "bachelor",
      "job": "software_engineer",
      "drinking": "socially",
      "smoking": "never",
      "kids": "want_someday",
      "ethnicity": "mixed",
      "religion": "christian",
      "relationship_type": "serious",
      "current_status": "single",
      "sexuality": "straight",
      "looking_for": "dating",
      "preferences": ["long_term", "exclusive"],
      "preferred_genders": ["female"],
      "mbti": "ENFP",
      "interests": ["travel", "music", "fitness", "cooking", "reading"],
      "allow_search": false,
      "show_activity_status": true,
      "theme": "system",
      "is_premium": false,
      "premium_expires_at": null,
      "is_verified": false,
      "onboarding_completed": true,
      "last_active": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

### GET /api/v1/users/onboarding-status
Get the onboarding completion status for the current user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "onboardingCompleted": true
  }
}
```

### GET /api/v1/users/check-exists
Check if a user exists with the given email address. This is a public endpoint that doesn't require authentication.

**Query Parameters:**
- `email`: Email address to check

**Response:**
```json
{
  "success": true,
  "data": {
    "exists": true
  }
}
```

### GET /api/v1/users/{user_id}
Get a user profile by ID. This endpoint is primarily for internal use and future phases.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "date_of_birth": "1995-05-15",
      "gender": "male",
      "country": "United States",
      "state": "California",
      "city": "Los Angeles",
      "bio": "Love hiking and good coffee",
      "profile_photos": [
        "https://storage.vibesmatch.com/photos/user1_1.jpg",
        "https://storage.vibesmatch.com/photos/user1_2.jpg"
      ],
      "exercise": "regularly",
      "education": "bachelor",
      "job": "software_engineer",
      "drinking": "socially",
      "smoking": "never",
      "kids": "want_someday",
      "ethnicity": "mixed",
      "religion": "christian",
      "relationship_type": "serious",
      "current_status": "single",
      "sexuality": "straight",
      "looking_for": "dating",
      "preferences": ["long_term", "exclusive"],
      "preferred_genders": ["female"],
      "mbti": "ENFP",
      "interests": ["travel", "music", "fitness", "cooking", "reading"],
      "allow_search": false,
      "show_activity_status": true,
      "theme": "system",
      "is_premium": false,
      "premium_expires_at": null,
      "is_verified": false,
      "onboarding_completed": true,
      "last_active": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

### PUT /api/v1/users/profile
Update user profile (only editable fields).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "name": "John Smith",
  "bio": "Updated bio here",
  "mbti": "INFP",
  "interests": ["travel", "music", "fitness", "cooking", "reading", "photography"],
  "allow_search": true,
  "show_activity_status": false,
  "theme": "dark"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "user": {
      // Updated user object
    }
  }
}
```

## Business Logic Rules

### OTP System
- **Code Length**: 6 digits
- **Expiration**: 5 minutes
- **Rate Limit**: 3 requests per 60 seconds per email
- **Max Attempts**: 3 attempts per code
- **Cleanup**: Auto-delete expired codes

### Token Management
- **Access Token**: 1 hour expiration
- **Refresh Token**: 30 days expiration
- **Auto Refresh**: When access token expires
- **Revocation**: On logout or security breach

### Photo Upload
- **Formats**: JPG, PNG only
- **Size Limit**: 5MB per photo
- **Dimensions**: 1:1 to 4:5 aspect ratio
- **Minimum**: 2 photos required
- **Maximum**: 6 photos allowed

### Data Validation
- **Email**: Valid email format
- **Age**: Must be 18+ years old
- **Name**: 2-50 characters, letters only
- **Required Fields**: Email, name, DOB, gender, country

## Security Measures

### Password Security
- No passwords stored (OAuth + OTP only)
- JWT tokens with secure signing
- Token rotation on refresh

### Input Validation
- Zod schema validation on all inputs
- SQL injection prevention via Prisma
- XSS protection on text fields
- File upload validation

### Rate Limiting
- OTP requests: 3 per 60 seconds
- Login attempts: 5 per 15 minutes
- API requests: 100 per minute per user

## Error Handling

### Error Codes
- `UNAUTHORIZED`: Authentication token is missing, invalid, or expired
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_OTP`: OTP code is invalid or expired
- `USER_NOT_FOUND`: User does not exist
- `INVALID_TOKEN`: JWT token is invalid or expired
- `UPLOAD_ERROR`: File upload failed
- `DUPLICATE_EMAIL`: Email already exists
- `INTERNAL_SERVER_ERROR`: Unexpected server error

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      "Email is required",
      "Age must be 18 or older"
    ]
  }
}
```

## File Structure
```
src/
├── controllers/
│   ├── auth.controller.ts
│   └── user.controller.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── rateLimit.middleware.ts
├── models/
│   └── schema.prisma
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── token.service.ts
│   ├── email.service.ts
│   └── upload.service.ts
├── utils/
│   ├── jwt.util.ts
│   ├── hash.util.ts
│   └── validation.util.ts
├── routes/
│   ├── auth.routes.ts
│   └── user.routes.ts
└── types/
    ├── auth.types.ts
    └── user.types.ts
```

## Testing Requirements
- Unit tests for all controllers and services
- Integration tests for API endpoints
- Rate limiting tests
- Token validation tests
- Token expiration tests
- Photo upload tests
- Data validation tests
- User existence check tests
- Onboarding status tests
- Multi-device logout tests