# Xibo CMS SDK Implementation Plan

Based on my review of the requirements and the Xibo CMS API documentation, here's a detailed implementation plan for the xibo-cms-sdk-js package:

## 1. Project Structure

```
xibo-cms-sdk-js/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── client/
│   │   ├── XiboClient.ts        # Main SDK client class
│   │   ├── HttpClient.ts        # HTTP client with retry logic
│   │   └── index.ts
│   ├── auth/
│   │   ├── OAuth2Manager.ts     # OAuth2 authentication handler
│   │   ├── TokenManager.ts      # Token caching and refresh
│   │   └── index.ts
│   ├── api/
│   │   ├── base/
│   │   │   ├── BaseApi.ts       # Base class for all API endpoints
│   │   │   └── ApiResponse.ts   # Response wrapper
│   │   ├── miscellaneous/
│   │   ├── schedules/
│   │   ├── notifications/
│   │   ├── layouts/
│   │   ├── playlists/
│   │   ├── widgets/
│   │   ├── campaigns/
│   │   ├── templates/
│   │   ├── resolutions/
│   │   ├── library/
│   │   ├── displays/
│   │   ├── displayGroups/
│   │   ├── displayProfiles/
│   │   ├── datasets/
│   │   ├── folders/
│   │   ├── statistics/
│   │   ├── users/
│   │   ├── userGroups/
│   │   ├── modules/
│   │   ├── commands/
│   │   ├── dayparts/
│   │   └── tags/
│   ├── models/
│   │   ├── index.ts
│   │   └── [model files for each entity]
│   ├── errors/
│   │   ├── XiboError.ts
│   │   ├── AuthenticationError.ts
│   │   ├── RateLimitError.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── retry.ts
│   │   ├── pagination.ts
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── mocks/
├── docs/
├── examples/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
└── README.md
```

## 2. Core Components Implementation

### 2.1 OAuth2 Authentication Module
```typescript
// Key features:
- Client credentials flow
- Authorization code flow  
- Automatic token refresh
- Token caching with expiration handling
- Secure credential management via environment variables
```

### 2.2 HTTP Client Layer
```typescript
// Features:
- Configurable timeouts
- Bearer token injection middleware
- Centralized error handling
- Exponential backoff retry logic
- Rate limiting with HTTP 429 handling
- Request/response logging
- Context support for cancellation
```

### 2.3 API Endpoint Wrappers
Each API module will follow this pattern:
```typescript
class LayoutsApi extends BaseApi {
  async search(params: LayoutSearchParams, context?: Context): Promise<PaginatedResponse<Layout>>
  async get(id: number, context?: Context): Promise<Layout>
  async create(data: CreateLayoutDto, context?: Context): Promise<Layout>
  async update(id: number, data: UpdateLayoutDto, context?: Context): Promise<Layout>
  async delete(id: number, context?: Context): Promise<void>
}
```

### 2.4 Error Handling Strategy
```typescript
- XiboError (base error class)
- AuthenticationError (401 errors)
- AuthorizationError (403 errors)
- NotFoundError (404 errors)
- ValidationError (400 errors)
- RateLimitError (429 errors with retry-after)
- ServerError (5xx errors)
```

## 3. Key Features Implementation

### 3.1 Rate Limiting Handler
```typescript
class RateLimitHandler {
  - Parse Retry-After header
  - Implement exponential backoff
  - Queue management for rate-limited requests
  - Global collection interval constant
}
```

### 3.2 Pagination Support
```typescript
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}
```

### 3.3 Context Support
```typescript
interface Context {
  signal?: AbortSignal
  timeout?: number
  retryAttempts?: number
}
```

## 4. Configuration

### 4.1 SDK Configuration
```typescript
interface XiboConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  grantType: 'client_credentials' | 'authorization_code'
  tokenEndpoint?: string
  authorizeEndpoint?: string
  maxRetries?: number
  collectionInterval?: number
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  timeout?: number
}
```

## 5. Testing Strategy

### 5.1 Unit Tests
- OAuth2 logic with mocked token server
- Individual API methods with mocked responses
- Error handling scenarios
- Retry logic testing
- Rate limiting behavior

### 5.2 Integration Tests
- End-to-end authentication flow
- API endpoint integration
- Error recovery scenarios

### 5.3 Mocks
- Mock server for API responses
- Token server mocks
- Network error simulations

## 6. Documentation Plan

### 6.1 README Structure
- Installation instructions
- Quick start guide
- Authentication setup
- Basic usage examples
- Advanced features
- API coverage matrix
- Troubleshooting

### 6.2 TypeDoc Documentation
- All public methods
- Interfaces and types
- Usage examples in comments
- Parameter descriptions

## 7. CI/CD Pipeline (GitHub Actions)

```yaml
Workflow stages:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run linter (ESLint)
5. Run formatter check (Prettier)
6. Run tests with coverage
7. Static code analysis (SonarCloud)
8. Security vulnerability scan (npm audit)
9. Dependency vulnerability scan (Snyk)
10. Build package
11. Generate documentation
12. Semantic versioning
13. Publish to npm with provenance
```

## 8. Implementation Priorities

### Phase 1: Core Infrastructure (Week 1)
- Project setup and configuration
- OAuth2 authentication module
- HTTP client with basic retry logic
- Base API class
- Error handling framework

### Phase 2: Essential APIs (Week 2)
- Layouts API
- Campaigns API
- Displays API
- Library/Media API
- Basic models and types

### Phase 3: Extended APIs (Week 3)
- Remaining API endpoints
- Advanced features (pagination, filtering)
- Rate limiting implementation
- Context support

### Phase 4: Testing & Documentation (Week 4)
- Comprehensive unit tests
- Integration tests
- Documentation generation
- Example applications
- CI/CD pipeline setup

### Phase 5: Polish & Release (Week 5)
- Performance optimization
- Security audit
- npm package preparation
- Release documentation
- GitHub Actions workflow

## 9. Key Dependencies

```json
{
  "dependencies": {
    "simple-oauth2": "^5.0.0",
    "axios": "^1.6.0",
    "winston": "^3.11.0",
    "p-retry": "^5.1.2",
    "p-queue": "^7.4.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "typedoc": "^0.25.4",
    "@types/node": "^20.10.0"
  }
}
```

## 10. Success Metrics

- 100% API endpoint coverage
- >90% test coverage
- Zero critical security vulnerabilities
- <2s average response time for API calls
- Automatic retry success rate >95%
- npm weekly downloads growth
- GitHub stars and community engagement