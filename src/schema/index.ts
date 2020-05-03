import { ApolloServer } from 'apollo-server-micro';

import { createContext } from './context';
import { resolvers } from './resolvers';

import typeDefs from '../../schema/root.graphql';

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint: '/api/graphql',
  },
  introspection: true,
  context: createContext,
});
