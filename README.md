# xibo-cms-sdk-js
This is a package to integrate Xibo CMS API authenticating via OAuth2.
A comprehensive nodeJS library for the Xibo CMS API with OAuth2 authentication, automatic retry logic, rate limiting support, and extensive error handling.


## Features

- **OAuth2 Authentication**: Support for both client credentials and authorization code flows
- **Automatic Token Management**: Token caching, refresh, and expiration handling
- **Retry Logic**: Exponential backoff with configurable retry attempts
- **Rate Limiting**: Intelligent handling of HTTP 429 responses with Retry-After support
- **Comprehensive Error Handling**: Detailed error types for different failure scenarios
- **Context Support**: Full context support for cancellation and timeouts
- **Structured Logging**: Configurable logging with different levels
- **Type Safety**: Strongly typed request/response models
- **Pagination Support**: Built-in pagination handling for list operations
- **Schema Generation**: Automated TypeScript type generation from Swagger 2.0 specification
- **Hybrid Architecture**: Generated low-level types + Enhanced runtime models with business logic


## Schema Generation & Type System

This SDK uses a sophisticated hybrid architecture that combines automatically generated types with enhanced runtime models to provide both compile-time safety and rich functionality.

### Architecture Overview

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Swagger 2.0 API  │───▶│  Generated Types     │───▶│  Enhanced Models    │
│   Specification     │    │  (Low-level)         │    │  (Business Logic)   │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
                                      │                           │
                                      ▼                           ▼
                           ┌──────────────────────┐    ┌─────────────────────┐
                           │   API Classes        │───▶│   SDK Client        │
                           │   (HTTP Layer)       │    │   (Public API)      │
                           └──────────────────────┘    └─────────────────────┘
```

### 1. Generated Types (Low-Level)

Located in `src/generated/types/swagger-types.ts`, these types are automatically generated from the Xibo CMS Swagger 2.0 specification:

```typescript
// Auto-generated from Swagger - DO NOT EDIT
export interface Display {
  displayId?: number;
  display?: string;
  licensed?: boolean; // Transformed from 0/1 integer flag
  lastAccessed?: string; // ISO date string (transformed from Unix timestamp)
  // ... 50+ other properties
}
```

**Key Features:**
- 74 TypeScript interfaces covering all Xibo CMS entities
- Automatic boolean transformations (0/1 → boolean)
- Date transformations (Unix timestamps → ISO strings)
- JSDoc comments from Swagger descriptions
- Utility types for API responses and pagination

### 2. Enhanced Runtime Models (High-Level)

Located in `src/models/`, these classes extend generated types with business logic:

```typescript
// Hand-crafted with business logic
export class Display implements GeneratedDisplay {
  constructor(private data: GeneratedDisplay) {}

  // Enhanced methods
  get isLicensed(): boolean {
    return Boolean(this.data.licensed);
  }

  isAuditingActive(): boolean {
    const until = this.auditingUntilDate;
    return until ? until > new Date() : false;
  }

  getStatusSummary(): DisplayStatus {
    return {
      isOnline: this.isLoggedIn,
      isLicensed: this.isLicensed,
      hasRecentActivity: this.hasRecentActivity(),
      auditingStatus: this.isAuditingActive() ? 'active' : 'inactive'
    };
  }

  // 20+ utility methods...
}
```

### 3. Generation Process

#### Automatic Generation

The type generation process is fully automated:

```bash
# Generate types from Swagger specification
npm run generate:types

# This runs:
# 1. scripts/generate-types.js - Parses Swagger 2.0 and generates TypeScript
# 2. scripts/post-process-types.js - Applies transformations and enhancements
```

#### Generation Scripts

**`scripts/generate-types.js`** - Main generator:
- Parses `expected-data-results/xibo-cms-develop-swagger.json`
- Converts Swagger 2.0 definitions to TypeScript interfaces
- Handles complex nested objects and arrays
- Generates 74 interfaces with proper type mappings

**`scripts/post-process-types.js`** - Post-processor:
- **Boolean transformations**: `licensed: 0|1` → `licensed?: boolean`
- **Date transformations**: `lastAccessed: number` → `lastAccessed?: string`
- **JSDoc comments**: Adds descriptions from Swagger spec
- **Utility types**: Adds response wrappers and entity maps
- **Quality assurance**: Validates generated code syntax

#### Key Transformations Applied

1. **Boolean Flags** (26+ transformations):
   ```typescript
   // Before: licensed?: number; // 0 or 1
   // After:  licensed?: boolean; // Transformed from 0/1 integer flag
   ```

2. **Date/Time Fields** (15+ transformations):
   ```typescript
   // Before: lastAccessed?: number; // Unix timestamp
   // After:  lastAccessed?: string; // ISO date string (transformed from Unix timestamp)
   ```

3. **Enhanced Documentation**:
   ```typescript
   /**
    * A flag indicating whether this Display is licensed or not
    */
   licensed?: boolean; // Transformed from 0/1 integer flag
   ```

### 4. Usage in API Classes

API classes bridge raw HTTP responses with enhanced models:

```typescript
export class DisplaysApi extends BaseApi {
  async search(params?: DisplaySearchParams): Promise<PaginatedResponse<Display>> {
    // HTTP request returns raw data matching generated types
    const response = await this.httpClient.get<GeneratedDisplay[]>('/display', { params });

    // Transform to enhanced models with business logic
    const displays = response.data.map(raw => Display.fromApiData(raw));

    return {
      data: displays, // Enhanced Display instances
      total: response.headers['x-total-count'] || displays.length,
      // ... pagination metadata
    };
  }
}
```

### 5. Development Workflow

#### For Contributors

1. **Never edit generated files manually**:
   ```
   src/generated/types/swagger-types.ts  ⚠️  DO NOT EDIT
   ```

2. **Update generation scripts instead**:
   ```bash
   # Modify transformation logic
   vim scripts/post-process-types.js
   
   # Regenerate types
   npm run generate:types
   ```

3. **Add business logic to models**:
   ```bash
   # Enhance runtime models
   vim src/models/Display.ts
   ```

#### For API Updates

When the Xibo CMS API changes:

1. **Update Swagger specification**:
   ```bash
   # Download latest swagger.json
   curl -o expected-data-results/xibo-cms-develop-swagger.json \
     https://raw.githubusercontent.com/xibosignage/xibo-cms/develop/web/swagger.json
   ```

2. **Regenerate types**:
   ```bash
   npm run generate:types
   ```

3. **Update enhanced models** (if needed):
   ```bash
   # Add new utility methods or update existing ones
   vim src/models/Display.ts
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

