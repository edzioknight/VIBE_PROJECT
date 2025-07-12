# VibesMatch Backend API

A comprehensive dating app backend built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- **Authentication System**: OTP-based and Google OAuth authentication
- **User Management**: Complete user profile management with multi-step onboarding
- **Photo Upload**: Secure photo upload with validation and processing
- **Rate Limiting**: Redis-based rate limiting for security
- **Input Validation**: Comprehensive input validation using Zod
- **Error Handling**: Centralized error handling with detailed logging
- **Security**: JWT tokens, CORS, Helmet, and input sanitization
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and rate limiting
- **Logging**: Structured logging with Winston
- **Testing**: Jest testing framework with comprehensive coverage

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT tokens
- **File Storage**: AWS S3
- **Validation**: Zod
- **Testing**: Jest
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Redis server
- AWS S3 bucket (for photo storage)
- SMTP server (for email sending)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vibesmatch-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Environment Variables

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens

### Optional Variables

- `REDIS_URL`: Redis connection string (default: redis://localhost:6379)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production/test)

### Email Configuration

- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `FROM_EMAIL`: From email address
- `FROM_NAME`: From name

### AWS S3 Configuration

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_BUCKET_NAME`: S3 bucket name
- `AWS_REGION`: AWS region

### Google OAuth Configuration

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## API Endpoints

### Authentication

- `POST /api/v1/auth/send-otp` - Send OTP to email
- `POST /api/v1/auth/verify-otp` - Verify OTP and authenticate
- `POST /api/v1/auth/google-signin` - Google OAuth sign-in
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/status` - Get authentication status

### Signup Flow

- `POST /api/v1/auth/signup/basic-info` - Complete basic information
- `POST /api/v1/auth/signup/location` - Complete location information
- `POST /api/v1/auth/signup/lifestyle` - Complete lifestyle information
- `POST /api/v1/auth/signup/preferences` - Complete preferences
- `POST /api/v1/auth/signup/personality` - Complete personality information
- `POST /api/v1/auth/signup/photos` - Upload photos and complete signup

### User Management

- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/onboarding-status` - Get onboarding status
- `GET /api/v1/users/check-exists` - Check if user exists by email

### System

- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1` - API information

## Database Schema

### Users Table

Stores complete user profiles including:
- Basic information (name, email, date of birth, gender)
- Location (country, state, city)
- Lifestyle information (exercise, education, job, etc.)
- Relationship preferences
- Personality traits and interests
- Settings and subscription status

### Auth Tokens Table

Manages JWT refresh tokens with:
- Token hash for security
- Expiration tracking
- Revocation status

### OTP Codes Table

Handles one-time password verification:
- Email-based OTP delivery
- Expiration and attempt tracking
- Rate limiting support

### User Sessions Table

Tracks active user sessions:
- Device information
- IP address and user agent
- Activity timestamps

## Security Features

### Authentication
- JWT-based authentication with access and refresh tokens
- OTP verification for email-based authentication
- Google OAuth integration
- Secure token storage and rotation

### Input Validation
- Zod schema validation for all endpoints
- Request sanitization
- File upload validation
- SQL injection prevention via Prisma ORM

### Rate Limiting
- Redis-based rate limiting
- Different limits for different endpoints
- IP and user-based limiting
- Configurable time windows

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Content Security Policy
- XSS protection

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": ["Additional error details"]
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_OTP`: Invalid or expired OTP
- `USER_NOT_FOUND`: User does not exist
- `INVALID_TOKEN`: Invalid or expired token
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

### Production Build

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Run database migrations:
```bash
npm run db:migrate
```

4. Start the production server:
```bash
npm start
```

### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
# Build Docker image
docker build -t vibesmatch-backend .

# Run container
docker run -p 3000:3000 --env-file .env vibesmatch-backend
```

## Monitoring and Logging

### Logging
- Structured JSON logging with Winston
- Different log levels (error, warn, info, debug)
- Request/response logging
- Error tracking with stack traces

### Health Checks
- Database connectivity check
- Redis connectivity check
- System health endpoint at `/api/v1/health`

### Metrics
- Request rate limiting metrics
- Authentication success/failure rates
- Error rate monitoring
- Performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.