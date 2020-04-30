import { URLSearchParams } from 'url';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApolloServer } from 'apollo-server-micro';
import jwt from 'jsonwebtoken';

import shortid from 'shortid';
import typeDefs from '../../../schema/root.graphql';
import { sharedConfig } from '../../config';
import { connect, findStoreByDomain, Store } from '../../mongo';
import { serverConfig } from '../../config/server';

interface Props {
  shop: string;
  apiKey: string;
  nonce: string;
  redirect: string;
  scopes: string[];
  online?: boolean;
}

const generateRedirect = ({
  shop,
  apiKey,
  nonce,
  redirect,
  scopes,
  online = false,
}: Props) => {
  const baseUrl = `https://${shop}/admin/oauth/authorize`;
  const params = new URLSearchParams();

  params.set('client_id', apiKey);
  params.set('state', nonce);
  params.set('redirect_uri', redirect);
  params.set('scope', scopes.join());

  if (online) {
    params.set('grant_options[]', 'per-user');
  }

  return `${baseUrl}?${params.toString()}`;
};

export interface Context {
  host: string;
  shop?: string;
  token?: string;
  store?: Store;
}

interface CreateContextProps {
  req: NextApiRequest;
  res: NextApiResponse;
}

async function createContext(props: CreateContextProps) {
  const { req } = props;

  const { host } = req.headers;

  const shop = req.headers['shopify-domain'];
  const token = req.headers['authentication-token'];

  let store;
  if (shop) {
    store = await findStoreByDomain(shop as string);
  }

  return {
    host,
    shop,
    token,
    store,
  };
}

const resolvers = {
  Query: {
    me: async (_parent, args, context: Context) => {
      const { pathname = '/' } = args;
      const { host, shop, store } = context;

      if (!shop) {
        throw new Error('Invalid shop provided');
      }

      if (!store) {
        const nonce = await jwt.sign(
          {
            shop,
            pathname,
            state: shortid.generate(),
          },
          serverConfig.SHOPIFY_SHARED_SECRET,
          {
            algorithm: 'HS256',
          },
        );

        return {
          __typename: 'Forbidden',
          redirect: generateRedirect({
            apiKey: sharedConfig.SHOPIFY_API_KEY,
            redirect: `https://${host}/api/shopify/callback`,
            shop,
            scopes: [
              'write_products',
              'write_content',
              'read_product_listings',
              'write_customers',
              'write_inventory',
              'write_checkouts',
              'unauthenticated_read_product_listings',
              'unauthenticated_read_product_tags',
              'unauthenticated_write_checkouts',
              'unauthenticated_read_checkouts',
              'unauthenticated_write_customers',
              'unauthenticated_read_customers',
              'unauthenticated_read_customer_tags',
              'unauthenticated_read_content',
            ],
            nonce,
          }),
        };
      }

      return {
        __typename: 'User',
        email: 'me@fake.com',
      };
    },
  },
  Me: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType: me => me.__typename,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint: '/api/graphql',
  },
  introspection: true,
  context: createContext,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connect();
  return await server.createHandler({ path: '/api/graphql' })(req, res);
};
