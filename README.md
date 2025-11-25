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
