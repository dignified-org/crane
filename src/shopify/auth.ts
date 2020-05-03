// import { URLSearchParams } from 'url';
import { sharedConfig } from '../config';

/**
 * Shopify api access more
 * @export
 * @enum {number}
 */
export enum AccessMode {
  /**
   * Does not expire until app is uninstalled
   */
  Offline = 'offline',

  /**
   * Tied to a user, has expiration
   */
  Online = 'online',
}

export interface AuthConfig {
  /**
   * Valid Shopify shop domain
   * @type {string}
   * @memberof AuthConfig
   */
  shop: string;

  /**
   * A unique nonce to send along with the OAuth
   *
   * @type {string}
   * @memberof AuthConfig
   */
  nonce: string;

  /**
   * List of access scopes to request
   * @type {string[]}
   * @memberof AuthConfig
   */
  scopes: string[];

  /**
   * Access mode
   * @type {AccessMode}
   * @memberof AuthConfig
   */
  mode: AccessMode;

  /**
   * URI to redirect to after Auth
   * @type {string}
   * @memberof AuthConfig
   */
  redirect: string;

  /**
   * Shopify app api key
   * @type {string}
   * @memberof AuthConfig
   */
  apiKey?: string;
}

/**
 * Generate a redirect url to start authentication with Shopify
 * @export
 * @param {AuthConfig} config
 * @returns
 */
export function generateAuthRedirect(config: AuthConfig) {
  const {
    shop,
    nonce,
    scopes,
    mode,
    redirect,
    apiKey = sharedConfig.SHOPIFY_API_KEY,
  } = config;

  const baseUrl = `https://${shop}/admin/oauth/authorize`;
  const params = new URLSearchParams();

  params.set('client_id', apiKey);
  params.set('state', nonce);
  params.set('redirect_uri', redirect);
  params.set('scope', scopes.join());

  if (mode === AccessMode.Online) {
    params.set('grant_options[]', 'per-user');
  }

  return `${baseUrl}?${params.toString()}`;
}
