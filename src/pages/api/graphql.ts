import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '../../mongo';
import { server } from '../../schema';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connect();
  return await server.createHandler({ path: '/api/graphql' })(req, res);
};
