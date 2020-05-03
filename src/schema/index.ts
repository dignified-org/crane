import {
  ApolloServer,
  mergeSchemas,
  makeExecutableSchema,
} from 'apollo-server-micro';

import { createContext } from './context';
import { resolvers } from './resolvers';
import { shopifySchema } from './shopify';

import typeDefs from '../../schema/root.graphql';

const craneSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const schema = mergeSchemas({
  schemas: [craneSchema, shopifySchema],
});

export const server = new ApolloServer({
  schema,
  playground: {
    endpoint: '/api/graphql',
  },
  introspection: true,
  context: createContext,
});
