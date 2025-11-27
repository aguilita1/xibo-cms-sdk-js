# Xibo CMS SDK Implementation Plan

Based on my review of the requirements and the Xibo CMS API documentation, here's a detailed implementation plan for the xibo-cms-sdk-js package:

## 1. Project Structure (Industry Standard)

```
xibo-cms-sdk-js/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── generated/               # ✔ Generated from Swagger - DO NOT EDIT
│   │   └── types/
│   │       └── swagger-types.ts # All generated schemas in one file
│   ├── client/
│   │   ├── XiboClient.ts        # Main SDK client class
│   │   ├── HttpClient.ts        # HTTP client with retry logic
│   │   └── index.ts
│   ├── auth/
│   │   ├── OAuth2Manager.ts     # OAuth2 authentication handler
│   │   ├── TokenManager.ts      # Token caching and refresh
│   │   └── index.ts
│   ├── api/                     # ✔ Hand-crafted endpoint implementations
│   │   ├── base/
│   │   │   ├── BaseApi.ts       # Base class for all API endpoints
│   │   │   └── ApiResponse.ts   # Response wrapper
│   │   ├── displays/
│   │   │   ├── Displays.ts      # Display API implementation
│   │   │   └── index.ts
│   │   ├── layouts/
│   │   ├── playlists/
│   │   ├── campaigns/
│   │   ├── schedules/
│   │   ├── notifications/
│   │   ├── widgets/
│   │   ├── templates/
│   │   ├── resolutions/
│   │   ├── library/
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
│   │   ├── tags/
│   │   └── miscellaneous/
│   ├── models/                  # ✔ Enhanced runtime models with methods
│   │   ├── Display.ts           # Enhanced Display model with utilities
│   │   ├── Layout.ts            # Enhanced Layout model
│   │   ├── Campaign.ts          # Enhanced Campaign model
│   │   ├── Schedule.ts          # Enhanced Schedule model
│   │   ├── Playlist.ts          # Enhanced Playlist model
│   │   ├── Widget.ts            # Enhanced Widget model
│   │   └── index.ts
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
│   └── types/                   # ✔ Internal SDK types (not generated)
│       ├── api-types.ts         # Request/response wrappers
│       ├── config-types.ts      # SDK configuration types
│       └── index.ts
├── scripts/                     # Build and generation scripts
│   ├── generate-types.js        # Schema generation script
│   └── post-process-types.js    # Post-processing for generated types
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
### 1.1 Responsibilities of post-processing script `post-process-types.js`
- Strip unsupported Swagger extensions if present.
- Fix nullable/optional fields if the generator misses them.
- Convert Swagger-style enums into TypeScript enums or unions.
- Extract JSDoc comments or metadata for documentation.
- (Optional) Split the large generated file into smaller chunks (but only if needed).

### 1.2 Keep generated code fully automated and never manually edit
- No manual edits allowed in generated/ folder.
- Update documentation to warn contributors
- Run npm run generate before committing or publishing.

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
Each API module will follow this pattern but only implement endpoints available in API:
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

### 6.3 TypeScript Examples
Each TypeScript example will use `./env` file to load environment variables.

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

### ✅ Phase 1: Core Infrastructure (Week 1) - COMPLETED
- ✅ Project setup and configuration
  - ✅ TypeScript configuration with strict mode
  - ✅ ESLint and Prettier setup
  - ✅ Jest configuration for testing
  - ✅ Package.json with all dependencies
- ✅ OAuth2 authentication module
  - ✅ OAuth2Manager with client credentials and authorization code flows
  - ✅ TokenManager with caching and automatic refresh
  - ✅ TokenStorage interface with in-memory implementation
- ✅ HTTP client with retry logic
  - ✅ HttpClient with axios integration
  - ✅ Automatic Bearer token injection
  - ✅ Exponential backoff retry logic
  - ✅ Rate limiting with HTTP 429 handling
  - ✅ Request/response logging
- ✅ Error handling framework
  - ✅ XiboError base class
  - ✅ Specific error types (Authentication, Authorization, NotFound, Validation, Server, RateLimit)
  - ✅ Type guards for error identification
- ✅ Core utilities
  - ✅ Logger with Winston integration
  - ✅ Pagination utilities with iterator pattern
  - ✅ Context support for cancellation and timeouts
- ✅ Main SDK client (XiboClient)
  - ✅ Configuration management
  - ✅ Connection testing
  - ✅ Authentication status monitoring

### 🔄 Phase 2: Schema Generation & Essential API endpoints (Week 2) - IN PROGRESS
- ✅ Base API class implementation
- ✅ Displays API + comprehensive unit tests
- [ ] **Schema Generation from Swagger** (PRIORITY)
  - [ ] Install openapi-typescript and zod for runtime validation and zod transformers
  - [ ] Generate types from Swagger: `src/generated/types/swagger-types.ts`
  - [ ] Create generation script with post-processing
  - [ ] Add npm scripts for type generation
  - [ ] Implement Zod schemas for runtime validation and transformers
- [ ] **Enhanced Runtime Models** (uses generated types as base)
  - [ ] Display.ts - Enhanced model with utility methods
  - [ ] Layout.ts - Enhanced model with validation
  - [ ] Campaign.ts - Enhanced model with business logic
  - [ ] Schedule.ts - Enhanced model with date handling
  - [ ] Playlist.ts - Enhanced model with duration calculations
  - [ ] Widget.ts - Enhanced model with type safety
- [ ] **API Endpoint Implementations** (hand-crafted, never generated)
  - [ ] Layouts API + unit tests
  - [ ] Playlists API + unit tests
  - [ ] Schedules API + unit tests
  - [ ] Campaigns API + unit tests
  - [ ] Widgets API + unit tests

### Phase 3: Extended API endpoints (Week 3)
- [ ] Notifications + unit tests
- [ ] Library/Media + unit tests
- [ ] Resolutions + unit tests
- [ ] Display Groups + unit tests
- [ ] Display Settings + unit tests
- [ ] DataSets including `PUT /dataset/{id}/selectfolder` + unit tests
- [ ] Folders + unit tests
- [ ] Statistics + unit tests
- [ ] Users + unit tests
- [ ] User Groups + unit tests
- [ ] Commands + unit tests
- [ ] Dayparting + unit tests
- [ ] Player Software + unit tests
- [ ] Tags + unit tests
- [ ] Menu Boards + unit tests << Mark as Preview ONLY - Not for Production Use
- [ ] Player Software + unit tests
- [ ] Action + unit tests
- [ ] Display Venue + unit tests
- [ ] Fonts + unit tests
- [ ] Sync Groups + unit tests
- [ ] Advanced features (pagination, filtering)
- [ ] Complete rate limiting implementation
- [ ] Enhanced context support

### Phase 4: Testing & Documentation (Week 4)
- [ ] Comprehensive unit tests
- [ ] Integration tests
- [ ] Documentation generation
- [ ] Example applications
- [ ] CI/CD pipeline setup

### Phase 5: Polish & Release (Week 5)
- [ ] Performance optimization
- [ ] Security audit
- [ ] npm package preparation
- [ ] Release documentation
- [ ] GitHub Actions workflow

## 9. Key Dependencies

```json
{
  "dependencies": {
    "simple-oauth2": "^5.0.0",
    "axios": "^1.6.0",
    "winston": "^3.11.0",
    "p-retry": "^5.1.2",
    "p-queue": "^7.4.1",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "typedoc": "^0.25.4",
    "@types/node": "^20.10.0",
    "openapi-typescript": "^6.7.0"
  },
  "scripts": {
    "generate:types": "openapi-typescript expected-data-results/xibo-cms-develop-swagger.json --output src/generated/types/swagger-types.ts",
    "postgenerate:types": "node scripts/post-process-types.js",
    "generate": "npm run generate:types && npm run postgenerate:types"
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
