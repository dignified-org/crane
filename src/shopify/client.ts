import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const API_VERSION = '2020-04';

export interface ClientConfig {
  shop: string;
  token: string;
}

// eslint-disable-next-line import/prefer-default-export
export function createClient(config: ClientConfig) {
  const { shop, token } = config;

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
      headers: {
        'X-Shopify-Access-Token': token,
      },
    }),
  });
}
