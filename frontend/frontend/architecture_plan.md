# VibesMatch Frontend Architecture Plan

## Team Identity
**You are the Frontend Team.** You will build the complete React Native mobile application for VibesMatch dating app. You will follow instructions in this architecture_plan.md and each phase_x_plan.md exactly. You must consume the exact API endpoints and response formats defined by the Backend Team. Do not assume anything. Do not use mock data. Do not communicate with other teams. If anything is unclear, ask the uploader only.

## Tech Stack
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

## Project Structure
```
app/
├── (tabs)/             # Tab navigation screens
├── auth/               # Authentication screens
├── onboarding/         # Signup flow screens
├── profile/            # Profile related screens
├── discovery/          # Swipe/discovery screens
├── messages/           # Chat and messaging screens
├── settings/           # App settings screens
└── _layout.tsx         # Root layout

components/
├── ui/                 # Reusable UI components
├── forms/              # Form components
├── cards/              # Profile cards
├── modals/             # Modal components
└── navigation/         # Navigation components

hooks/
├── useAuth.ts          # Authentication hooks
├── useAPI.ts           # API client hooks
├── useSocket.ts        # WebSocket hooks
└── useStorage.ts       # Storage hooks

services/
├── api.ts              # API client configuration
├── auth.ts             # Authentication service
├── socket.ts           # WebSocket service
└── storage.ts          # Storage service

types/
├── api.ts              # API response types
├── user.ts             # User related types
├── message.ts          # Message types
└── navigation.ts       # Navigation types

utils/
├── constants.ts        # App constants
├── helpers.ts          # Helper functions
└── theme.ts            # Theme configuration
```

## API Integration Contract
The frontend must consume the exact API endpoints defined by the Backend Team:

### Base Configuration
- **Base URL**: `https://api.vibesmatch.com/api/v1`
- **Authentication**: `Authorization: Bearer {jwt_token}`
- **Content-Type**: `application/json`

### Response Format Handling
All API responses follow this format:
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  meta?: {
    pagination?: {
      cursor: string;
      hasMore: boolean;
    };
  };
}
```

### Error Handling
- Display user-friendly error messages
- Handle network failures gracefully
- Implement retry logic for failed requests
- Log errors for debugging

## State Management
Using Zustand for global state:
- **Auth Store**: User authentication state
- **Profile Store**: User profile data
- **Discovery Store**: Discovery feed state
- **Messages Store**: Chat messages and requests
- **UI Store**: Theme, loading states, modals

## Navigation Structure
```
Main App
├── Auth Flow
│   ├── Landing
│   ├── Sign In
│   └── OTP Verification
├── Onboarding Flow
│   ├── Basic Info
│   ├── Location
│   ├── Lifestyle
│   ├── Preferences
│   ├── Interests
│   └── Photos
└── Main App (Tabs)
    ├── Discovery
    ├── Messages
    ├── Profile
    └── Settings
```

## UI/UX Requirements
- **Theme Support**: Light/Dark mode
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Card transitions, modal animations
- **Loading States**: Skeleton screens, spinners
- **Error States**: User-friendly error messages
- **Empty States**: No data illustrations

## Screen Specifications
Each screen must handle:
- **Loading State**: Show skeleton/spinner while data loads
- **Error State**: Display error message with retry option
- **Empty State**: Show appropriate empty state message
- **Success State**: Display data with proper formatting

## Business Logic Implementation
- **Free User Restrictions**: Enforce 20 likes per 12 hours
- **Premium Features**: Show/hide based on subscription status
- **Super Like Flow**: Handle purchase and usage
- **Message Requests**: Display request vs accepted messages
- **Profile Visibility**: Respect user privacy settings

## Real-time Features
- **Socket Connection**: Maintain authenticated WebSocket connection
- **Message Updates**: Real-time message delivery
- **Activity Status**: Online/offline indicators
- **Push Notifications**: Handle incoming notifications

## Security Measures
- **Token Storage**: Secure storage of JWT tokens
- **Input Validation**: Client-side validation before API calls
- **Image Handling**: Secure image upload and display
- **Deep Linking**: Secure deep link handling

## Performance Optimizations
- **Image Optimization**: Lazy loading, caching
- **List Virtualization**: For large message lists
- **API Caching**: Cache responses where appropriate
- **Background Tasks**: Handle offline scenarios

### Offline Strategy
- **State Persistence**: Use Zustand persist for critical UI state that needs to survive app restarts
- **Secure Storage**: Utilize Expo SecureStore for sensitive data like authentication tokens
- **Action Queue**: Implement a queue system for outgoing actions (likes, messages) that occur while offline
- **Background Sync**: Synchronize queued actions when connectivity is restored
- **UI Feedback**: Display network status indicators and provide optimistic updates where appropriate
- **Conflict Resolution**: Implement strategies for handling conflicts during synchronization
- **Prioritization**: Define critical vs. non-critical data for sync prioritization
- **Cache Management**: Implement TTL (Time To Live) for cached data to ensure freshness

## Phase Implementation
- **Phase 1**: Authentication, Basic Profile, Navigation
- **Phase 2**: Discovery Feed, Like System, Profile Details
- **Phase 3**: Messaging System, Chat Interface
- **Phase 4**: Premium Features, Super Likes, Subscriptions
- **Phase 5**: Real-time Features, Push Notifications
- **Phase 6**: Advanced Features, Search, Settings

## Cross-Team Dependencies
- **Backend**: Must provide exact API endpoints with documented responses
- **QA**: Will test all UI flows and API integrations
- **No Assumptions**: Follow backend API contracts exactly as specified