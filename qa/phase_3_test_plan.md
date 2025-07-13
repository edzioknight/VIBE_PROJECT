# QA Phase 3 Test Plan: Direct Messaging and Chat System

## Phase 3 Testing Objectives
Comprehensive testing of the messaging system, including message requests, real-time chat functionality, and enhanced match logic. This phase validates the core communication features that enable users to connect and build relationships.

## Test Environment Setup
✅ **Backend API**: Phase 3 messaging endpoints deployed and accessible
✅ **Frontend App**: React Native app with messaging UI implemented
✅ **WebSocket Server**: Real-time messaging server configured and running
✅ **Database**: Test database with conversation and message data
✅ **Test Data**: Multiple test accounts with various messaging scenarios

## Test Categories

### 1. API Contract Testing

#### POST /api/v1/messages/request
**Valid Message Request:**
- ✅ Test successful message request with 250-character content
- ✅ Verify response format matches specification exactly
- ✅ Validate message_request and message records created
- ✅ Test preview_text truncation and formatting
- ✅ Verify status set to 'pending'

**Content Validation:**
- ✅ Test character limit enforcement (250 characters max)
- ✅ Test empty content rejection
- ✅ Test special characters and emoji handling
- ✅ Test content sanitization

**Business Logic:**
- ✅ Test one request per user pair limitation
- ✅ Test Premium user direct message capability
- ✅ Test Free user request requirement
- ✅ Verify target user removed from sender's discovery

**Error Scenarios:**
- ✅ Test MESSAGE_REQUEST_EXISTS for duplicate requests
- ✅ Test USER_BLOCKED for blocked users
- ✅ Test CONTENT_TOO_LONG for oversized messages
- ✅ Test invalid receiver_id handling

#### POST /api/v1/messages/request/{request_id}/respond
**Accept Request:**
- ✅ Test successful request acceptance
- ✅ Verify conversation creation
- ✅ Verify match creation (if not exists)
- ✅ Test request_status update to 'accepted'

**Decline Request:**
- ✅ Test successful request declination
- ✅ Verify request_status update to 'declined'
- ✅ Verify no conversation or match created

**Authorization:**
- ✅ Test only receiver can respond to request
- ✅ Test invalid request_id handling
- ✅ Test already responded request handling

#### POST /api/v1/messages/send
**Valid Message Sending:**
- ✅ Test successful message sending in existing conversation
- ✅ Verify message record creation
- ✅ Test conversation last_activity update
- ✅ Verify WebSocket notification triggered

**Message Types:**
- ✅ Test text message sending
- ✅ Test emoji message handling
- ✅ Test message content validation

**Authorization:**
- ✅ Test conversation membership requirement
- ✅ Test blocked user prevention
- ✅ Test non-existent conversation handling

#### GET /api/v1/conversations
**Conversation List:**
- ✅ Test successful conversation retrieval
- ✅ Verify sorting by last_activity (most recent first)
- ✅ Test pagination with limit and cursor
- ✅ Verify unread_count accuracy
- ✅ Test user information completeness

**Filtering:**
- ✅ Test type filter ('active', 'archived')
- ✅ Test empty conversation list handling
- ✅ Verify only user's conversations returned

#### GET /api/v1/conversations/{conversation_id}/messages
**Message History:**
- ✅ Test successful message retrieval
- ✅ Verify chronological ordering (oldest first)
- ✅ Test pagination for large conversations
- ✅ Verify message data completeness
- ✅ Test read status accuracy

**Authorization:**
- ✅ Test conversation membership requirement
- ✅ Test invalid conversation_id handling
- ✅ Test blocked user access prevention

#### GET /api/v1/messages/requests
**Request Lists:**
- ✅ Test received requests retrieval
- ✅ Test sent requests retrieval
- ✅ Test status filtering (pending, accepted, declined)
- ✅ Verify request data completeness
- ✅ Test pagination functionality

#### PUT /api/v1/messages/{message_id}/read
**Read Receipts:**
- ✅ Test successful message read marking
- ✅ Verify read_at timestamp accuracy
- ✅ Test WebSocket read receipt notification
- ✅ Test authorization (only receiver can mark read)

#### Blocking and Reporting APIs
**Block User:**
- ✅ Test successful user blocking
- ✅ Verify user_blocks record creation
- ✅ Test match removal on blocking
- ✅ Test discovery removal for both users

**Report User:**
- ✅ Test successful user reporting
- ✅ Verify user_reports record creation
- ✅ Test reason validation
- ✅ Test description handling

**Unmatch User:**
- ✅ Test successful unmatching
- ✅ Verify match status update to 'unmatched'
- ✅ Test conversation archiving
- ✅ Test discovery removal

### 2. WebSocket Real-time Testing

