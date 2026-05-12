# REP Platform - Resource and Engagement Platform Backend

A comprehensive B2B backend service for managing resources, projects, and engagement across multiple agencies.

**Version:** 0.1.0
**Status:** Foundation Implementation (Phase 1-2)

## Start Here

If you want the simplest explanation first, read [SIMPLE_GUIDE.md](./SIMPLE_GUIDE.md).
It explains what the platform is, why it exists, how it works, and how it can help in plain English.

## Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for containerized setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/rep-platform-backend.git
cd rep-platform-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
docker-compose up -d  # Start PostgreSQL and Redis
npx prisma migrate dev
npm run seed

# Start development server
npm run dev
```

### Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run migrate      # Create/apply database migrations
npm run seed         # Populate database with seed data
npm run lint         # Lint code
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier
```

## Project Structure

```
src/
├── api/                # REST API
│   ├── controllers/    # HTTP request handlers
│   ├── middleware/     # Express middleware (auth, validation, error handling)
│   ├── routes/         # Route definitions
│   └── validators/     # Request validation schemas
├── services/           # Business logic
│   ├── auth/          # Authentication & authorization
│   ├── resource/      # Resource management
│   ├── project/       # Project management
│   ├── agency/        # Agency management
│   ├── financial/     # Financial calculations
│   ├── integration/   # External system integration
│   └── audit/         # Audit logging
├── repositories/       # Data access layer
├── models/             # Domain models and DTOs
├── infrastructure/     # Database, cache, queue clients
├── utils/              # Utility functions and helpers
├── config/             # Configuration files
└── main.ts             # Application entry point

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations

tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
└── fixtures/           # Test data

docker/
├── Dockerfile          # Container image
└── docker-compose.yml  # Local development stack
```

## API Documentation

API documentation is available at `/api-docs` when the server is running, or see [API.md](./API.md) for detailed endpoint documentation.

### Base URL

- **Development:** `http://localhost:3000/api/v1`
- **Staging:** `https://api-staging.rep-platform.com/api/v1`
- **Production:** `https://api.rep-platform.com/api/v1`

### Authentication

All endpoints (except `/auth/login` and `/health`) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer {access_token}
```

## Core Features

### Foundation Phase (Current)

- ✅ User authentication with JWT
- ✅ Role-based access control (RBAC)
- ✅ User management
- ✅ Resource management
- ✅ Project management
- ✅ Agency management
- ✅ Basic financial service (rate cards)
- ✅ Integration service stubs
- ✅ Error handling and validation
- ✅ Testing framework

### Planned Features

- [ ] Advanced analytics and forecasting
- [ ] Capacity planning
- [ ] External integrations (Workfront, Jira, Monday.com)
- [ ] Real-time notifications
- [ ] Audit logging and compliance
- [ ] Performance optimization and caching
- [ ] Advanced financial reporting

## Development Setup with Docker

```bash
# Start all services (PostgreSQL, Redis, API)
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f api

# Reset database
docker-compose down -v
docker-compose up
```

## Database Migrations

```bash
# Create a new migration after schema changes
npm run migrate

# Apply migrations to production database
npm run migrate:deploy

# Reset database (development only)
npm run migrate:reset

# Generate Prisma Client after schema changes
npm run prisma:generate
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Environment Variables

See `.env.example` for all available configuration options including:

- Database settings
- Redis configuration
- JWT secrets
- Email configuration
- External API credentials
- CORS settings
- Logging configuration

## Architecture

The backend follows a **layered architecture** pattern:

1. **API Layer** - Express.js routes and controllers handling HTTP requests
2. **Service Layer** - Business logic and domain rules
3. **Repository Layer** - Data access and database operations
4. **Persistence Layer** - PostgreSQL and Redis

Key design patterns:

- **Repository Pattern** - Abstract database operations
- **Service Layer Pattern** - Business logic isolation
- **Middleware Pattern** - Cross-cutting concerns
- **Adapter Pattern** - External integrations
- **Error Handling** - Custom error classes and centralized handler

## Security

- **JWT Authentication** - Secure token-based authentication
- **RBAC** - Role-based access control with granular permissions
- **Input Validation** - Request validation with express-validator
- **Rate Limiting** - DDoS protection with rate-limiter-flexible
- **Security Headers** - Helmet.js for HTTP security headers
- **Password Hashing** - bcrypt for secure password storage
- **HTTPS Enforcement** - TLS 1.3 for all connections

## Performance

- **Connection Pooling** - PostgreSQL connection pooling
- **Redis Caching** - In-memory caching for frequently accessed data
- **Query Optimization** - Indexed database queries
- **Response Compression** - gzip compression
- **Pagination** - Cursor-based pagination for large datasets

## Monitoring & Logging

- **Winston Logging** - Structured JSON logging
- **Health Checks** - Automatic health check endpoint
- **Error Tracking** - Centralized error logging
- **Metrics** - Request timing and endpoint metrics

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support & Resources

- **Documentation:** https://docs.rep-platform.com
- **API Reference:** See API.md
- **Issues:** https://github.com/your-org/rep-platform/issues
- **Email:** backend@rep-platform.com

---

**Last Updated:** February 19, 2026
**Maintained by:** Backend Engineering Team
