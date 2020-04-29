import { object, string } from 'yup';

export interface ServerConfig {
  SHOPIFY_SHARED_SECRET: string;
  MONGO_URI: string;
  MONGO_DATABASE: string;
  MONGO_USERNAME: string;
  MONGO_PASSWORD: string;
}

const CONFIG_SCHEMA = object<ServerConfig>({
  SHOPIFY_SHARED_SECRET: string().required(),
  MONGO_URI: string().required(),
  MONGO_DATABASE: string().required(),
  MONGO_USERNAME: string().required(),
  MONGO_PASSWORD: string().required(),
}).noUnknown(false);

export const serverConfig: ServerConfig = CONFIG_SCHEMA.validateSync(
  process.env,
);
