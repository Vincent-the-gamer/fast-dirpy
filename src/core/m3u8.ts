import type { M3U8Params } from '../types'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import m3u8stream from 'm3u8stream'
import { __dirname } from '../constants'
import { logger } from '../utils/logger'

/**
 * Get remote m3u8 stream, parse it to mp4.
 */
export function remoteM3U8ToMP4(params: Partial<M3U8Params>) {
  const { url, path: _path } = params

  const filePath = _path ?? path.resolve(__dirname, '../m3u8-download.mp4')

  const stream = m3u8stream(url!)

  stream.pipe(createWriteStream(filePath))

  stream.on('progress', (segment, totalSegments, downloaded) => {
    logger.info(`Segment: ${JSON.stringify(segment)},
  Total Segments: ${totalSegments},
  downloaded: ${(downloaded / 1024 / 1024).toFixed(2)}MB Downloaded`)

    if (segment.num >= totalSegments) {
      stream.end()
    }
  })
}
