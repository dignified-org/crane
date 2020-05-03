import { AccessMode } from './auth';

/**
 * Where the user is in the app
 */
export enum Location {
  /**
   * Not embedded in an iFrame
   */
  Top = 'TOP',

  /**
   * Embedded in the Shopify admin app iFrames
   */
  Admin = 'Admin',
}

/**
 * Sent along with OAuth2 requests to pass metadata
 */
export interface Nonce {
  /**
   * Shopify store this nonce was generate for
   */
  shop: string;

  /**
   * Location to redirect user back to on success
   */
  pathname: string;

  /**
   * Search parameters to persist
   */
  search: string;

  /**
   * Location to redirect user back to on success
   */
  location: Location;

  /**
   * Which sort of OAuth2 grant is requested
   */
  mode: AccessMode;
}

/**
 * Issue a nonce that can be verified
 * @export
 * @param {Nonce} nonce
 * @param {string} apiKey
 * @returns
 */
export function issueNonce(nonce: Nonce, apiKey: string) {
  const sp = new URLSearchParams(nonce.search);

  sp.delete('hmac');
  sp.delete('shop');
  sp.delete('locale');
  sp.delete('session');
  sp.delete('timestamp');
  sp.delete('token');

  console.log(sp.toString());

  const body = JSON.stringify({
    ...nonce,
    search: sp.toString(),
    apiKey,
    timestamp: Date.now(),
  });

  if (typeof window === 'undefined') {
    return Buffer.from(body)
      .toString('base64')
      .replace(/=*/g, '');
  }

  return window.btoa(body).replace(/=*/g, '');
}

/**
 * Validate that state matches signature of nonce
 * @export
 * @param {string} state
 * @param {string} apiKey
 * @returns
 */
export function validateNonce(state: string, apiKey: string) {
  try {
    let json;

    if (typeof window === 'undefined') {
      json = Buffer.from(state, 'base64').toString();
    } else {
      json = window.atob(state);
    }
    const nonce = JSON.parse(json);

    if (nonce?.apiKey !== apiKey) {
      return null;
    }

    if (
      !nonce?.timestamp ||
      Number.isNaN(nonce?.timestamp) ||
      Date.now() < nonce.timestamp ||
      Math.abs(Date.now() - nonce?.timestamp) > 1000 * 60 * 10 // Within 10 minutes
    ) {
      return null;
    }

    return nonce as Nonce;
  } catch (e) {
    return null;
  }
}
