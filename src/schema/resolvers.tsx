import { Resolvers } from './generated';
import { Me, queryMe } from './me';

export const resolvers: Resolvers = {
  Query: {
    me: queryMe,
  },
  Me,
};
