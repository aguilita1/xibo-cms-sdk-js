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
- **Swagger 2.0 Specific Transformations**:
  - Convert integer timestamps (Unix epoch) to Date-compatible string types
  - Transform 0/1 integer flags to boolean types where semantically appropriate
  - Handle Swagger 2.0 `formData` parameters and convert to TypeScript interfaces
  - Fix array types that may be incorrectly generated from Swagger 2.0 syntax
- **Type Enhancement**:
  - Strip unsupported Swagger extensions if present
  - Fix nullable/optional fields if the generator misses them
  - Convert Swagger-style enums into TypeScript enums or unions
  - Add JSDoc comments from Swagger descriptions for better IntelliSense
  - Ensure consistent naming conventions (camelCase for properties)
- **Quality Assurance**:
  - Validate generated types don't have circular references
  - Ensure all required fields are properly marked as non-optional
  - Add type guards for discriminated unions where applicable
  - (Optional) Split the large generated file into smaller chunks if performance becomes an issue
- **Documentation Integration**:
  - Extract operation IDs and map them to method names for API classes
  - Generate parameter interfaces for complex endpoint inputs
  - Create response type mappings for each endpoint

### 1.2 Keep generated code fully automated and never manually edit
- No manual edits allowed in generated/ folder.
- Update documentation to warn contributors
- Run npm run generate before committing or publishing.

## 1.3. Schema Generation Strategy

The SDK uses a hybrid approach combining generated types with enhanced runtime models:

### 1.3.1 Generated Types (Low-Level)
```typescript
// src/generated/types/swagger-types.ts (auto-generated)
export interface Display {
  displayId?: number;
  display?: string;
  auditingUntil?: string; // ISO date string
  licensed?: number; // 0 or 1
  // ... other properties as defined in Swagger
}

export interface Campaign {
  campaignId?: number;
  campaign?: string;
  isLayoutSpecific?: number; // 0 or 1
  // ... other properties
}
```

### 1.3.2 Enhanced Runtime Models
```typescript
// src/models/Display.ts (hand-crafted)
import { Display as GeneratedDisplay } from '../generated/types/swagger-types';
import { z } from 'zod';

// Zod schema with transformers for runtime validation
export const DisplaySchema = z.object({
  displayId: z.number().optional(),
  display: z.string().optional(),
  auditingUntil: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  licensed: z.number().transform(val => Boolean(val)).optional(),
  // ... other fields with appropriate transformations
});

export class Display implements GeneratedDisplay {
  constructor(private data: GeneratedDisplay) {}

  // Enhanced methods
  get isLicensed(): boolean {
    return Boolean(this.data.licensed);
  }

  get auditingUntilDate(): Date | undefined {
    return this.data.auditingUntil ? new Date(this.data.auditingUntil) : undefined;
  }

  isAuditingActive(): boolean {
    const until = this.auditingUntilDate;
    return until ? until > new Date() : false;
  }

  // Proxy all original properties
  get displayId() { return this.data.displayId; }
  get display() { return this.data.display; }
  // ... other properties
}
```

### 1.3.3 API Integration Pattern
```typescript
// src/api/displays/Displays.ts
import { Display as GeneratedDisplay } from '../../generated/types/swagger-types';
import { Display } from '../../models/Display';

export class DisplaysApi extends BaseApi {
  async search(params: DisplaySearchParams): Promise<PaginatedResponse<Display>> {
    const response = await this.httpClient.get<GeneratedDisplay[]>('/display', { params });

    // Transform raw API response to enhanced models
    const displays = response.data.map(raw => new Display(raw));

    return {
      data: displays,
      total: response.headers['x-total-count'] || displays.length,
      // ... pagination metadata
    };
  }
}
```

### 1.3.4 Type Safety Benefits
- **Compile-time safety**: Generated types ensure API compatibility
- **Runtime validation**: Zod schemas validate and transform data
- **Enhanced functionality**: Models provide business logic and utilities
- **Maintainability**: Generated types auto-update with API changes
- **Developer experience**: IntelliSense and type checking throughout

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
- [ ] **Schema Generation from Swagger** (PRIORITY - Day 1-2)
  - ✅ Install dependencies: `npm install -D openapi-typescript@latest zod@^latest`
  - ✅ Create `scripts/generate-types.js` - Main generation orchestrator
  - ✅ Create `scripts/post-process-types.js` - Swagger 2.0 transformations
  - ✅ Generate initial types: `npm run generate:types`
  - ✅ Verify generated types compile without errors
  - ✅  Test post-processing script with sample transformations
  - ✅ Document generation process in README
