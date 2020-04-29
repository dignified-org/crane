import { object, string, boolean } from 'yup';

export interface SharedConfig {
  DEV: boolean;
  SHOPIFY_API_KEY: string;
  SHOPIFY_APP_HANDLE?: string;
  PUSHER_API_KEY: string;
  PUSHER_CLUSTER: string;
  SENTRY_DSN: string;
  SENTRY_RELEASE: string;
}

const CONFIG_SCHEMA = object<SharedConfig>({
  DEV: boolean().required(),
  SHOPIFY_API_KEY: string().required(),
  SHOPIFY_APP_HANDLE: string(),
  PUSHER_API_KEY: string().required(),
  PUSHER_CLUSTER: string().required(),
  SENTRY_DSN: string().required(),
  SENTRY_RELEASE: string().required(),
}).noUnknown(false);

export const sharedConfig: SharedConfig = CONFIG_SCHEMA.validateSync({
  DEV: process.env.NODE_ENV === 'development',
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_APP_HANDLE: process.env.SHOPIFY_APP_HANDLE,
  PUSHER_API_KEY: process.env.PUSHER_API_KEY,
  PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_RELEASE: process.env.SENTRY_RELEASE,
});
