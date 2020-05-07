import mongoose from 'mongoose';
import { serverConfig } from '../config/server';
import { sentry } from '../sentry';

const { captureException } = sentry();

// Do not allow usage before connected
mongoose.set('bufferCommands', false);
mongoose.set('useFindAndModify', false);

const CONNECTION_URL = serverConfig.MONGO_URL;

let connected = false;
export async function connect() {
  if (connected) {
    return;
  }

  try {
    await mongoose.connect(CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: serverConfig.MONGO_DATABASE,
    });
    connected = true;
  } catch (e) {
    captureException(e, {});
    console.error(e);
    process.exit(1);
  }
}

export * from './store';
export * from './user';
export * from './login';
export * from './vercel';
