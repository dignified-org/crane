import { Resolvers } from './generated';
import { queryMe } from './me';

export const resolvers: Resolvers = {
  Query: {
    me: queryMe,
  },
};
