/**
 * Basic usage example for Xibo CMS SDK
 * 
 * Before running this example:
 * 1. Copy .env.example to .env
 * 2. Update the values in .env with your Xibo CMS credentials
 * 3. Run: npm run build
 * 4. Run: node examples/basic-usage.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { XiboClient } = require('../dist/index.js');

async function main() {
  // Validate required environment variables
  const requiredEnvVars = ['XIBO_BASE_URL', 'XIBO_CLIENT_ID', 'XIBO_CLIENT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease copy .env.example to .env and update the values.');
    process.exit(1);
  }

  // Create a new Xibo client instance using environment variables
  const client = new XiboClient({
    baseUrl: process.env.XIBO_BASE_URL,
    clientId: process.env.XIBO_CLIENT_ID,
    clientSecret: process.env.XIBO_CLIENT_SECRET,
    grantType: 'client_credentials',
    tokenEndpoint: process.env.XIBO_TOKEN_URL,
    authorizeEndpoint: process.env.XIBO_AUTH_URL,
    logLevel: process.env.XIBO_LOG_LEVEL || 'info',
    timeout: 30000,
    maxRetries: 3,
  });

  console.log('🚀 Xibo CMS SDK Example');
  console.log('Base URL:', process.env.XIBO_BASE_URL);
  console.log('Grant Type: client_credentials');

  try {
    console.log('Testing connection to Xibo CMS...');
    
    // Test the connection
    const isConnected = await client.testConnection();
    if (!isConnected) {
      console.error('Failed to connect to Xibo CMS');
      return;
    }
    
    console.log('✅ Successfully connected to Xibo CMS');
    
    // Get information about the CMS instance
    const about = await client.getAbout();
    console.log('CMS Information:', about);
    
    // Get authentication status
    const authStatus = await client.getAuthStatus();
    console.log('Authentication Status:', authStatus);
    
    // Example of creating a context for request cancellation
    const controller = client.createAbortController();
    const context = client.createContext({
      timeout: 10000,
      retryAttempts: 2,
      signal: controller.signal,
    });
    
    // You can cancel the request after 5 seconds
    setTimeout(() => {
      console.log('Cancelling request...');
      controller.abort();
    }, 5000);
    
    // Make a request with the context (this will be cancelled)
    try {
      await client.getAbout(context);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled as expected');
      } else {
        console.error('Unexpected error:', error);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // Handle specific error types
    if (error.name === 'AuthenticationError') {
      console.error('Authentication failed. Please check your credentials.');
    } else if (error.name === 'RateLimitError') {
      console.error('Rate limit exceeded. Please wait before retrying.');
      console.error('Retry after:', error.retryAfter, 'seconds');
    }
  } finally {
    // Clean up resources
    await client.dispose();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the example
main().catch(console.error);
