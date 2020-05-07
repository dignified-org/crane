import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';

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
      uri: `https://${shop}/admin/api/${'2020-04'}/graphql.json`,
      headers: {
        'X-Shopify-Access-Token': token,
      },
    }),
  });
}

const STOREFRONT_TOKEN_CREATE_MUTATION = gql`
  mutation StorefrontTokenCreate($name: String!) {
    storefrontAccessTokenCreate(input: { title: $name }) {
      storefrontAccessToken {
        accessToken
      }
    }
  }
`;

export async function createStorefrontToken(
  shop: string,
  token: string,
  name: string,
) {
  const client = createClient({
    shop,
    token,
  });

  const result = await client.mutate({
    mutation: STOREFRONT_TOKEN_CREATE_MUTATION,
    variables: {
      name,
    },
  });

  return result.data?.storefrontAccessTokenCreate?.storefrontAccessToken
    ?.accessToken;
}
