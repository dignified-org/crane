import { NextApiRequest, NextApiResponse } from 'next';
import { authorizeShopifyCallback } from './login';
import { upsertStoreByDomain } from '../../../mongo';
import { sharedConfig } from '../../../config';
import { Location } from '../../../shopify/nonce';

import { sentry } from '../../../sentry';

sentry();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const authResponse = await authorizeShopifyCallback(req, res);

  if (!authResponse) {
    return;
  }

  const { accessTokenData, nonce } = authResponse;

  const { shop, token } = req.query;

  const { access_token: accessToken, scope: rawScope } = accessTokenData;

  await upsertStoreByDomain({
    domain: shop as string,
    scopes: rawScope.split(','),
    token: accessToken,
  });

  const path = nonce.pathname.endsWith('/')
    ? nonce.pathname.substring(0, nonce.pathname.length - 1)
    : nonce.pathname;

  if (nonce.location === Location.Admin || path === '') {
    res.writeHead(302, {
      Location: `https://${shop}/admin/apps/${sharedConfig.SHOPIFY_APP_HANDLE ||
        sharedConfig.SHOPIFY_API_KEY}${path}?token=${token}&${nonce.search}`,
    });
  } else {
    res.writeHead(302, {
      Location: `https://${req.headers.host}${path}?token=${token}&${nonce.search}`,
    });
  }
  res.end();
};
