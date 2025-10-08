import type { DownloadParams, Options } from '../types'

import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from '../utils/logger'
import M3U8Downloader from '@renmu/m3u8-downloader'


/**
 * Get remote m3u8 stream, then use ffmpeg to parse it to mp4.
 */
export async function remoteM3U8ToMP4(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS) {
  const { cwd, url, path } = params

  const { ffmpeg } = await resolveConfig(options, cwd)

  const downloader = new M3U8Downloader(
    url,
    path || `./m3u8-downloader.mp4`,
    {
      convert2Mp4: true,
      ffmpegPath: ffmpeg,
    }
  )

  downloader.download()

  downloader.on("progress", progress => {
    logger.info(`Download progress: ${progress.downloaded}/${progress.total}`);
  });

  downloader.on("completed", () => {
    logger.info("Download completed");
  });

  downloader.on("error", error => {
    logger.error("Error occurred:", error);
  });
}