#### Connection Management
**Authentication:**
- ✅ Test WebSocket connection with valid JWT token
- ✅ Test connection rejection with invalid token
- ✅ Test automatic reconnection on token refresh
- ✅ Test connection cleanup on logout

**Connection Stability:**
- ✅ Test connection persistence during app backgrounding
- ✅ Test reconnection after network interruption
- ✅ Test multiple device connections for same user
- ✅ Test connection limits and cleanup

#### Real-time Messaging
**Message Delivery:**
- ✅ Test instant message delivery between users
- ✅ Test message delivery to offline users (on reconnect)
- ✅ Test message ordering in real-time scenarios
- ✅ Test duplicate message prevention

**Message Events:**
- ✅ Test 'new_message' event structure and data
- ✅ Test message delivery confirmation
- ✅ Test failed message handling and retry
- ✅ Test message queue during disconnection

#### Typing Indicators
**Typing Events:**
- ✅ Test 'typing_start' event broadcasting
- ✅ Test 'typing_stop' event broadcasting
- ✅ Test typing timeout handling (3 seconds)
- ✅ Test multiple users typing simultaneously

**Typing Display:**
- ✅ Test typing indicator appearance and disappearance
- ✅ Test typing indicator animation
- ✅ Test typing indicator for multiple users
- ✅ Test typing indicator cleanup on disconnect

#### Read Receipts
**Read Events:**
- ✅ Test 'message_read' event broadcasting
- ✅ Test read receipt delivery to sender
- ✅ Test read status synchronization
- ✅ Test Premium user read receipt visibility

#### Presence Status
**Online Status:**
- ✅ Test 'user_online' event broadcasting
- ✅ Test 'user_offline' event broadcasting
- ✅ Test last_active timestamp updates
- ✅ Test presence status in conversation lists

### 3. Business Logic Testing

#### Message Request Logic
**Request Rules:**
- ✅ Test Free user message request requirement
- ✅ Test Premium user direct message capability
- ✅ Test one pending request per user pair limit
- ✅ Test 250-character limit enforcement

**Discovery Removal:**
- ✅ Test Premium user message removes target from discovery
- ✅ Test Free user request doesn't remove from discovery
- ✅ Test discovery restoration on request decline/cancel

#### Enhanced Match Logic
**Match Creation Scenarios:**
- ✅ Scenario 1: Mutual like → Match created
- ✅ Scenario 2: Message request acceptance → Match created
- ✅ Scenario 3: Message request reply → Match created
- ✅ Scenario 4: Like back after message request → Match created

**Match Data Integrity:**
- ✅ Test unique match constraint enforcement
- ✅ Test match timestamp accuracy
- ✅ Test match status management
- ✅ Test match type classification

#### Conversation Management
**Conversation Creation:**
- ✅ Test conversation creation on request acceptance
- ✅ Test conversation creation on first message
- ✅ Test unique conversation constraint
- ✅ Test conversation participant validation

**Message Restrictions:**
- ✅ Test one message limit until request accepted
- ✅ Test unlimited messages after acceptance
- ✅ Test message sending to blocked users prevention
- ✅ Test conversation access after unmatching

#### Blocking and Moderation
**Block Effects:**
- ✅ Test match removal on blocking
- ✅ Test conversation access prevention
- ✅ Test discovery removal for both users
- ✅ Test message sending prevention

**Report Processing:**
- ✅ Test report record creation
- ✅ Test report reason validation
- ✅ Test duplicate report handling
- ✅ Test report status tracking

### 4. UI/UX Flow Testing

#### Messages Tab Interface
**Tab Navigation:**
- ✅ Test Chats, Requests, and Viewed tab switching
- ✅ Test unread count badges on tabs
- ✅ Test tab content loading and refresh
- ✅ Test empty state displays for each tab

**Conversation List:**
- ✅ Test conversation item display (name, photo, last message)
- ✅ Test online status indicators
- ✅ Test unread message indicators
- ✅ Test conversation sorting by activity
- ✅ Test pull-to-refresh functionality

#### Chat Screen Interface
**Message Display:**
- ✅ Test message bubble rendering (own vs other)
- ✅ Test message timestamp display
- ✅ Test read receipt indicators
- ✅ Test message request labeling
- ✅ Test long message handling

**Message Input:**
- ✅ Test text input functionality
- ✅ Test send button enable/disable
- ✅ Test character limit handling
- ✅ Test multiline message support
- ✅ Test keyboard behavior

**Real-time Updates:**
- ✅ Test incoming message display
- ✅ Test typing indicator animation
- ✅ Test online status updates
- ✅ Test read receipt updates

#### Message Request Interface
**Request Composition:**
- ✅ Test message request screen navigation
- ✅ Test character counter display
- ✅ Test character limit warning
- ✅ Test send button functionality
- ✅ Test request preview display