### 6. Benefits of This Architecture

- **🔒 Compile-time Safety**: Generated types ensure API compatibility
- **🔄 Runtime Validation**: Zod schemas validate and transform data
- **🚀 Enhanced Functionality**: Models provide business logic and utilities
- **🔧 Maintainability**: Generated types auto-update with API changes
- **💡 Developer Experience**: IntelliSense and type checking throughout
- **📚 Self-Documenting**: JSDoc comments from Swagger descriptions

### 7. Package Scripts

```json
{
  "scripts": {
    "generate:types": "node scripts/generate-types.js",
    "postgenerate:types": "node scripts/post-process-types.js",
    "generate": "npm run generate:types && npm run postgenerate:types",
    "prepublishOnly": "npm run generate && npm run build && npm run test"
  }
}
```

---
## Project Overview
Create a npm package called xibo-cms-sdk that provides an SDK for developers to programmatically use the Xibo CMS API. Package should simplify authenticating with Xibo CMS API via OAuth2 provider integration.  
Provides TypeScript-native abstractions—such as client classes, typed models, interfaces, and helper methods—to streamline working with all major Xibo CMS services.

### Review xibo-cms-sdk-js respository
https://github.com/aguilita1/xibo-cms-sdk-js

### Review Xibo CMS API
https://github.com/xibosignage/xibo-cms/blob/develop/web/swagger.json

### Create REST API Endpoint Wrappers. 
Define NodeJS interfaces, types, classs for request and response payloads for Xibo CMS API OpenAPI/Swagger (https://github.com/xibosignage/xibo-cms/blob/develop/web/swagger.json). Implement client methods for each REST API endpoints in Miscellaneous, Schedules, Notifications, Layouts, Playlists, Widgets, Campaigns, Templates, Resolutions, Libraries, Displays, Display Groups, Display Settings, DataSets, Folders, Statistics, Users, User Groups, Modules, Commands, Dayparting, and Tags. Handle pagination, and error codes. Support context for cancellation and timeouts.

### Create an OAuth2 Authentication Module.
Leverage https://www.npmjs.com/package/simple-oauth2 for implementation. Implement OAuth2 client credentials flow for grant types: access_code and client_credentials. Create a token manager to cache, refresh, and store access tokens. Implement secure handling of client secrets via environment variables. Support token expiration and automatic refresh logic. 

### Create HTTP client layer.
Create a reusable HTTP client with configurable timeouts. Set up request middleware to inject Bearer tokens from the OAuth2 module. Implement centralized error handling, and retries for transient failures. Use a constant that globally sets number of retry attempts for each client call. Log errors at error severity, retries at warn severity, max retry limit breached at error severity. Add request/response logging at debug severity.

### Add retry logic to HTTP client layer to handle API rate limiting.
Xibo Cloud imposes rate limits on connections to the XIBO CMS API to ensure performance for all users. Exceeding these limits may result in an HTTP 429 "Too Many Requests" error.  When a 429 error is received, the SDK should slow down its request rate. If a Retry-After header is present in the response, the SDK should wait for the specified duration before retrying the request. If Retry-After is absent, it is conventional to wait for the collection interval, a constant that can be set globally for SDK, before retrying the request. If Retry-After logic fails SDK should raise exception for failed request.

### Create tests and mocks for code base.
Unit test OAuth2 logic (mocking token server responses). Unit test SDK methods with mocked HTTP responses. 
Add integration tests.

### Document package.
Write README with installation, build, test, usage, and examples (how a developer can use SDK to authenticate and call Xibo CMS API). Document public methods and exported types using TypeDoc.  Include authentication setup guide (e.g., how to obtain credentials). Add API coverage and limitations.

### Create Github Action CI/CD pipeline.
Create a pipeline that builds, tests, performs linter, static code analysis, scan for security vulnerabilities, and scan for dependency vulnerabilities, enable semantic versioning, publish package to npm with provenance.
