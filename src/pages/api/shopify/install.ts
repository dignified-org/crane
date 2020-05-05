import { NextApiRequest, NextApiResponse } from 'next';
import gql from 'graphql-tag';
import { authorizeShopifyCallback } from './login';
import { installStoreByDomain } from '../../../mongo';
import { sharedConfig } from '../../../config';
import { Location } from '../../../shopify/nonce';

import { sentry } from '../../../sentry';
import { createClient } from '../../../shopify/client';

const { captureException } = sentry();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const authResponse = await authorizeShopifyCallback(req, res);

  if (!authResponse) {
    return;
  }

  const {
    accessTokenData,
    nonce: { search, token = '', pathname, location },
  } = authResponse;

  const { shop } = req.query;

  const { access_token: accessToken, scope: rawScope } = accessTokenData;

  await installStoreByDomain({
    domain: shop as string,
    scopes: rawScope.split(','),
    token: accessToken,
  });

  const host = req.headers.host as string;

  const path = pathname.endsWith('/')
    ? pathname.substring(0, pathname.length - 1)
    : pathname;

  if (location === Location.Admin || path === '') {
    res.writeHead(302, {
      Location: `https://${shop}/admin/apps/${sharedConfig.SHOPIFY_APP_HANDLE ||
        sharedConfig.SHOPIFY_API_KEY}${path}?token=${token}&${search}`,
    });
  } else {
    res.writeHead(302, {
      Location: `https://${host}${path}?token=${token}&${search}`,
    });
  }
  res.end();
};
