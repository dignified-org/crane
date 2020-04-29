import { NextApiRequest, NextApiResponse } from 'next';
import safeCompare from 'safe-compare';
import { createHmac } from 'crypto';

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req);

  res.status(200).send('ok');
};
