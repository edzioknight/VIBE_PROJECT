# QA Phase 2 Test Plan: Discovery, Likes, and Basic Matching

## Phase 2 Testing Objectives
Comprehensive testing of the core discovery system, like/dislike functionality, and basic matching logic. This phase validates the heart of the VibesMatch dating experience.

## Test Environment Setup
✅ **Backend API**: Phase 2 discovery endpoints deployed and accessible
✅ **Frontend App**: React Native app with discovery UI implemented
✅ **Database**: Test database with diverse user profiles and interaction data
✅ **Test Data**: Multiple test accounts with various profile configurations

## Test Categories

### 1. API Contract Testing

#### GET /api/v1/discovery/profiles
**Valid Requests:**
- ✅ Test successful profile fetching with default parameters
- ✅ Verify response format matches specification exactly
- ✅ Validate profile data structure and required fields
- ✅ Test pagination with `limit` parameter (1-50 range)
- ✅ Test cursor-based pagination functionality
- ✅ Verify profiles are sorted by online status then last_active

**Pagination Testing:**
- ✅ Test `limit` parameter with values: 1, 10, 25, 50
- ✅ Test `cursor` parameter for next batch retrieval
- ✅ Verify `hasMore` flag accuracy
- ✅ Test behavior when no more profiles available
- ✅ Verify `total` count accuracy

**Profile Data Validation:**
- ✅ Verify all required fields are present
- ✅ Test profile_photos array contains valid URLs
- ✅ Validate age calculation accuracy
- ✅ Test distance calculation (if location enabled)
- ✅ Verify online status and last_active timestamps

**Authentication Testing:**
- ✅ Test with valid access token
- ✅ Test with invalid/expired token (expect 401)
- ✅ Test with missing Authorization header

**Edge Cases:**
- ✅ Test when user has interacted with all available profiles
- ✅ Test with user who has no potential matches
- ✅ Test with blocked users (should not appear)

#### POST /api/v1/discovery/action
**Valid Like Actions:**
- ✅ Test successful like action recording
- ✅ Verify response format for non-matching like
- ✅ Test like action creates user_actions record
- ✅ Verify target profile removed from subsequent discovery calls

**Valid Dislike Actions:**
- ✅ Test successful dislike action recording
- ✅ Verify dislike creates user_actions record
- ✅ Verify target profile removed from discovery feed

**Match Creation Testing:**
- ✅ Pre-condition: User B likes User A
- ✅ Action: User A likes User B
- ✅ Verify match_found: true in response
- ✅ Verify match record created in database
- ✅ Test match data structure in response

**Error Scenarios:**
- ✅ Test invalid target_id (non-existent user)
- ✅ Test invalid action_type values
- ✅ Test already interacted error (ALREADY_INTERACTED)
- ✅ Test self-like attempt (SELF_ACTION_NOT_ALLOWED)
- ✅ Test blocked user interaction (USER_BLOCKED)

**Free User Limit Testing:**
- ✅ Test like limit enforcement (20 likes per 12 hours)
- ✅ Verify LIKE_LIMIT_EXCEEDED error when limit reached
- ✅ Test limit reset after 12 hours
- ✅ Verify super likes don't count toward limit (Phase 4 prep)

#### GET /api/v1/discovery/stats
**Stats Validation:**
- ✅ Test likes_remaining calculation accuracy
- ✅ Verify likes_reset_at timestamp
- ✅ Test total_likes_sent counter
- ✅ Test total_matches counter
- ✅ Test profiles_viewed_today counter

#### GET /api/v1/users/{user_id}/profile
**Profile Detail Testing:**
- ✅ Test detailed profile data retrieval
- ✅ Verify interaction_status accuracy
- ✅ Test profile view recording
- ✅ Test with matched vs non-matched users
- ✅ Verify can_message flag logic

### 2. Business Logic Testing

#### Discovery Algorithm Validation
**Exclusion Rules:**
- ✅ Verify liked users don't reappear in discovery
- ✅ Verify disliked users don't reappear in discovery
- ✅ Verify blocked users are excluded (both directions)
- ✅ Test age preference filtering (basic)
- ✅ Test gender preference filtering (basic)

**Sorting Logic:**
- ✅ Verify online users appear before offline users
- ✅ Within same online status, verify recent activity first
- ✅ Test with mixed online/offline user scenarios
- ✅ Verify consistent sorting across multiple requests

