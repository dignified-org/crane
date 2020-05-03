import { QueryResolvers } from './generated';

export const queryMe: QueryResolvers['me'] = async (parent, args, context) => {
  return context.user;
};
