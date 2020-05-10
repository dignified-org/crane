import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import querystring from 'querystring';
import { sharedConfig } from '../../../config';
import { serverConfig } from '../../../config/server';
import { validateNonce, findUser } from '../../../vercel';
import { upsertVercel } from '../../../mongo';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).send('Bad request');
    return;
  }

  const nonce = await validateNonce(state as string);

  if (!nonce) {
    res.status(403).send('Forbidden');
    return;
  }

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

  const {
    access_token: accessToken,
    ...accessTokenData
  } = await accessTokenResponse.json();

  console.log(accessTokenData); // @todo do something with this

  const user = await findUser(accessToken);

  await upsertVercel(user, nonce.userId, accessToken);

  // TODO nonce based redirect

  // if (location === Location.Admin || path === '') {
  res.writeHead(302, {
    Location: `https://${
      nonce.shop
    }/admin/apps/${sharedConfig.SHOPIFY_APP_HANDLE ||
      sharedConfig.SHOPIFY_API_KEY}/setup`,
  });
  // } else {
  //   res.writeHead(302, {
  //     Location: `https://${host}${path}?token=${token}&${search}`,
  //   });
  // }
  res.end();
};
