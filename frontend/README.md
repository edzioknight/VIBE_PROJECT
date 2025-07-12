# VibesMatch - Phase 1 Implementation

A modern dating application built with React Native and Expo, focusing on meaningful connections through compatibility and shared interests.

## Phase 1 Features

### Authentication System
- **Email/OTP Authentication**: Secure email-based authentication with OTP verification
- **Google Sign-In**: OAuth integration for seamless sign-in experience
- **User Existence Check**: Automatic detection of existing vs new users
- **Token Management**: Secure JWT token storage and automatic refresh
- **Multi-device Logout**: Logout from all devices functionality

### Onboarding Flow
- **Basic Information**: Name, date of birth (18+ validation), gender selection
- **Location**: Country, state, city collection
- **Lifestyle**: Exercise, education, drinking, smoking preferences
- **Preferences**: Relationship type, sexuality, preferred genders
- **Personality**: MBTI type and interests selection
- **Photos**: Multiple photo upload with validation

### Technical Features
- **State Management**: Zustand with persistence for offline support
- **Type Safety**: 100% TypeScript implementation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Validation**: Client-side validation for all inputs
- **Security**: Secure token storage using Expo SecureStore
- **Navigation**: Expo Router with proper flow management

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd vibesmatch
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm start
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
EXPO_PUBLIC_API_URL=https://api.vibesmatch.com/api/v1
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_DEBUG_MODE=true
```

## Project Structure

```
app/
├── auth/                 # Authentication screens
├── onboarding/          # User onboarding flow
├── (tabs)/              # Main app tabs (placeholder)
└── index.tsx            # App entry point

components/
├── ui/                  # Reusable UI components
└── ...

services/
├── api.ts              # API client
├── auth.ts             # Authentication API
├── onboarding.ts       # Onboarding API
├── profile.ts          # Profile API
└── storage.ts          # Secure storage

stores/
├── authStore.ts        # Authentication state
└── onboardingStore.ts  # Onboarding state

types/
├── api.ts              # API response types
├── auth.ts             # Authentication types
└── user.ts             # User profile types

utils/
├── errorHandler.ts     # Error handling utilities
└── validation.ts       # Input validation
```

## Key Features

### Authentication Flow
1. **Landing Screen**: Welcome screen with sign-in/sign-up options
2. **Sign In**: Email input with user existence check
3. **OTP Verification**: 6-digit code verification with resend functionality
4. **Google Sign-In**: OAuth integration for quick authentication

### Onboarding Process
1. **Basic Info**: Personal information collection
2. **Location**: Geographic information
3. **Lifestyle**: Personal preferences and habits
4. **Preferences**: Dating preferences and interests
5. **Personality**: MBTI and interests selection
6. **Photos**: Profile photo upload

### State Management
- **Zustand**: Lightweight state management with persistence
- **Auth Store**: Handles authentication state and token management
- **Onboarding Store**: Manages multi-step onboarding process

### Security Features
- **Secure Storage**: JWT tokens stored securely using Expo SecureStore
- **Input Validation**: Client-side validation for all user inputs
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Token Refresh**: Automatic token refresh on expiration

## API Integration

The app integrates with the VibesMatch backend API:

- **Authentication**: `/auth/send-otp`, `/auth/verify-otp`, `/auth/google-signin`
- **Onboarding**: `/auth/signup/*` endpoints for each step
- **Profile**: `/users/profile`, `/users/onboarding-status`

All API calls use the centralized `apiClient` with automatic token management.

## Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Consistent naming conventions
- Comprehensive error handling

### Testing
- Unit tests for utilities and services
- Integration tests for API calls
- UI tests for screen interactions

### Performance
- Optimized image handling
- Efficient state management
- Lazy loading where appropriate
- Memory management for long sessions

## Next Steps

Phase 1 provides the foundation for:
- **Phase 2**: Discovery and matching system
- **Phase 3**: Real-time messaging
- **Phase 4**: Premium features and monetization
- **Phase 5**: Advanced real-time features
- **Phase 6**: Search and analytics

## Contributing

1. Follow the established code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all validations pass

## License

Private - VibesMatch Dating Application