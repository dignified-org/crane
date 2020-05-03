import fetch from 'isomorphic-unfetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import querystring from 'querystring';
import jwt from 'jsonwebtoken';
import {
  validateShop,
  haveRequiredScopes,
  REQUIRED_SCOPES,
} from '../../../shopify';
import validateHmac from '../../../shopify/utils';
import { serverConfig } from '../../../config/server';
import { sharedConfig } from '../../../config';
import { upsertUserByShopifyId } from '../../../mongo/user';
import { insertLogin } from '../../../mongo/login';
import { findStoreByDomain } from '../../../mongo';
import { generateAuthRedirect, AccessMode } from '../../../shopify/auth';

export async function authorizeShopifyCallback(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, hmac, shop, state: nonce } = req.query;

  if (!nonce || !validateShop(shop)) {
    res.status(400).send('Bad Request');
    return;
  }

  if (!validateHmac(hmac, serverConfig.SHOPIFY_SHARED_SECRET, req.query)) {
    res.status(400).send('Bad Request');
    return;
  }

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

  return await accessTokenResponse.json();
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const accessTokenData = await authorizeShopifyCallback(req, res);

  if (!accessTokenData) {
    return;
  }

  const { shop } = req.query;

  const {
    access_token: accessToken,
    expires_in: expiresIn,
    scope: rawScope,
    associated_user_scope: rawAssociatedUserScope,
    associated_user: {
      id,
      first_name: firstName,
      last_name: lastName,
      email,
      account_owner: accountOwner,
      locale,
      collaborator,
      email_verified: emailVerified,
    },
  } = accessTokenData;

  const user = await upsertUserByShopifyId({
    id,
    firstName,
    lastName,
    email,
    emailVerified,
    accountOwner,
    locale,
    collaborator,
  });

  const login = await insertLogin({
    userId: id,
    shop: shop as string,
    token: accessToken,
    scope: rawScope.split(','),
    associatedUserScope: rawAssociatedUserScope.split(','),
    expiresAt: Date.now() / 1000 + expiresIn - 60,
  });

  // Generate token
  const rawToken = await jwt.sign(
    {
      userId: id,
      shop: shop as string,
      scope: login.associatedUserScope,
    },
    serverConfig.SHOPIFY_SHARED_SECRET,
    {
      algorithm: 'HS256',
    },
  );

  const [h, p, s] = rawToken.split('.');

  const token = `${h}.${p}`;
  res.setHeader(
    'Set-Cookie',
    serialize(`_${(shop as string).replace('.myshopify.com', '')}`, s, {
      path: '/',
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + expiresIn * 1000),
      maxAge: expiresIn,
    }),
  );

  const store = await findStoreByDomain(shop as string);

  // Need to install / reinstall store
  if (!store || !store.installed || !haveRequiredScopes(store.scopes)) {
    const redirect = generateAuthRedirect({
      mode: AccessMode.Offline,
      nonce: 'todo',
      scopes: REQUIRED_SCOPES,
      shop: shop as string,
      apiKey: sharedConfig.SHOPIFY_API_KEY,
      redirect: `https://${req.headers.host}/api/shopify/install`,
    });
    res.writeHead(302, {
      Location: `${redirect}&token=${token}`,
    });
    res.end();
    return;
  }

  res.writeHead(302, {
    Location: `https://${shop}/admin/apps/${sharedConfig.SHOPIFY_APP_HANDLE ||
      sharedConfig.SHOPIFY_API_KEY}${'/'}?token=${token}`,
  });
  res.end();
};