**Request Management:**
- ✅ Test received request display
- ✅ Test accept/decline button functionality
- ✅ Test sent request display
- ✅ Test cancel request functionality

#### Profile Actions Interface
**Action Sheet Display:**
- ✅ Test Block, Report, Unmatch options for matched users
- ✅ Test Report, Block, Cancel Request for pending requests
- ✅ Test action confirmation dialogs
- ✅ Test action result feedback

### 5. Integration Testing

#### End-to-End Message Flow
**Complete Request Flow:**
- ✅ User A sends message request to User B
- ✅ User B receives request notification
- ✅ User B accepts request
- ✅ Match is created
- ✅ Conversation is established
- ✅ Real-time messaging works

**Complete Chat Flow:**
- ✅ Users exchange multiple messages
- ✅ Typing indicators work correctly
- ✅ Read receipts function properly
- ✅ Online status updates accurately
- ✅ Message history persists

#### Cross-Platform Integration
**iOS and Android Consistency:**
- ✅ Test identical functionality across platforms
- ✅ Test WebSocket behavior consistency
- ✅ Test notification handling differences
- ✅ Test keyboard behavior variations

#### Backend-Frontend Sync
**Data Synchronization:**
- ✅ Test API response format compliance
- ✅ Test WebSocket event format compliance
- ✅ Test error handling consistency
- ✅ Test state management accuracy

### 6. Performance Testing

#### Message Loading Performance
**Response Times:**
- ✅ Conversation list: < 1 second (Target: < 500ms)
- ✅ Message history: < 2 seconds (Target: < 1 second)
- ✅ Send message: < 500ms (Target: < 200ms)
- ✅ Message request: < 1 second (Target: < 500ms)

#### Real-time Performance
**WebSocket Latency:**
- ✅ Message delivery: < 100ms (Target: < 50ms)
- ✅ Typing indicators: < 50ms (Target: < 25ms)
- ✅ Read receipts: < 100ms (Target: < 50ms)
- ✅ Presence updates: < 200ms (Target: < 100ms)

#### Scalability Testing
**Concurrent Users:**
- ✅ Test 200 concurrent WebSocket connections
- ✅ Test 100 concurrent message sending
- ✅ Test large conversation history loading
- ✅ Test multiple device connections per user

#### Memory and Resource Usage
**Mobile App Performance:**
- ✅ Monitor memory usage during long conversations
- ✅ Test battery usage during active messaging
- ✅ Test network usage optimization
- ✅ Test background processing efficiency

### 7. Security Testing

#### Authentication Security
**WebSocket Security:**
- ✅ Test JWT token validation for WebSocket connections
- ✅ Test token expiration handling
- ✅ Test unauthorized connection prevention
- ✅ Test session hijacking prevention

#### Message Security
**Content Security:**
- ✅ Test message content sanitization
- ✅ Test XSS prevention in message display
- ✅ Test malicious content filtering
- ✅ Test file upload security (if applicable)

#### Privacy Protection
**User Privacy:**
- ✅ Test blocked user interaction prevention
- ✅ Test conversation access authorization
- ✅ Test message history privacy
- ✅ Test user data exposure prevention

### 8. Error Handling Testing

#### Network Error Scenarios
**Connection Issues:**
- ✅ Test messaging during poor network conditions
- ✅ Test WebSocket reconnection on network recovery
- ✅ Test message queue during offline periods
- ✅ Test error message display for failed operations

#### API Error Handling
**Server Errors:**
- ✅ Test 500 server error handling
- ✅ Test rate limit error handling
- ✅ Test validation error display
- ✅ Test timeout error recovery

#### WebSocket Error Handling
**Connection Errors:**
- ✅ Test WebSocket connection failure handling
- ✅ Test message delivery failure handling
- ✅ Test reconnection attempt limits
- ✅ Test fallback to API calls when WebSocket fails

### 9. Accessibility Testing

#### Screen Reader Support
**Message Accessibility:**
- ✅ Test message bubble accessibility labels
- ✅ Test conversation list navigation
- ✅ Test typing indicator announcements
- ✅ Test message status announcements

#### Visual Accessibility
**Message Display:**
- ✅ Test high contrast mode for message bubbles
- ✅ Test text scaling for message content
- ✅ Test color blind accessibility
- ✅ Test dark mode message display

#### Motor Accessibility
**Interaction Accessibility:**
- ✅ Test voice control for message sending
- ✅ Test switch control navigation
- ✅ Test large touch targets for buttons
- ✅ Test gesture alternatives

### 10. Edge Case Testing

#### Unusual Message Scenarios
**Content Edge Cases:**
- ✅ Test very long messages (near character limits)
- ✅ Test messages with only emojis
- ✅ Test messages with special characters
- ✅ Test empty or whitespace-only messages

