import { object, string } from 'yup';

export interface SharedConfig {
  SHOPIFY_API_KEY: string;
  SHOPIFY_APP_HANDLE?: string;
  SENTRY_DSN: string;
  SENTRY_RELEASE: string;
}

const CONFIG_SCHEMA = object<SharedConfig>({
  SHOPIFY_API_KEY: string().required(),
  SHOPIFY_APP_HANDLE: string(),
  SENTRY_DSN: string().required(),
  SENTRY_RELEASE: string().required(),
}).noUnknown(false);

export const sharedConfig: SharedConfig = CONFIG_SCHEMA.validateSync({
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_APP_HANDLE: process.env.SHOPIFY_APP_HANDLE,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_RELEASE: process.env.SENTRY_RELEASE,
});
