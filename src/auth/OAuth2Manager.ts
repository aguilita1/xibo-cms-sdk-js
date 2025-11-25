import { AuthorizationCode, ClientCredentials, ModuleOptions } from 'simple-oauth2';
import { TokenManager, TokenStorage } from './TokenManager';
import { TokenResponse, XiboConfig, Logger } from '../types';
import { AuthenticationError } from '../errors';

/**
 * OAuth2 configuration for Xibo CMS
 */
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  grantType: 'client_credentials' | 'authorization_code';
  tokenEndpoint?: string | undefined;
  authorizeEndpoint?: string | undefined;
  baseUrl: string;
}

/**
 * OAuth2 Manager for handling authentication with Xibo CMS
 */
export class OAuth2Manager {
  private readonly tokenManager: TokenManager;
  private readonly clientCredentials?: ClientCredentials;
  private readonly authorizationCode?: AuthorizationCode;
  private readonly config: OAuth2Config;

  constructor(
    config: OAuth2Config,
    tokenStorage?: TokenStorage,
    private readonly logger?: Logger
  ) {
    this.config = config;
    this.tokenManager = new TokenManager(config.clientId, tokenStorage, logger);

    // Build OAuth2 endpoints - extract host and paths properly
    const baseUrlObj = new URL(config.baseUrl);
    const tokenHost = `${baseUrlObj.protocol}//${baseUrlObj.host}`;
    
    // Extract paths from full URLs or use defaults
    const tokenPath = config.tokenEndpoint ? 
      new URL(config.tokenEndpoint).pathname : 
      '/api/authorize/access_token';
    const authorizePath = config.authorizeEndpoint ? 
      new URL(config.authorizeEndpoint).pathname : 
      '/api/authorize';

    // Initialize appropriate OAuth2 client based on grant type
    if (config.grantType === 'client_credentials') {
      // Client credentials flow only needs tokenHost and tokenPath
      const clientCredentialsOptions: ModuleOptions = {
        client: {
          id: config.clientId,
          secret: config.clientSecret,
        },
        auth: {
          tokenHost,
          tokenPath,
        },
        options: {
          authorizationMethod: 'body',
        },
      };
      this.clientCredentials = new ClientCredentials(clientCredentialsOptions);
    } else {
      // Authorization code flow needs all three endpoints
      const authorizationCodeOptions: ModuleOptions = {
        client: {
          id: config.clientId,
          secret: config.clientSecret,
        },
        auth: {
          tokenHost,
          tokenPath,
          authorizePath,
        },
        options: {
          authorizationMethod: 'body',
        },
      };
      this.authorizationCode = new AuthorizationCode(authorizationCodeOptions);
    }

    this.logger?.debug('OAuth2Manager initialized', {
      grantType: config.grantType,
      tokenHost,
      tokenPath,
      authorizePath,
    });
  }

