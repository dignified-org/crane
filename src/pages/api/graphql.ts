import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { connect, findValidLogin } from '../../mongo';
import { server } from '../../schema';
import { validateShop } from '../../shopify';
import { serverConfig } from '../../config/server';

import { sentry } from '../../sentry';

sentry();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connect();

  if (req.method === 'POST') {
    const shop = req.headers['shopify-domain'];
    const tokenHeader = req.headers['authentication-token'];

    if (!validateShop(shop)) {
      res.status(400).send('Bad request');
      return;
    }

    const cookieName = `_${(shop as string).replace('.myshopify.com', '')}`;
    let cookies;
    try {
      cookies = parse(req.headers.cookie);
    } catch (e) {
      res.status(403).send('Bad request');
      return;
    }

    const tokenSignature = cookies[cookieName];

    if (!tokenSignature) {
      res.status(403).send('Unauthorized');
      return;
    }

    try {
      const session = await jwt.verify(
        `${tokenHeader}.${tokenSignature}`,
        serverConfig.SHOPIFY_SHARED_SECRET,
        {
          algorithms: ['HS256'],
        },
      );

      const { userId } = session as any;

      const login = await findValidLogin(userId, shop as string);

      if (!login) {
        res.status(403).send('Unauthorized');
        return;
      }

      (req as any).session = login;
    } catch (e) {
      res.status(403).send('Unauthorized');
      return;
    }
  }

  return await server.createHandler({ path: '/api/graphql' })(req, res);
};
