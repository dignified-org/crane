import fetch from 'isomorphic-unfetch';
import { NextApiRequest, NextApiResponse } from 'next';
import querystring from 'querystring';
import safeCompare from 'safe-compare';
import { createHmac } from 'crypto';
import jwt from 'jsonwebtoken';

import { connect, upsertStoreByDomain } from '../../../mongo';
import { serverConfig } from '../../../config/server';
import { sharedConfig } from '../../../config';

// https://github.com/Shopify/quilt/blob/master/packages/koa-shopify-auth/src/auth/validate-hmac.ts
function validateHmac(
  hmac: string,
  secret: string,
  query: NextApiRequest['query'],
) {
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
  const generatedHash = createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return safeCompare(generatedHash, hmac);
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connect();

  // https://github.com/Shopify/quilt/blob/master/packages/koa-shopify-auth/src/auth/create-oauth-callback.ts
  const { code, hmac, shop, state: nonce } = req.query;

  if (!nonce || !shop) {
    res.status(400).send('Bad Request');
    return;
  }

  if (
    validateHmac(
      hmac as string,
      serverConfig.SHOPIFY_SHARED_SECRET,
      req.query,
    ) === false
  ) {
    res.status(400).send('Bad Request');
    return;
  }

  const state: any = await jwt.verify(
    nonce as string,
    serverConfig.SHOPIFY_SHARED_SECRET,
    {
      algorithms: ['HS256'],
    },
  );

  /* eslint-disable @typescript-eslint/camelcase */
  const accessTokenQuery = querystring.stringify({
    code,
    client_id: sharedConfig.SHOPIFY_API_KEY,
    client_secret: serverConfig.SHOPIFY_SHARED_SECRET,
  });
  /* eslint-enable @typescript-eslint/camelcase */

  const accessTokenResponse = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(accessTokenQuery).toString(),
      },
      body: accessTokenQuery,
    },
  );

  if (!accessTokenResponse.ok) {
    res.status(401).send('Unauthorized');
    return;
  }

  const accessTokenData = await accessTokenResponse.json();
  const { access_token: accessToken } = accessTokenData;

  await upsertStoreByDomain({
    domain: shop as string,
    token: accessToken,
    scopes: ['write_products'],
  });

  res.writeHead(302, {
    Location: `https://${shop}/admin/apps/${
      sharedConfig.SHOPIFY_API_KEY
    }${state?.pathname ?? '/'}`,
  });
  res.end();
};
