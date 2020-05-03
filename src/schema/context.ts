import { NextApiRequest, NextApiResponse } from 'next';
import { Store, findStoreByDomain, Login } from '../mongo';

/**
 * Context passed to resolvers
 * @export
 * @interface Context
 */
export interface Context {
  host: string;
  shop: string;
  token: string;
  login: Login;
  store: Store;
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

  const login = (req as any).session as Login;
  const store = await findStoreByDomain(login.shop);

  return {
    host,
    shop: login.shop,
    token: login.token,
    login,
    store,
  };
}
