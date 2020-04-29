import { object, string } from 'yup';

export interface ServerConfig {
  SHOPIFY_SHARED_SECRET: string;
}

const CONFIG_SCHEMA = object<ServerConfig>({
  SHOPIFY_SHARED_SECRET: string().required(),
}).noUnknown(false);

export const serverConfig: ServerConfig = CONFIG_SCHEMA.validateSync(
  process.env,
);