**Profile Completeness:**
- ✅ Test discovery with profiles of varying completeness
- ✅ Verify all required profile fields are populated
- ✅ Test handling of optional fields (bio, interests, etc.)

#### Like System Logic
**Free User Restrictions:**
- ✅ Test 20 likes per 12-hour period enforcement
- ✅ Verify counter resets exactly 12 hours after first like
- ✅ Test behavior when approaching limit (warnings)
- ✅ Test behavior when limit exceeded

**Action Recording:**
- ✅ Test unique constraint on actor_id + target_id
- ✅ Test action type updates (like → dislike, dislike → like)
- ✅ Verify timestamps are recorded correctly
- ✅ Test action history preservation

#### Match Creation Logic
**Mutual Like Scenarios:**
- ✅ Scenario 1: A likes B, then B likes A → Match created
- ✅ Scenario 2: B likes A, then A likes B → Match created
- ✅ Verify match record contains correct user IDs
- ✅ Test match timestamp accuracy
- ✅ Verify match status defaults to 'active'

**Match Data Integrity:**
- ✅ Test unique constraint on user pairs
- ✅ Verify user1_id < user2_id ordering
- ✅ Test match_type set to 'mutual_like'
- ✅ Verify both users can see the match

### 3. UI/UX Flow Testing

#### Discovery Screen Functionality
**Profile Card Display:**
- ✅ Verify profile cards render correctly
- ✅ Test primary photo loading and display
- ✅ Verify name, age, location display
- ✅ Test online status indicator
- ✅ Verify distance display (when available)

**Interaction Buttons:**
- ✅ Test Heart (Like) button functionality
- ✅ Test Cross (Dislike) button functionality
- ✅ Verify Super Like button presence (Phase 4 prep)
- ✅ Verify Direct Message button presence (Phase 3 prep)
- ✅ Test button responsiveness and visual feedback

**Profile Detail View:**
- ✅ Test scroll-down gesture to reveal details
- ✅ Verify smooth animation during scroll
- ✅ Test bio, interests, and lifestyle info display
- ✅ Verify multiple photos gallery
- ✅ Test MBTI and personality info display
- ✅ Verify no Dislike button on detail view

**Card Transitions:**
- ✅ Test smooth card removal after like/dislike
- ✅ Verify next card appears correctly
- ✅ Test animation performance (60 FPS target)
- ✅ Test gesture responsiveness

#### State Management Testing
**Discovery Feed State:**
- ✅ Test profile loading and caching
- ✅ Verify current profile index tracking
- ✅ Test automatic profile preloading
- ✅ Test state persistence during app backgrounding

**Action State Management:**
- ✅ Test optimistic UI updates
- ✅ Verify error state handling and rollback
- ✅ Test loading states during API calls
- ✅ Test network error recovery

#### Modal and Alert Testing
**Match Modal:**
- ✅ Test match modal display on successful match
- ✅ Verify match data display (name, photo)
- ✅ Test "Send Message" button (Phase 3 prep)
- ✅ Test "Keep Swiping" button functionality
- ✅ Test modal dismissal

**Like Limit Modal:**
- ✅ Test modal display when limit reached
- ✅ Verify remaining time display
- ✅ Test "Upgrade to Premium" button (Phase 4 prep)
- ✅ Test "I'll Wait" button functionality

**Error Handling:**
- ✅ Test network error messages
- ✅ Test API error message display
- ✅ Test retry functionality
- ✅ Test graceful degradation

#### Empty States Testing
**No Profiles Available:**
- ✅ Test empty discovery feed display
- ✅ Verify appropriate messaging
- ✅ Test refresh functionality
- ✅ Test suggestions for expanding search

**Loading States:**
- ✅ Test initial loading screen
- ✅ Test skeleton loading for profile cards
- ✅ Test loading indicators for actions
- ✅ Test background loading for more profiles

### 4. Integration Testing

#### End-to-End Discovery Flow
**Complete User Journey:**
- ✅ Login as test user
- ✅ Navigate to discovery screen
- ✅ Browse through multiple profiles
- ✅ Perform like and dislike actions
- ✅ Verify profiles don't reappear
- ✅ Test reaching end of available profiles

**Match Creation E2E:**
- ✅ Setup: User A likes User B
- ✅ Login as User B
- ✅ Navigate to discovery
- ✅ Find and like User A
- ✅ Verify match notification appears
- ✅ Verify match is recorded for both users

