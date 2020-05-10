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
    // eslint-disable-next-line @typescript-eslint/camelcase
    cache_time: 5 * 60, // 5m
  });
}
