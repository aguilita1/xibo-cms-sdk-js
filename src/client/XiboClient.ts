import { HttpClient, HttpClientConfig } from './HttpClient';
import { OAuth2Manager, TokenStorage, MemoryTokenStorage } from '../auth';
import { XiboConfig, Logger, Context } from '../types';
import { createLogger } from '../utils/logger';

/**
 * Main Xibo CMS SDK client
 */
export class XiboClient {
  private readonly httpClient: HttpClient;
  private readonly oauth2Manager: OAuth2Manager;
  private readonly logger: Logger;
  private readonly config: XiboConfig;

  constructor(config: XiboConfig, tokenStorage?: TokenStorage) {
    this.config = config;
    
    // Initialize logger
    this.logger = createLogger(config.logLevel || 'info');
    
    // Initialize OAuth2 manager
    this.oauth2Manager = OAuth2Manager.fromConfig(
      config,
      tokenStorage || new MemoryTokenStorage(),
      this.logger
    );

    // Initialize HTTP client
    const httpConfig: HttpClientConfig = {
      baseUrl: config.baseUrl,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      collectionInterval: config.collectionInterval || 60000,
      logger: this.logger,
    };

    this.httpClient = new HttpClient(httpConfig, this.oauth2Manager, this.logger);

    this.logger.info('XiboClient initialized', {
      baseUrl: config.baseUrl,
      grantType: config.grantType,
      timeout: httpConfig.timeout,
      maxRetries: httpConfig.maxRetries,
    });
  }

  /**
   * Get the HTTP client instance
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Get the OAuth2 manager instance
   */
  getOAuth2Manager(): OAuth2Manager {
    return this.oauth2Manager;
  }

  /**
   * Get the logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Get the configuration
   */
  getConfig(): XiboConfig {
    return { ...this.config };
  }

  /**
   * Test the connection to the Xibo CMS API
   */
  async testConnection(context?: Context): Promise<boolean> {
    try {
      this.logger.debug('Testing connection to Xibo CMS API');
      
      // First test OAuth2 authentication
      this.logger.debug('Testing OAuth2 authentication');
      await this.oauth2Manager.getAccessToken();
      this.logger.debug('OAuth2 authentication successful');
      
      // Then make a simple API call to test connectivity
      this.logger.debug('Testing API connectivity');
      const response = await this.httpClient.get('/about', undefined, context);
      
      this.logger.info('Connection test successful', {
        status: response.status,
        version: response.data,
      });
      
      return true;
    } catch (error) {
      this.logger.error('Connection test failed', { error });
      return false;
    }
  }

  /**
   * Get information about the Xibo CMS instance
   */
  async getAbout(context?: Context): Promise<any> {
    this.logger.debug('Getting Xibo CMS information');
    const response = await this.httpClient.get('/about', undefined, context);
    return response.data;
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    hasToken: boolean;
    isValid: boolean;
    needsRefresh: boolean;
    expiresAt?: number;
    expiresIn?: number;
  }> {
    try {
      const tokenInfo = await this.oauth2Manager.getTokenInfo();
      return {
        isAuthenticated: tokenInfo.hasToken && tokenInfo.isValid,
        ...tokenInfo,
      };
    } catch (error) {
      this.logger.error('Failed to get auth status', { error });
      return {
        isAuthenticated: false,
        hasToken: false,
        isValid: false,
        needsRefresh: true,
      };
    }
  }

  /**
   * Manually refresh the authentication token
   */
  async refreshToken(): Promise<void> {
    this.logger.debug('Manually refreshing authentication token');
    await this.oauth2Manager.refreshTokenIfNeeded();
    this.logger.info('Authentication token refreshed');
  }

  /**
   * Revoke the current authentication token
   */
  async revokeToken(): Promise<void> {
    this.logger.debug('Revoking authentication token');
    await this.oauth2Manager.revokeToken();
    this.logger.info('Authentication token revoked');
  }

  /**
   * Get authorization URL for authorization code flow
   */
  getAuthorizationUrl(redirectUri: string, state?: string, scope?: string): string {
    if (this.config.grantType !== 'authorization_code') {
      throw new Error('Authorization URL is only available for authorization code flow');
    }
    
    return this.oauth2Manager.getAuthorizationUrl(redirectUri, state, scope);
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<void> {
    if (this.config.grantType !== 'authorization_code') {
      throw new Error('Code exchange is only available for authorization code flow');
    }
    
    this.logger.debug('Exchanging authorization code for token');
    await this.oauth2Manager.exchangeCodeForToken(code, redirectUri);
    this.logger.info('Authorization code exchanged successfully');
  }

  /**
   * Create a new context for request cancellation and timeouts
   */
  createContext(options: {
    timeout?: number;
    retryAttempts?: number;
    signal?: AbortSignal;
  } = {}): Context {
    const context: Context = {};
    
    if (options.timeout !== undefined) {
      context.timeout = options.timeout;
    }
    
    if (options.retryAttempts !== undefined) {
      context.retryAttempts = options.retryAttempts;
    }
    
    if (options.signal !== undefined) {
      context.signal = options.signal;
    }
    
    return context;
  }

  /**
   * Create an AbortController for request cancellation
   */
  createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * Dispose of the client and clean up resources
   */
  async dispose(): Promise<void> {
    this.logger.debug('Disposing XiboClient');
    // Currently no cleanup needed, but this method is here for future use
    this.logger.info('XiboClient disposed');
  }
}
