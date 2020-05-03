import { NextApiRequest, NextApiResponse } from 'next';
import { authorizeShopifyCallback } from './login';
import { upsertStoreByDomain } from '../../../mongo';
import { sharedConfig } from '../../../config';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const accessTokenData = await authorizeShopifyCallback(req, res);

  if (!accessTokenData) {
    return;
  }

  const { shop, token } = req.query;

  const { access_token: accessToken, scope: rawScope } = accessTokenData;

  await upsertStoreByDomain({
    domain: shop as string,
    scopes: rawScope.split(','),
    token: accessToken,
  });

  res.writeHead(302, {
    Location: `https://${shop}/admin/apps/${sharedConfig.SHOPIFY_APP_HANDLE ||
      sharedConfig.SHOPIFY_API_KEY}${'/'}?token=${token}`,
  });
  res.end();
};
