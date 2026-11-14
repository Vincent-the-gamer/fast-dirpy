import type { DirectLinkParams, DownloadParams, M3U8Params, Options } from '../types'
import { readFile } from 'node:fs/promises'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from '../utils/logger'
import { useRandomUserAgent } from '../utils/userAgent'
import { remoteM3U8ToMP4Parallel } from './m3u8'

const MISSAV_REFERER = 'https://missav.ws/'
const MISSAV_ORIGIN = 'https://missav.ws'

function buildMissavHeaders(options: Partial<Options>, userAgent: string): Record<string, any> {
  return {
    ...(options.headers || {}),
    'User-Agent': userAgent,
    'Referer': options.headers?.Referer || MISSAV_REFERER,
    'Origin': options.headers?.Origin || MISSAV_ORIGIN,
  }
}

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

export async function getMissavLink(
  params: DirectLinkParams,
  options: Partial<Options> = DEFAULT_OPTIONS,
  requestHeaders?: Record<string, any>,
) {
  const { cwd, url } = params
  const { proxy, timeout } = await resolveConfig(options, cwd)

  if (!url) {
    logger.error('url is required for getMissavLink.')
    return null
  }

  const headers = requestHeaders || buildMissavHeaders(options, useRandomUserAgent())

  if (url.startsWith('missav:')) {
    const htmlPagePath = url.replace('missav:', '').trim()
    const htmlPage = await readFile(htmlPagePath, 'utf-8')
    const uuid = await getUuid(htmlPage)
    if (!uuid)
      return null

    const playlist = `https://surrit.com/${uuid}/playlist.m3u8`
    const { data: list } = await axios.get(playlist, {
      headers,
      proxy,
      timeout,
    })
    const regex = /(?:\d+p|\d+x\d+)\/video\.m3u8/g
    const matches = list.match(regex)
    if (!matches || matches.length === 0) {
      logger.error('Failed to extract m3u8 variant from playlist.')
      return null
    }

    const m3u8Url = `https://surrit.com/${uuid}/${matches.at(-1)}`
    return m3u8Url
  }
  else {
    const { data: htmlPage } = await axios.get(url, {
      headers,
      proxy,
      timeout,
    })
    const uuid = await getUuid(htmlPage)
    if (!uuid)
      return null

    const playlist = `https://surrit.com/${uuid}/playlist.m3u8`
    const { data: list } = await axios.get(playlist, {
      headers,
      proxy,
      timeout,
    })
    const regex = /(?:\d+p|\d+x\d+)\/video\.m3u8/g
    const matches = list.match(regex)
    if (!matches || matches.length === 0) {
      logger.error('Failed to extract m3u8 variant from playlist.')
      return null
    }

    const m3u8Url = `https://surrit.com/${uuid}/${matches.at(-1)}`
    return m3u8Url
  }
}

export async function downloadMissav(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS) {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  // Conservative profile for surrit.com to reduce request burst/risk-control triggers.
  const userAgent = useRandomUserAgent()
  const missavHeaders = buildMissavHeaders(options, userAgent)
  const missavOptions: Partial<Options> = {
    ...options,
    headers: missavHeaders,
  }

  const directParams: M3U8Params[] = []

  for (const param of params) {
    const { cwd, url }: any = param

    const directLink = await getMissavLink({
      url,
      cwd,
    }, missavOptions, missavHeaders)

    if (!directLink) {
      logger.error('Failed to resolve MissAV m3u8 link; skipping this item.')
      continue
    }

    directParams.push({
      ...(param as M3U8Params),
      url: directLink,
      // Serialize segment prefetch for this source.
      chunkReadahead: 1,
    })
  }

  if (directParams.length === 0)
    return

  await remoteM3U8ToMP4Parallel(directParams, missavOptions, 1)
}