**Multi-User Scenarios:**
- ✅ Test concurrent users liking same profiles
- ✅ Test race conditions in match creation
- ✅ Test database consistency under load
- ✅ Test real-time updates (if applicable)

#### API Integration Testing
**Backend-Frontend Sync:**
- ✅ Test API response format compliance
- ✅ Verify error handling consistency
- ✅ Test data type validation
- ✅ Test null/undefined field handling

**State Synchronization:**
- ✅ Test local state vs server state consistency
- ✅ Verify optimistic updates work correctly
- ✅ Test conflict resolution
- ✅ Test data refresh scenarios

### 5. Performance Testing

#### Response Time Testing
**API Performance:**
- ✅ Discovery profiles: < 500ms (Target: < 300ms)
- ✅ Record action: < 200ms (Target: < 100ms)
- ✅ Get stats: < 200ms (Target: < 100ms)
- ✅ User profile: < 300ms (Target: < 200ms)

**UI Performance:**
- ✅ Profile card rendering: < 100ms
- ✅ Button tap response: < 50ms
- ✅ Animation frame rate: 60 FPS
- ✅ Scroll performance: Smooth scrolling

#### Load Testing
**Concurrent Users:**
- ✅ Test 100 concurrent discovery requests
- ✅ Test 50 concurrent like actions
- ✅ Monitor database performance under load
- ✅ Test API rate limiting effectiveness

**Memory Usage:**
- ✅ Monitor app memory usage during extended use
- ✅ Test for memory leaks in profile browsing
- ✅ Verify image caching efficiency
- ✅ Test garbage collection performance

#### Scalability Testing
**Large Dataset Performance:**
- ✅ Test with 10,000+ user profiles
- ✅ Test discovery algorithm with large user base
- ✅ Monitor database query performance
- ✅ Test pagination efficiency

### 6. Security Testing

#### Authentication Security
**Token Validation:**
- ✅ Test all endpoints require valid authentication
- ✅ Test token expiration handling
- ✅ Test token refresh during discovery session
- ✅ Verify no sensitive data in error messages

#### Input Validation
**API Input Security:**
- ✅ Test SQL injection attempts in target_id
- ✅ Test XSS attempts in action parameters
- ✅ Test malformed JSON requests
- ✅ Test oversized request payloads

#### Data Privacy
**User Data Protection:**
- ✅ Verify blocked users cannot see each other
- ✅ Test location data privacy
- ✅ Verify profile visibility rules
- ✅ Test data access controls

### 7. Cross-Platform Testing

#### iOS Testing
**Device Compatibility:**
- ✅ Test on iPhone 12, 13, 14, 15 series
- ✅ Test on various screen sizes
- ✅ Test iOS 15, 16, 17 compatibility
- ✅ Test performance on older devices

**iOS-Specific Features:**
- ✅ Test haptic feedback
- ✅ Test gesture recognition
- ✅ Test background app refresh
- ✅ Test memory management

#### Android Testing
**Device Compatibility:**
- ✅ Test on Samsung, Google Pixel, OnePlus devices
- ✅ Test various Android versions (10, 11, 12, 13, 14)
- ✅ Test different screen densities
- ✅ Test performance on mid-range devices

**Android-Specific Features:**
- ✅ Test back button behavior
- ✅ Test app state management
- ✅ Test notification handling
- ✅ Test battery optimization

#### Cross-Platform Consistency
**UI Consistency:**
- ✅ Verify identical layouts across platforms
- ✅ Test animation consistency
- ✅ Verify color and typography consistency
- ✅ Test interaction patterns

**Functional Consistency:**
- ✅ Verify identical API behavior
- ✅ Test state management consistency
- ✅ Verify error handling consistency
- ✅ Test performance parity

### 8. Accessibility Testing

#### Screen Reader Support
**VoiceOver (iOS) / TalkBack (Android):**
- ✅ Test profile card navigation
- ✅ Test button accessibility labels
- ✅ Test modal accessibility
- ✅ Test focus management

#### Visual Accessibility
**Color and Contrast:**
- ✅ Test high contrast mode
- ✅ Verify WCAG AA compliance
- ✅ Test color blind accessibility
- ✅ Test dark mode accessibility

#### Motor Accessibility
**Touch Targets:**
- ✅ Verify 44pt minimum touch targets
- ✅ Test gesture alternatives
- ✅ Test voice control compatibility
- ✅ Test switch control support

### 9. Edge Case Testing

