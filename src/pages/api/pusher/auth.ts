import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import Pusher from 'pusher';
import { sharedConfig } from '../../../config';
import { serverConfig } from '../../../config/server';

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const pusher = new Pusher({
  appId: serverConfig.PUSHER_APP_ID,
  key: sharedConfig.PUSHER_API_KEY,
  secret: serverConfig.PUSHER_SHARED_SECRET,
  cluster: sharedConfig.PUSHER_CLUSTER,
  useTLS: true,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);

  const { socket_id: socketId, channel_name: channel } = req.body;
  const auth = pusher.authenticate(socketId, channel);

  res.send(auth);
};
