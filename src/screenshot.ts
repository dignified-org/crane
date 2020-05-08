import ScreenshotsCloud from 'screenshotscloud';
import { serverConfig } from './config/server';

const screenshotscloud = ScreenshotsCloud(
  serverConfig.SCREENSHOTSCLOUD_API_KEY,
  serverConfig.SCREENSHOTSCLOUD_SHARED_SECRET,
);

export function screenshot(url: string) {
  return screenshotscloud.screenshotUrl({
    url,
    width: 800,
  });
}
