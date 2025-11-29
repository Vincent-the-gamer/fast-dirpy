import type { DownloadParams, Options } from '../types'
import fs from 'node:fs'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from './logger'
import { useRandomUserAgent } from './userAgent'

export async function downloadVideo(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { path, url } = params

  const { proxy, timeout } = await resolveConfig(options)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  if (url === '') {
    return Promise.reject('Extract direct link failed!')
  }

  const writer = fs.createWriteStream(path || './download.mp4')
  const response = await axios({
    url,
    headers: {
      'User-Agent': useRandomUserAgent(),
    },
    method: 'GET',
    responseType: 'stream',
    proxy: _proxy,
    timeout,
    onDownloadProgress: (progressEvent) => {
      const { loaded, total, progress } = progressEvent

      const message = `loaded:${loaded}  `
        + `total: ${total}  `
        + `progress: ${(progress! * 100).toFixed(2)}%`
      logger.info(message)
    },
  })
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}
