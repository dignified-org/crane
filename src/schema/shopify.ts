import fetch from 'isomorphic-unfetch';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import {
  makeRemoteExecutableSchema,
  makeExecutableSchema,
} from 'graphql-tools';

import typeDefs from './shopify.graphql';
import { Context } from './context';

const schema = makeExecutableSchema({
  typeDefs,
});

const http = new HttpLink({
  uri: `https://shopify.com/admin/api/${'2020-04'}/graphql.json`,
  fetch,
});

const link = setContext((_request, context: { graphqlContext: Context }) => {
  const { shop, token } = context.graphqlContext;

  return {
    uri: `https://${shop}/admin/api/${'2020-04'}/graphql.json`,
    headers: {
      'X-Shopify-Access-Token': token,
    },
  };
}).concat(http);

export const shopifySchema = makeRemoteExecutableSchema({
  schema,
  link,
});
