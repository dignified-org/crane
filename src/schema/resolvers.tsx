import { Resolvers } from './generated';
import { queryMe } from './me';
import { findVercelByUserId } from '../mongo';
import {
  generateAuthRedirect,
  createProject,
  createSecret,
  createEnv,
  deployFromRepo,
} from '../vercel';
import { createStorefrontToken } from '../shopify/client';

export const resolvers: Resolvers = {
  Query: {
    me: queryMe,
  },
  User: {
    vercel: async user => {
      return await findVercelByUserId(user.id);
    },
  },
  Mutation: {
    userLinkVercel: async (_parent, _args, context) => {
      return await generateAuthRedirect(context.user.id, context.shop);
    },
    vercelDeployStarter: async (_parent, args, context) => {
      const { name } = args;

      const vercel = await findVercelByUserId(context.user.id);

      if (!vercel) {
        throw new Error('Must link Vercel account');
      }

      const shop = context.store.domain;
      const shopSlug = shop.replace('.myshopify.com', '');

      // We need a storefront access token
      const storefrontToken = await createStorefrontToken(
        shop,
        context.store.token,
        `vercel-${name}`,
      );

      if (!storefrontToken) {
        throw new Error('Failed to create storefront token');
      }

      // We need to create a project
      const project = await createProject(vercel.token, name);

      // We need to create 2 secrets
      const shopSecret = await createSecret(
        vercel.token,
        `crane-${shopSlug}-shop-name-${name}`,
        shop,
      );
      const tokenSecret = await createSecret(
        vercel.token,
        `crane-${shopSlug}-shop-token-${name}`,
        storefrontToken,
      );

      await createEnv(vercel.token, project.id, 'SHOP_NAME', shopSecret.uid);
      await createEnv(
        vercel.token,
        project.id,
        'SHOPIFY_ACCESS_TOKEN',
        tokenSecret.uid,
      );

      const { url } = await deployFromRepo(vercel.token, name);

      return url;
    },
  },
};
