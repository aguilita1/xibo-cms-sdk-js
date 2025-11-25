# Xibo CMS SDK Examples

This directory contains example applications demonstrating how to use the Xibo CMS SDK.

## Setup

Before running any examples, you need to configure your Xibo CMS credentials:

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your Xibo CMS credentials:**
   ```env
   # Xibo CMS API Configuration
   XIBO_BASE_URL=https://your-xibo-cms.example.com/api
   XIBO_CLIENT_ID=your_client_id
   XIBO_CLIENT_SECRET=your_client_secret
   XIBO_TOKEN_URL=https://your-xibo-cms.example.com/api/authorize/access_token
   XIBO_AUTH_URL=https://your-xibo-cms.example.com/api/authorize

   # Optional Configuration
   XIBO_LOG_LEVEL=info
   XIBO_DEBUG=false
   ```

3. **Build the SDK:**
   ```bash
   npm run build
   ```

## Available Examples

### Basic Usage (JavaScript)
Demonstrates basic SDK functionality including authentication, connection testing, and error handling.

**Run:**
```bash
npm run example:js
# or
node examples/basic-usage.js
```

### Basic Usage (TypeScript)
Same functionality as the JavaScript example but with full TypeScript type safety and additional features.

**Run:**
```bash
npm run example:ts
# or
npx ts-node examples/basic-usage.ts
```

## Example Features Demonstrated

- ✅ **Environment-based configuration** - Load credentials from `.env` file
- ✅ **Connection testing** - Verify connectivity to Xibo CMS
- ✅ **Authentication** - OAuth2 client credentials flow
- ✅ **Error handling** - Proper error handling with specific error types
- ✅ **Request cancellation** - Using AbortController for request cancellation
- ✅ **Context management** - Custom timeouts and retry settings
- ✅ **Token management** - Manual token refresh and status monitoring
- ✅ **Resource cleanup** - Proper disposal of client resources

## Getting Xibo CMS Credentials

To use these examples, you'll need to obtain OAuth2 credentials from your Xibo CMS instance:

1. **Log into your Xibo CMS admin panel**
2. **Navigate to Applications** (usually under Settings or Administration)
3. **Create a new Application** with the following settings:
   - **Name**: Your application name (e.g., "SDK Test App")
   - **Grant Type**: Client Credentials
   - **Confidential**: Yes
4. **Copy the Client ID and Client Secret** to your `.env` file

## Troubleshooting

### Common Issues

**❌ "Missing required environment variables"**
- Make sure you've copied `.env.example` to `.env`
- Verify all required variables are set in your `.env` file

**❌ "Authentication failed"**
- Check your `XIBO_CLIENT_ID` and `XIBO_CLIENT_SECRET`
- Verify the credentials are correct in your Xibo CMS
- Ensure the application is set to "Client Credentials" grant type

**❌ "Connection failed"**
- Verify your `XIBO_BASE_URL` is correct
- Check that your Xibo CMS is accessible from your network
- Ensure the API endpoints are correct

**❌ "Rate limit exceeded"**
- The examples include rate limiting handling
- Wait for the retry delay or reduce request frequency

### Debug Mode

Enable debug logging by setting in your `.env` file:
```env
XIBO_LOG_LEVEL=debug
XIBO_DEBUG=true
```

This will provide detailed information about:
- HTTP requests and responses
- Authentication token management
- Retry attempts and rate limiting
- Error details and stack traces

## Next Steps

Once you have the basic examples working, you can:

1. **Explore the SDK API** - Check the main documentation for available methods
2. **Build your own application** - Use these examples as a starting point
3. **Add error handling** - Implement proper error handling for your use case
4. **Implement rate limiting** - Handle rate limits appropriately for your application
5. **Add logging** - Implement proper logging for production use

For more information, see the main [README.md](../README.md) file.
