import { redirectDevScreenshotSystemPath } from '@/lib/dev/screenshot-harness';

export async function redirectSystemPath({ path }: { path: string; initial: boolean }): Promise<string> {
  return redirectDevScreenshotSystemPath(path);
}
