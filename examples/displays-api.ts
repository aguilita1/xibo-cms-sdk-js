/**
 * Displays API example for Xibo CMS SDK (TypeScript)
 * 
 * This example demonstrates how to use the Displays API to:
 * - Search for displays
 * - Get display details
 * - Update display settings
 * - Perform display actions (screenshot, wake on LAN, etc.)
 * 
 * Before running this example:
 * 1. Copy .env.example to .env
 * 2. Update the values in .env with your Xibo CMS credentials
 * 3. Run: npm run build
 * 4. Run: npx ts-node examples/displays-api.ts
 */

// Load environment variables from .env file
import 'dotenv/config';
import { XiboClient, XiboConfig, DisplaySearchParams } from '../src/index';

async function main(): Promise<void> {
  // Validate required environment variables
  const requiredEnvVars = ['XIBO_BASE_URL', 'XIBO_CLIENT_ID', 'XIBO_CLIENT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease copy .env.example to .env and update the values.');
    process.exit(1);
  }

  // Create a new Xibo client instance
  const config: XiboConfig = {
    baseUrl: process.env['XIBO_BASE_URL']!,
    clientId: process.env['XIBO_CLIENT_ID']!,
    clientSecret: process.env['XIBO_CLIENT_SECRET']!,
    grantType: 'client_credentials',
    ...(process.env['XIBO_TOKEN_URL'] && { tokenEndpoint: process.env['XIBO_TOKEN_URL'] }),
    ...(process.env['XIBO_AUTH_URL'] && { authorizeEndpoint: process.env['XIBO_AUTH_URL'] }),
    logLevel: (process.env['XIBO_LOG_LEVEL'] as any) || 'info',
    timeout: 30000,
    maxRetries: 3,
  };

  const client = new XiboClient(config);

  console.log('🖥️  Xibo CMS SDK - Displays API Example');
  console.log('Base URL:', process.env['XIBO_BASE_URL']);

  try {
    // Test the connection first
    console.log('\n🔗 Testing connection...');
    const isConnected = await client.testConnection();
    if (!isConnected) {
      console.error('Failed to connect to Xibo CMS');
      return;
    }
    console.log('✅ Successfully connected to Xibo CMS');

    // 1. Search for all displays
    console.log('\n📋 Searching for displays...');
    const allDisplays = await client.displays.search();
    console.log(`Found ${allDisplays.total || allDisplays.data.length} displays`);
    
    if (allDisplays.data.length > 0) {
      console.log('First few displays:');
      allDisplays.data.slice(0, 3).forEach((display, index) => {
        console.log(`  ${index + 1}. ${display.display} (ID: ${display.displayId})`);
        console.log(`     Status: ${display.loggedIn ? 'Online' : 'Offline'}`);
        console.log(`     Last Accessed: ${display.lastAccessed || 'Never'}`);
      });
    }

    // 2. Search with filters
    console.log('\n🔍 Searching for authorized displays...');
    const searchParams: DisplaySearchParams = {
      authorised: 1, // Only authorized displays
    };
    const authorizedDisplays = await client.displays.search(searchParams);
    console.log(`Found ${authorizedDisplays.data.length} authorized displays`);

    // 3. Get a specific display (if any exist)
    if (allDisplays.data.length > 0) {
      const firstDisplay = allDisplays.data[0];
      if (!firstDisplay) {
        console.log('No display found in the results');
        return;
      }
      
      console.log(`\n📱 Getting details for display: ${firstDisplay.display}`);
      
      try {
        const displayDetails = await client.displays.get(firstDisplay.displayId);
        console.log('Display details:');
        console.log(`  Name: ${displayDetails.display}`);
        console.log(`  Description: ${displayDetails.description || 'No description'}`);
        console.log(`  License: ${displayDetails.license}`);
        console.log(`  Client Type: ${displayDetails.clientType || 'Unknown'}`);
        console.log(`  Client Version: ${displayDetails.clientVersion || 'Unknown'}`);
        console.log(`  Screen Size: ${displayDetails.screenSize || 'Unknown'}`);
        console.log(`  Timezone: ${displayDetails.timeZone || 'CMS Default'}`);

        // 4. Get display status
        console.log(`\n📊 Getting status for display: ${displayDetails.display}`);
        try {
          const status = await client.displays.getStatus(displayDetails.displayId);
          console.log('Display status:', status);
        } catch (error: any) {
          console.log('Could not get display status:', error.message);
        }

        // 5. Example of display actions (be careful with these in production!)
        console.log(`\n⚡ Available display actions for: ${displayDetails.display}`);
        console.log('  - Request Screenshot: client.displays.requestScreenshot(displayId)');
        console.log('  - Wake on LAN: client.displays.wakeOnLan(displayId)');
        console.log('  - Toggle Authorization: client.displays.toggleAuthorize(displayId)');
        console.log('  - License Check: client.displays.licenseCheck(displayId)');
        console.log('  - Purge All Media: client.displays.purgeAll(displayId)');
        
        // Uncomment these lines to actually perform actions (use with caution!)
        /*
        console.log('\n📸 Requesting screenshot...');
        await client.displays.requestScreenshot(displayDetails.displayId);
        console.log('Screenshot requested successfully');
        */

        // 6. Example of updating display settings (be very careful!)
        console.log(`\n⚙️  Display update example (not executed):`);
        console.log('  To update display settings, use:');
        console.log('  await client.displays.update(displayId, {');
        console.log('    display: "New Display Name",');
        console.log('    description: "Updated description",');
        console.log('    // ... other properties');
        console.log('  });');
        try {
          if (allDisplays.data.length > 0) {
            console.log('Edit first display:');
            const display = allDisplays.data[0];
            if (!display) {
              console.warn(`WARNING: No Display Found.`);
              return; // prevents "possibly undefined"
            }
            console.log(`  ${display.display} (ID: ${display.displayId})`);
            console.log(`     Description: ${display.description}`);
            console.log(`     Status: ${display.loggedIn ? 'Online' : 'Offline'}`);
            console.log(`     Last Accessed: ${display.lastAccessed || 'Never'}`);

            // Provide all required parameters but only update what changes
            await client.displays.update(display.displayId, {
              display: display.display, 
              defaultLayoutId: display.defaultLayoutId, 
              licensed: display.licensed, 
              license: display.license,
              description: "Updated description test JS client example",
              incSchedule: display.incSchedule, 
              emailAlert: display.emailAlert, 
              wakeOnLanEnabled: display.wakeOnLanEnabled,
            });
          }
        } catch (error: any) {
          console.log('Could not update display:', error.message);
        }
      } catch (error: any) {
        console.error('Error getting display details:', error.message);
      }
    }

    // 7. Pagination example
    console.log('\n📄 Pagination example...');
    const paginatedDisplays = await client.displays.search({}, {
      timeout: 10000,
      retryAttempts: 2,
    });
    
    console.log('Pagination info:');
    console.log(`  Total: ${paginatedDisplays.total || 'Unknown'}`);
    console.log(`  Current page: ${paginatedDisplays.page}`);
    console.log(`  Page size: ${paginatedDisplays.pageSize}`);
    console.log(`  Has next: ${paginatedDisplays.hasNext}`);
    console.log(`  Has previous: ${paginatedDisplays.hasPrevious}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    // Handle specific error types
    if (error.name === 'AuthenticationError') {
      console.error('Authentication failed. Please check your credentials.');
    } else if (error.name === 'RateLimitError') {
      console.error('Rate limit exceeded. Please wait before retrying.');
    } else if (error.name === 'NotFoundError') {
      console.error('Resource not found.');
    }
  } finally {
    // Clean up resources
    await client.dispose();
    console.log('\n✨ Client disposed successfully');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the example
main().catch(console.error);
