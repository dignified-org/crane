import jwt from 'jsonwebtoken';
import { AccessMode } from './auth';
import { serverConfig } from '../config/server';

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
   * Location to redirect user back to on success
   */
  location: Location;

  /**
   * Which sort of OAuth2 grant is requested
   */
  mode: AccessMode;
}

const ALGORITHM = 'HS256';

/**
 * Issue a signed nonce that can be verified
 * @export
 * @param {Nonce} nonce
 * @param {string} [secret=serverConfig.SHOPIFY_SHARED_SECRET]
 * @returns
 */
export async function issueNonce(
  nonce: Nonce,
  secret: string = serverConfig.SHOPIFY_SHARED_SECRET,
) {
  return await jwt.sign(nonce, secret, {
    algorithm: ALGORITHM,
    expiresIn: 60 * 10, // 10m
  });
}

/**
 * Validate that state matches signature of nonce
 * @export
 * @param {string} state
 * @param {string} [secret=serverConfig.SHOPIFY_SHARED_SECRET]
 * @returns
 */
export async function validateNonce(
  state: string,
  secret: string = serverConfig.SHOPIFY_SHARED_SECRET,
) {
  try {
    const nonce = await jwt.verify(state, secret, {
      algorithms: [ALGORITHM],
    });

    return nonce as Nonce;
  } catch (e) {
    return null;
  }
}
