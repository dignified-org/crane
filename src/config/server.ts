import { object, string } from 'yup';

export interface ServerConfig {
  SHOPIFY_SHARED_SECRET: string;
  MONGO_URL: string;
  MONGO_DATABASE: string;
  PUSHER_APP_ID: string;
  PUSHER_SHARED_SECRET: string;
}

const CONFIG_SCHEMA = object<ServerConfig>({
  SHOPIFY_SHARED_SECRET: string().required(),
  MONGO_URL: string().required(),
  MONGO_DATABASE: string().required(),
  PUSHER_APP_ID: string().required(),
  PUSHER_SHARED_SECRET: string().required(),
}).noUnknown(false);

export const serverConfig: ServerConfig = CONFIG_SCHEMA.validateSync(
  process.env,
);