- [ ] **Enhanced Runtime Models** (Day 3-4 - uses generated types as base)
  - ✅ Create `src/models/Display.ts`:
    - ✅ Zod schema with boolean/date transformers
    - ✅ Enhanced methods: `isLicensed()`, `isAuditingActive()`, `getStatusSummary()`
    - ✅ Unit tests for transformations and methods
  - [ ] Create `src/models/Layout.ts`:
    - [ ] Status enum handling (Published/Draft)
    - [ ] Duration calculations and validation
    - [ ] Region management utilities
  - [ ] Create `src/models/Campaign.ts`:
    - [ ] Type discrimination (list vs ad campaigns)
    - [ ] Layout assignment validation
    - [ ] Playback cycle calculations
  - [ ] Create `src/models/Schedule.ts`:
    - [ ] Date/time handling with timezone support
    - [ ] Recurrence pattern validation
    - [ ] Event conflict detection utilities
  - [ ] Create `src/models/Playlist.ts`:
    - [ ] Dynamic vs static playlist handling
    - [ ] Duration calculations for all widgets
    - [ ] Media filtering and sorting utilities
  - [ ] Create `src/models/Widget.ts`:
    - [ ] Type-safe widget configuration
    - [ ] Duration and transition handling
    - [ ] Validation for widget-specific properties
- [ ] **API Endpoint Implementations** (Day 5-7 - hand-crafted, never generated)
  - [ ] Layouts API:
    - [ ] CRUD operations with enhanced Layout models
    - [ ] Background image/color management
    - [ ] Template application and checkout/publish workflow
    - [ ] Comprehensive unit tests with mocked responses
  - [ ] Playlists API:
    - [ ] Dynamic playlist filter management
    - [ ] Media assignment and ordering
    - [ ] Widget management within playlists
    - [ ] Unit tests covering all playlist operations
  - [ ] Schedules API:
    - [ ] Event creation with recurrence patterns
    - [ ] Display group assignment validation
    - [ ] Geo-location and daypart handling
    - [ ] Unit tests for complex scheduling scenarios
  - [ ] Campaigns API:
    - [ ] Layout assignment and ordering
    - [ ] Ad campaign targeting and metrics
    - [ ] Cycle-based playback configuration
    - [ ] Unit tests for campaign lifecycle
  - [ ] Widgets API:
    - [ ] Widget creation with type validation
    - [ ] Configuration management per widget type
    - [ ] Transition and timing controls
    - [ ] Unit tests for widget-specific functionality

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
    "openapi-typescript": "^6.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "nock": "^13.4.0",
    "msw": "^2.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0",
    "semantic-release": "^22.0.0",
    "@semantic-release/changelog": "^6.0.0",
    "@semantic-release/git": "^10.0.0"
  },
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "clean": "rm -rf dist coverage .nyc_output",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"tests/**/*.ts\"",
    "generate:types": "openapi-typescript expected-data-results/xibo-cms-develop-swagger.json --output src/generated/types/swagger-types.ts",
    "postgenerate:types": "node scripts/post-process-types.js",
    "generate": "npm run generate:types && npm run postgenerate:types",
    "docs": "typedoc --out docs src/index.ts",
    "docs:serve": "npx http-server docs -p 8080",
    "prepublishOnly": "npm run clean && npm run generate && npm run build && npm run test",
    "release": "semantic-release",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  }
}
```

### 9.1 Additional Development Tools
- **nock**: HTTP request mocking for unit tests
- **msw**: Mock Service Worker for integration testing
- **ts-jest**: TypeScript preprocessor for Jest
- **husky**: Git hooks for code quality enforcement
- **lint-staged**: Run linters on staged files only
- **semantic-release**: Automated versioning and publishing

### 9.2 Code Quality & CI/CD Integration
- **ESLint + TypeScript**: Comprehensive linting with TypeScript support
- **Prettier**: Consistent code formatting
- **Pre-commit hooks**: Automatic linting and formatting before commits
- **Coverage reporting**: Jest coverage with threshold enforcement
- **Automated releases**: Semantic versioning with changelog generation

## 10. Success Metrics

- 100% API endpoint coverage
- >90% test coverage
- Zero critical security vulnerabilities
- <2s average response time for API calls
- Automatic retry success rate >95%
- npm weekly downloads growth
- GitHub stars and community engagement