#### Timing Edge Cases
**Race Conditions:**
- ✅ Test simultaneous message sending
- ✅ Test rapid accept/decline of requests
- ✅ Test concurrent blocking/unblocking
- ✅ Test message sending during blocking

#### Data Edge Cases
**Unusual Data States:**
- ✅ Test conversations with deleted users
- ✅ Test messages from deactivated accounts
- ✅ Test corrupted message data handling
- ✅ Test missing conversation data

### 11. Regression Testing

#### Phase 1 & 2 Functionality
**Authentication System:**
- ✅ Verify login/logout still works correctly
- ✅ Test profile management integration
- ✅ Test token management with WebSocket

**Discovery System:**
- ✅ Verify discovery feed still functions
- ✅ Test like/dislike actions still work
- ✅ Test match creation integration
- ✅ Test profile removal from discovery

#### Database Integrity
**Data Consistency:**
- ✅ Verify all existing data remains intact
- ✅ Test foreign key constraints
- ✅ Test data migration success
- ✅ Test backup/restore procedures

## Test Data Requirements

### User Accounts
- **Diverse User Types**: Free and Premium users
- **Conversation States**: Active, archived, blocked conversations
- **Message History**: Short and long conversation histories
- **Request States**: Pending, accepted, declined requests

### Message Scenarios
- **Content Variety**: Text, emoji, special characters
- **Timing Scenarios**: Recent and old messages
- **Read States**: Read and unread messages
- **Request Types**: Regular and Premium user requests

## Bug Reporting Format

### Critical Issues
- **Severity**: Critical
- **Impact**: Breaks core messaging functionality
- **Examples**: Messages not delivered, WebSocket failures, data loss

### High Priority Issues
- **Severity**: High
- **Impact**: Significantly impacts messaging experience
- **Examples**: Slow message delivery, UI freezes, incorrect read receipts

### Medium Priority Issues
- **Severity**: Medium
- **Impact**: Minor functionality issues
- **Examples**: Typing indicator glitches, timestamp formatting

### Low Priority Issues
- **Severity**: Low
- **Impact**: Cosmetic or minor usability issues
- **Examples**: Button alignment, color inconsistencies

## Success Criteria

### Functional Requirements
✅ **All messaging APIs function correctly**
✅ **Real-time messaging works reliably**
✅ **Message requests flow works as specified**
✅ **Enhanced match logic functions correctly**
✅ **Blocking and reporting work properly**

### Performance Requirements
✅ **Message delivery under 100ms**
✅ **API response times meet targets**
✅ **WebSocket connection stability > 99%**
✅ **App memory usage under 200MB during messaging**

### Quality Requirements
✅ **Zero critical bugs**
✅ **No high-priority bugs affecting core messaging**
✅ **All security tests pass**
✅ **Cross-platform consistency achieved**
✅ **Accessibility standards met**

## Test Automation

### Automated Test Coverage
- **API Contract Tests**: 100% endpoint coverage
- **WebSocket Tests**: Connection and event testing
- **Unit Tests**: Message store and service functions
- **Integration Tests**: Critical messaging flows

### Manual Test Coverage
- **UI/UX Testing**: Visual and interaction testing
- **Real-time Testing**: WebSocket behavior validation
- **Cross-Platform Testing**: Device-specific testing
- **Accessibility Testing**: Screen reader and motor testing

## Risk Assessment

### High Risk Areas
- **WebSocket Stability**: Critical for real-time messaging
- **Message Delivery**: Core functionality requirement
- **Performance Under Load**: Scalability concerns
- **Cross-Platform Consistency**: User experience uniformity

### Mitigation Strategies
- **Comprehensive WebSocket Testing**: Multiple connection scenarios
- **Load Testing**: Stress testing with high message volume
- **Monitoring**: Real-time performance monitoring
- **Fallback Mechanisms**: API fallback when WebSocket fails

## Phase 3 Testing Timeline

### Week 1: API and Backend Testing
- Day 1-2: Message API contract testing
- Day 3-4: WebSocket functionality testing
- Day 5: Business logic validation

### Week 2: UI and Frontend Testing
- Day 1-2: Messages interface testing
- Day 3-4: Chat screen testing
- Day 5: Real-time feature testing

### Week 3: Integration Testing
- Day 1-2: End-to-end messaging flows
- Day 3-4: Cross-platform testing
- Day 5: Performance testing

### Week 4: Final Validation
- Day 1-2: Security and accessibility testing
- Day 3-4: Edge case and regression testing
- Day 5: Final sign-off

Phase 3 testing ensures the messaging system provides reliable, real-time communication with excellent user experience and robust security, setting the foundation for premium features in Phase 4.