import { URLSearchParams } from 'url';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApolloServer } from 'apollo-server-micro';

import typeDefs from '../../../schema/root.graphql';
import { sharedConfig } from '../../config';

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
  shop: string;
  token?: string;
}

interface CreateContextProps {
  req: NextApiRequest;
  res: NextApiResponse;
}

async function createContext(props: CreateContextProps) {
  const { req } = props;

  const shop = req.headers['shopify-domain'];
  const token = req.headers['authentication-token'];

  if (!shop || Array.isArray(shop)) {
    throw new Error('Invalid shop');
  }

  const { host } = req.headers;

  return {
    host,
    shop,
    token,
  };
}

const resolvers = {
  Query: {
    me: (_parent, _args, context: Context) => {
      const { host, shop } = context;

      return {
        redirect: generateRedirect({
          apiKey: sharedConfig.SHOPIFY_API_KEY,
          redirect: `https://${host}/api/shopify/callback`,
          online: true,
          shop,
          scopes: ['write_products'],
          nonce: 'fake',
        }),
      };
    },
  },
  Me: {
    __resolveType: () => 'Forbidden',
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

export default server.createHandler({ path: '/api/graphql' });
