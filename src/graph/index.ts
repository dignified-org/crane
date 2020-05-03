import 'isomorphic-unfetch';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client';
import { ErrorLink, ErrorResponse } from '@apollo/link-error';

import { shop, token } from '../config';
import { redirectToLogin } from '../pages/_app';

function errorHandler(response: ErrorResponse) {
  const { networkError } = response;

  if ((networkError as any)?.statusCode === 403) {
    // @todo if not first load, show modal
    redirectToLogin(shop());
  }
}

const link = ApolloLink.concat(
  new ErrorLink(errorHandler),
  new HttpLink({
    uri: '/api/graphql',
    headers: {
      'Shopify-Domain': shop(),
      'Authentication-Token': token(),
    },
    credentials: 'same-origin',
  }),
);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});
