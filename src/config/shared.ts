import { object, string } from "yup";

export interface SharedConfig {
  SENTRY_DSN: string;
  SENTRY_RELEASE: string;
}

const CONFIG_SCHEMA = object<SharedConfig>({
  SENTRY_DSN: string().required(),
  SENTRY_RELEASE: string().required(),
}).noUnknown(false);

export const sharedConfig: SharedConfig = CONFIG_SCHEMA.validateSync(process.env);