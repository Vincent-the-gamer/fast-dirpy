import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { useRandomUserAgent } from '../utils/userAgent'
import { readFile } from 'node:fs/promises'
import { remoteM3U8ToMP4Parallel } from './m3u8'
import { logger } from '../utils/logger'

export async function getXHamsterLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  let page: string

  if (url!.startsWith("xhamster:")) {
    const htmlPagePath = url!.replace("xhamster:", "").trim()
    page = await readFile(htmlPagePath, "utf-8")
  } else {
    const { data } = await axios.get(url!, {
      headers: {
        'User-Agent': useRandomUserAgent(),
        'Referer': 'https://xhamster.com',
      },
      proxy: _proxy,
      timeout,
    })
    page = data
  }

  const $ = load(page)

  let link = ''

  const videoLinkDomAttr = $('head link[rel="preload"][crossorigin="true"][as="fetch"]').attr()

  if (videoLinkDomAttr) {
    link = videoLinkDomAttr.href
  }

  return link
}

export async function downloadXHamster(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const { url, cwd } = param

    let directLink = await getXHamsterLink({ url, cwd }, options)
    if (!directLink) {
      return Promise.reject(
        new Error('Failed to fetch XHamster video link'),
      )
    }

    if (directLink.includes('2160p')) {
      directLink = directLink.replace('_TPL_', '2160p')
      logger.info('Max 2160p link found, downloading 2160p video source.')
    }
    else if (directLink.includes('1080p')) {
      directLink = directLink.replace('_TPL_', '1080p')
      logger.info('Max 1080p link found, downloading 1080p video source.')
    }
    else if (directLink.includes('720p')) {
      directLink = directLink.replace('_TPL_', '720p')
      logger.info('Max 720p link found, downloading 720p video source.')
    }
    else if (directLink.includes('480p')) {
      directLink = directLink.replace('_TPL_', '480p')
      logger.info('Max 480p link found, downloading 480p video source.')
    }
    else if (directLink.includes('240p')) {
      directLink = directLink.replace('_TPL_', '240p')
      logger.info('Max 240p link found, downloading 240p video source.')
    }
    else {
      directLink = directLink.replace('_TPL_', '144p')
      logger.info('Max 144p link found, downloading 144p video source.')
    }

    directParams.push({ ...param, url: directLink })
  }

  await remoteM3U8ToMP4Parallel(directParams)
}
