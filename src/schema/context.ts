import { NextApiRequest, NextApiResponse } from 'next';
import { Store, findStoreByDomain } from '../mongo';

/**
 * Context passed to resolvers
 * @export
 * @interface Context
 */
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

/**
 * Creates graphql context from api request
 *
 * @param {CreateContextProps} props
 * @returns
 */
export async function createContext(props: CreateContextProps) {
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
