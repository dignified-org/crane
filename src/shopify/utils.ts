import querystring from 'querystring';
import crypto from 'crypto';

import safeCompare from 'safe-compare';
import { NextApiRequest } from 'next';

/**
 * Validate a Shopify store domain
 * @from https://github.com/Shopify/quilt/blob/e0d52556170e26a8bd8a1d5f42c5c4247fe72482/packages/koa-shopify-auth/src/auth/create-oauth-start.ts#L20-L28
 * @param shop
 * @param myShopifyDomain
 */
export function validateShop(
  shop: string | string[] | undefined | null,
  myShopifyDomain = 'myshopify.com',
) {
  if (Array.isArray(shop)) {
    return false;
  }

  const shopRegex = new RegExp(
    `^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${myShopifyDomain}$`,
    'i',
  );

  return shop && shopRegex.test(shop);
}

/**
 * Validate a Shopify request is authentic
 * @from https://github.com/Shopify/quilt/blob/e0d52556170e26a8bd8a1d5f42c5c4247fe72482/packages/koa-shopify-auth/src/auth/validate-hmac.ts#L7-L28
 * @param hmac
 * @param secret
 * @param query
 */
export default function validateHmac(
  hmac: string | string[],
  secret: string,
  query: NextApiRequest['query'],
) {
  if (Array.isArray(hmac)) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hmac: _hmac, signature: _signature, ...map } = query;

  const orderedMap = Object.keys(map)
    .sort((value1, value2) => value1.localeCompare(value2))
    .reduce((accum, key) => {
      // eslint-disable-next-line no-param-reassign
      accum[key] = map[key];
      return accum;
    }, {});

  const message = querystring.stringify(orderedMap);

  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return safeCompare(generatedHash, hmac);
}
