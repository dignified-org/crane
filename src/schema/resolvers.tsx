import slugify from 'slugify';
import fetch from 'isomorphic-unfetch';
import { Resolvers } from './generated';
import { queryMe } from './me';
import {
  findVercelByUserId,
  insertSite,
  findSiteByStoreDomain,
} from '../mongo';
import {
  generateAuthRedirect,
  createProject,
  createSecret,
  createEnv,
  // deployFromRepo,
  githubVerify,
  createRepo,
  pushStarterToRepo,
  linkProjectToRepo,
  createDeployHook,
  getProject,
} from '../vercel';
import { createStorefrontToken } from '../shopify/client';
import { screenshot } from '../screenshot';

async function createRepoAndPush(token, name, github) {
  await createRepo(token, name, github.id);
  await pushStarterToRepo(token, name, github.login);
}

export const resolvers: Resolvers = {
  Query: {
    me: queryMe,
    site: async (_parent, _args, context) => {
      const site = await findSiteByStoreDomain(context.shop);

      if (!site) {
        return null;
      }

      const vercel = await findVercelByUserId(context.user.id);

      if (!vercel) {
        return null;
      }

      const project = await getProject(vercel.token, site.id);

      // console.log(project);

      const s: any = {
        id: site.id,
        name: site.name,
        url: `https://${project.alias[0].domain}`, // Should only be one for now
        building: project.targets.production.readyState !== 'READY',
      };

      s.thumbnail = screenshot(s.url);

      s.deployments = project.latestDeployments.map(d => {
        return {
          id: d.id,
          createdAt: Math.round(d.createdAt / 1000), // Was too big as int
          building: d.readyState === 'BUILDING',
          error: d.readyState !== 'READY' && d.readyState !== 'BUILDING',
          url: `https://${d.url}`,
        };
      });

      return s;
    },
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
    vercelDeploy: async (_parent, _args, context) => {
      const site = await findSiteByStoreDomain(context.shop);

      if (!site) {
        return null;
      }

      const response = await fetch(site.deployHook);

      if (!response.ok) {
        throw new Error('Failed');
      }
    },
    vercelDeployStarter: async (_parent, args, context) => {
      const { name: rawName } = args;

      const name = slugify(rawName, {
        replacement: '-', // replace spaces with replacement character, defaults to `-`
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
      });

      const vercel = await findVercelByUserId(context.user.id);

      if (!vercel) {
        throw new Error('Must link Vercel account');
      }

      const github = await githubVerify(vercel.token);

      if (!github) {
        throw new Error('Must link Github via Vercel');
      }

      // Try to do this in parallel - these requests are very network heavy
      const setupRepoPromise = createRepoAndPush(vercel.token, name, github);

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
      const storefrontSecret = await createSecret(
        vercel.token,
        `crane-${shopSlug}-shop-storefront-${name}`,
        storefrontToken,
      );
      const adminSecret = await createSecret(
        vercel.token,
        `crane-${shopSlug}-shop-admin-${name}`,
        context.store.token, // NOT FOR PRODUCTION!!
      );

      await createEnv(vercel.token, project.id, 'SHOP_NAME', shopSecret.uid);
      await createEnv(
        vercel.token,
        project.id,
        'SHOPIFY_ACCESS_TOKEN',
        storefrontSecret.uid,
      );
      await createEnv(
        vercel.token,
        project.id,
        'SHOPIFY_ADMIN_TOKEN',
        adminSecret.uid,
      );

      // Not needed! Double deploy
      // const { url } = await deployFromRepo(vercel.token, name);

      await setupRepoPromise;
      await linkProjectToRepo(vercel.token, project.id, name);

      const deployHook = await createDeployHook(vercel.token, project.id);

      await insertSite({
        deployHook,
        id: project.id,
        name,
        storeDomain: context.store.domain,
      });

      return '';
    },
  },
};