#### Network Conditions
**Poor Connectivity:**
- ✅ Test with slow 3G connection
- ✅ Test with intermittent connectivity
- ✅ Test offline behavior
- ✅ Test connection recovery

#### Data Edge Cases
**Unusual Profile Data:**
- ✅ Test profiles with missing photos
- ✅ Test profiles with very long bios
- ✅ Test profiles with special characters
- ✅ Test profiles with empty optional fields

#### User Behavior Edge Cases
**Rapid Interactions:**
- ✅ Test rapid like/dislike actions
- ✅ Test double-tap prevention
- ✅ Test concurrent action attempts
- ✅ Test action queue management

### 10. Regression Testing

#### Phase 1 Functionality
**Authentication System:**
- ✅ Verify login/logout still works
- ✅ Test profile management
- ✅ Test onboarding flow
- ✅ Verify token management

#### Database Integrity
**Data Consistency:**
- ✅ Verify user profiles remain intact
- ✅ Test foreign key constraints
- ✅ Verify data migration success
- ✅ Test backup/restore procedures

## Test Data Requirements

### User Profiles
- **Diverse Demographics**: Various ages, genders, locations
- **Profile Completeness**: Complete and incomplete profiles
- **Activity Levels**: Online, recently active, inactive users
- **Interaction History**: Users with various like/dislike patterns

### Test Scenarios
- **Match Scenarios**: Pre-configured mutual likes
- **Limit Testing**: Users at various like count levels
- **Block Scenarios**: Users with blocking relationships
- **Geographic Distribution**: Users from different locations

## Bug Reporting Format

### Critical Issues
- **Severity**: Critical
- **Impact**: Breaks core functionality
- **Examples**: App crashes, data loss, security vulnerabilities

### High Priority Issues
- **Severity**: High
- **Impact**: Significantly impacts user experience
- **Examples**: Match creation fails, profiles don't load

### Medium Priority Issues
- **Severity**: Medium
- **Impact**: Minor functionality issues
- **Examples**: Animation glitches, slow loading

### Low Priority Issues
- **Severity**: Low
- **Impact**: Cosmetic or minor usability issues
- **Examples**: Text alignment, color inconsistencies

## Success Criteria

### Functional Requirements
✅ **All API endpoints function correctly**
✅ **Discovery algorithm works as specified**
✅ **Like/dislike actions record properly**
✅ **Match creation logic functions correctly**
✅ **Free user limits are enforced**

### Performance Requirements
✅ **API response times meet targets**
✅ **UI animations are smooth (60 FPS)**
✅ **App memory usage stays under 150MB**
✅ **No significant performance degradation**

### Quality Requirements
✅ **Zero critical bugs**
✅ **No high-priority bugs affecting core functionality**
✅ **All security tests pass**
✅ **Cross-platform consistency achieved**
✅ **Accessibility standards met**

## Test Automation

### Automated Test Coverage
- **API Contract Tests**: 100% endpoint coverage
- **Unit Tests**: Core business logic functions
- **Integration Tests**: Critical user flows
- **Performance Tests**: Response time monitoring

### Manual Test Coverage
- **UI/UX Testing**: Visual and interaction testing
- **Accessibility Testing**: Screen reader and motor testing
- **Cross-Platform Testing**: Device-specific testing
- **Edge Case Testing**: Unusual scenarios

## Risk Assessment

### High Risk Areas
- **Match Creation Logic**: Critical for app functionality
- **Like Limit Enforcement**: Important for monetization
- **Discovery Algorithm**: Core user experience
- **Performance Under Load**: Scalability concerns

### Mitigation Strategies
- **Comprehensive Testing**: Multiple test scenarios
- **Load Testing**: Stress testing under high load
- **Monitoring**: Real-time performance monitoring
- **Rollback Plan**: Quick rollback capability

## Phase 2 Testing Timeline

### Week 1: API Testing
- Day 1-2: API contract testing
- Day 3-4: Business logic testing
- Day 5: Performance testing

### Week 2: UI Testing
- Day 1-2: Discovery screen testing
- Day 3-4: Interaction testing
- Day 5: Cross-platform testing

### Week 3: Integration Testing
- Day 1-2: End-to-end flow testing
- Day 3-4: Edge case testing
- Day 5: Regression testing

### Week 4: Final Validation
- Day 1-2: Security testing
- Day 3-4: Accessibility testing
- Day 5: Final sign-off

Phase 2 testing ensures the core discovery and matching functionality works flawlessly, providing a solid foundation for the messaging and premium features in subsequent phases.