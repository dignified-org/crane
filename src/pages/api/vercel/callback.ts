import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import querystring from 'querystring';
import { sharedConfig } from '../../../config';
import { serverConfig } from '../../../config/server';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).send('Bad request');
    return;
  }

  // @todo validate nonce

  /* eslint-disable @typescript-eslint/camelcase */
  const accessTokenQuery = querystring.stringify({
    code,
    client_id: sharedConfig.VERCEL_API_KEY,
    client_secret: serverConfig.VERCEL_SHARED_SECRET,
    redirect_uri: `https://${req.headers.host}/api/vercel/callback`,
  });
  /* eslint-enable @typescript-eslint/camelcase */

  const accessTokenResponse = await fetch(
    'https://api.vercel.com/v2/oauth/access_token',
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

  res.json(accessTokenData);

  // if (location === Location.Admin || path === '') {
  //   res.writeHead(302, {
  //     Location: `https://${shop}/admin/apps/${sharedConfig.SHOPIFY_APP_HANDLE ||
  //       sharedConfig.SHOPIFY_API_KEY}${path}?token=${token}&${search}`,
  //   });
  // } else {
  //   res.writeHead(302, {
  //     Location: `https://${host}${path}?token=${token}&${search}`,
  //   });
  // }
  // res.end();
};
