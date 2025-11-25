import { TokenResponse, CachedToken, Logger } from '../types';

/**
 * Token storage interface
 */
export interface TokenStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * In-memory token storage implementation
 */
export class MemoryTokenStorage implements TokenStorage {
  private storage = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

/**
 * Token manager for caching and refreshing OAuth2 tokens
 */
export class TokenManager {
  private readonly storageKey: string;
  private cachedToken: CachedToken | null = null;

  constructor(
    clientId: string,
    private readonly storage: TokenStorage = new MemoryTokenStorage(),
    private readonly logger?: Logger
  ) {
    this.storageKey = `xibo_token_${clientId}`;
  }

  /**
   * Store a token response
   */
  async storeToken(tokenResponse: TokenResponse): Promise<void> {
    const now = Date.now();
    const cachedToken: CachedToken = {
      ...tokenResponse,
      obtained_at: now,
      expires_at: now + (tokenResponse.expires_in * 1000),
    };

    this.cachedToken = cachedToken;
    await this.storage.set(this.storageKey, JSON.stringify(cachedToken));
    
    this.logger?.debug('Token stored successfully', {
      expires_in: tokenResponse.expires_in,
      expires_at: cachedToken.expires_at,
    });
  }

  /**
   * Get the current token if valid
   */
  async getToken(): Promise<CachedToken | null> {
    // Return cached token if available and valid
    if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
      return this.cachedToken;
    }

    // Try to load from storage
    try {
      const storedToken = await this.storage.get(this.storageKey);
      if (storedToken) {
        const parsedToken: CachedToken = JSON.parse(storedToken);
        if (this.isTokenValid(parsedToken)) {
          this.cachedToken = parsedToken;
          this.logger?.debug('Token loaded from storage');
          return parsedToken;
        } else {
          this.logger?.debug('Stored token is expired, removing');
          await this.clearToken();
        }
      }
    } catch (error) {
      this.logger?.warn('Failed to load token from storage', { error });
      await this.clearToken();
    }

    return null;
  }

  /**
   * Get a valid access token string
   */
  async getAccessToken(): Promise<string | null> {
    const token = await this.getToken();
    return token?.access_token || null;
  }

  /**
   * Check if token is valid (not expired)
   */
  isTokenValid(token: CachedToken): boolean {
    const now = Date.now();
    // Add 5 minute buffer before expiration
    const bufferMs = 5 * 60 * 1000;
    return token.expires_at > (now + bufferMs);
  }

  /**
   * Check if token needs refresh (expires within 10 minutes)
   */
  needsRefresh(token: CachedToken): boolean {
    const now = Date.now();
    // Refresh if expires within 10 minutes
    const refreshBufferMs = 10 * 60 * 1000;
    return token.expires_at <= (now + refreshBufferMs);
  }

  /**
   * Clear stored token
   */
  async clearToken(): Promise<void> {
    this.cachedToken = null;
    await this.storage.delete(this.storageKey);
    this.logger?.debug('Token cleared');
  }

  /**
   * Get token expiration info
   */
  async getTokenInfo(): Promise<{
    hasToken: boolean;
    isValid: boolean;
    needsRefresh: boolean;
    expiresAt?: number;
    expiresIn?: number;
  }> {
    const token = await this.getToken();
    
    if (!token) {
      return { hasToken: false, isValid: false, needsRefresh: true };
    }

    const isValid = this.isTokenValid(token);
    const needsRefresh = this.needsRefresh(token);
    const now = Date.now();
    const expiresIn = Math.max(0, Math.floor((token.expires_at - now) / 1000));

    return {
      hasToken: true,
      isValid,
      needsRefresh,
      expiresAt: token.expires_at,
      expiresIn,
    };
  }
}
