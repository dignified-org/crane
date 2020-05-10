import { object, string } from 'yup';

if (typeof window !== 'undefined') {
  throw new Error('Only accessible on the server');
}

export interface ServerConfig {
  SHOPIFY_SHARED_SECRET: string;
  MONGO_URL: string;
  MONGO_DATABASE: string;
  PUSHER_APP_ID: string;
  PUSHER_SHARED_SECRET: string;
  VERCEL_SHARED_SECRET: string;
  SCREENSHOTSCLOUD_API_KEY: string;
  SCREENSHOTSCLOUD_SHARED_SECRET: string;
}

const CONFIG_SCHEMA = object<ServerConfig>({
  SHOPIFY_SHARED_SECRET: string().required(),
  MONGO_URL: string().required(),
  MONGO_DATABASE: string().required(),
  PUSHER_APP_ID: string().required(),
  PUSHER_SHARED_SECRET: string().required(),
  VERCEL_SHARED_SECRET: string().required(),
  SCREENSHOTSCLOUD_API_KEY: string().required(),
  SCREENSHOTSCLOUD_SHARED_SECRET: string().required(),
}).noUnknown(false);

export const serverConfig: ServerConfig = CONFIG_SCHEMA.validateSync({
  ...process.env,
  VERCEL_SHARED_SECRET: process.env.CRANE_VERCEL_SHARED_SECRET,
});