  /**
   * Create OAuth2Manager from XiboConfig
   */
  static fromConfig(
    config: XiboConfig,
    tokenStorage?: TokenStorage,
    logger?: Logger
  ): OAuth2Manager {
    return new OAuth2Manager(
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        grantType: config.grantType,
        tokenEndpoint: config.tokenEndpoint ?? undefined,
        authorizeEndpoint: config.authorizeEndpoint ?? undefined,
        baseUrl: config.baseUrl,
      },
      tokenStorage,
      logger
    );
  }

  /**
   * Get a valid access token
   */
  async getAccessToken(): Promise<string> {
    // Try to get existing valid token
    const existingToken = await this.tokenManager.getAccessToken();
    if (existingToken) {
      this.logger?.debug('Using existing valid token');
      return existingToken;
    }

    // Get new token
    this.logger?.debug('Obtaining new access token');
    const tokenResponse = await this.obtainToken();
    await this.tokenManager.storeToken(tokenResponse);
    
    return tokenResponse.access_token;
  }

  /**
   * Refresh the current token if needed
   */
  async refreshTokenIfNeeded(): Promise<string> {
    const tokenInfo = await this.tokenManager.getTokenInfo();
    
    if (!tokenInfo.hasToken || !tokenInfo.isValid) {
      this.logger?.debug('No valid token, obtaining new one');
      return this.getAccessToken();
    }

    if (tokenInfo.needsRefresh) {
      this.logger?.debug('Token needs refresh, obtaining new one');
      const tokenResponse = await this.obtainToken();
      await this.tokenManager.storeToken(tokenResponse);
      return tokenResponse.access_token;
    }

    const token = await this.tokenManager.getAccessToken();
    if (!token) {
      throw new AuthenticationError('Failed to get access token');
    }

    return token;
  }

  /**
   * Obtain a new token from the OAuth2 server
   */
  private async obtainToken(): Promise<TokenResponse> {
    try {
      if (this.config.grantType === 'client_credentials') {
        return await this.obtainClientCredentialsToken();
      } else {
        throw new AuthenticationError(
          'Authorization code flow requires manual authorization step'
        );
      }
    } catch (error) {
      this.logger?.error('Failed to obtain OAuth2 token', { error });
      
      if (error instanceof Error) {
        throw new AuthenticationError(
          `OAuth2 authentication failed: ${error.message}`,
          error
        );
      }
      
      throw new AuthenticationError('OAuth2 authentication failed');
    }
  }

  /**
   * Obtain token using client credentials flow
   */
  private async obtainClientCredentialsToken(): Promise<TokenResponse> {
    if (!this.clientCredentials) {
      throw new AuthenticationError('Client credentials flow not initialized');
    }

    this.logger?.debug('Requesting client credentials token');
    
    const result = await this.clientCredentials.getToken({});
    const token = result.token;

    return {
      access_token: token['access_token'] as string,
      token_type: (token['token_type'] as string) || 'Bearer',
      expires_in: (token['expires_in'] as number) || 3600,
      refresh_token: token['refresh_token'] as string | undefined,
      scope: token['scope'] as string | undefined,
    };
  }

  /**
   * Get authorization URL for authorization code flow
   */
  getAuthorizationUrl(redirectUri: string, state?: string, scope?: string): string {
    if (!this.authorizationCode) {
      throw new AuthenticationError('Authorization code flow not initialized');
    }

    const authorizationUri = this.authorizationCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: scope || 'read write',
      state: state || Math.random().toString(36).substring(7),
    });

    this.logger?.debug('Generated authorization URL', { authorizationUri });
    return authorizationUri;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<TokenResponse> {
    if (!this.authorizationCode) {
      throw new AuthenticationError('Authorization code flow not initialized');
    }

    try {
      this.logger?.debug('Exchanging authorization code for token');
      
      const result = await this.authorizationCode.getToken({
        code,
        redirect_uri: redirectUri,
      });

      const token = result.token;
      const tokenResponse: TokenResponse = {
        access_token: token['access_token'] as string,
        token_type: (token['token_type'] as string) || 'Bearer',
        expires_in: (token['expires_in'] as number) || 3600,
        refresh_token: token['refresh_token'] as string | undefined,
        scope: token['scope'] as string | undefined,
      };

      await this.tokenManager.storeToken(tokenResponse);
      return tokenResponse;
    } catch (error) {
      this.logger?.error('Failed to exchange code for token', { error });
      throw new AuthenticationError(
        `Failed to exchange authorization code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Revoke the current token
   */
  async revokeToken(): Promise<void> {
    await this.tokenManager.clearToken();
    this.logger?.debug('Token revoked');
  }

  /**
   * Get token information
   */
  async getTokenInfo(): Promise<{
    hasToken: boolean;
    isValid: boolean;
    needsRefresh: boolean;
    expiresAt?: number;
    expiresIn?: number;
  }> {
    return this.tokenManager.getTokenInfo();
  }
}
