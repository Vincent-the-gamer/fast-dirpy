import type { DirectLinkParams, DownloadParams, Options } from '../types'
import { readFile } from 'node:fs/promises'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from '../utils/logger'
import { useRandomUserAgent } from '../utils/userAgent'
import { remoteM3U8ToMP4Parallel } from './m3u8'

async function getUuid(html: string) {
  const regex = /m3u8\|([a-f0-9|]+)\|com\|surrit\|https\|video/
  const uuidMatch = html.match(regex)
  if (!uuidMatch) {
    logger.error('Failed to extract UUID from HTML.')
    return null
  }

  const uuidResult = uuidMatch[1]
  const uuid = uuidResult.split('|').reverse().join('-')

  return uuid
}

export async function getMissavLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS) {
  const { cwd, missavHtmlPage } = params
  const { proxy, timeout } = await resolveConfig(options, cwd)

  if (!missavHtmlPage) {
    logger.error('missavHtmlPage is required for getMissavLink.')
    return null
  }

  const uuid = await getUuid(missavHtmlPage)
  const playlist = `https://surrit.com/${uuid}/playlist.m3u8`
  const { data: list } = await axios.get(playlist, {
    headers: {
      'User-Agent': useRandomUserAgent(),
      'Referer': options.headers?.Referer || 'https://missav.ws/',
    },
    proxy,
    timeout,
  })
  const regex = /(?:\d+p|\d+x\d+)\/video\.m3u8/g
  const matches = list.match(regex)

  const m3u8Url = `https://surrit.com/${uuid}/${matches.at(-1)}`
  return m3u8Url
}

export async function downloadMissav(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS) {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams: DownloadParams[] = []

  for (const param of params) {
    const { cwd, url }: any = param

    if (!url || !url.includes('missav:')) {
      logger.warn(`Invalid missavHtmlPath: ${url}`)
      continue
    }

    const missavHtmlPath = url.replace('missav:', '').trim()
    const missavHtmlPage = await readFile(missavHtmlPath, 'utf-8')

    const directLink = await getMissavLink({
      missavHtmlPage,
      cwd,
    }, options)
    directParams.push({ ...param, url: directLink! })
  }

  const _options = {
    ...options,
    headers: {
      'Referer': options.headers?.Referer || 'https://missav.ws/',
    },
  }

  await remoteM3U8ToMP4Parallel(directParams, _options)
}
