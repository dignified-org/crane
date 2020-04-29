import 'isomorphic-unfetch';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { shop, token } from '../config';

// eslint-disable-next-line import/prefer-default-export
export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: '/api/graphql',
    headers: {
      'Shopify-Domain': shop(),
      'Authentication-Token': token(),
    },
    credentials: 'same-origin',
  }),
});
