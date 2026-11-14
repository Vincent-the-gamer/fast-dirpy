import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideosParallel } from '../utils/downloader'
import { logger } from '../utils/logger'
import { useRandomUserAgent } from '../utils/userAgent'

interface MediaDefinition {
  format?: string
  videoUrl?: string
  quality?: string | number | number[]
  defaultQuality?: boolean | number
  remote?: boolean
}

interface MediaStream {
  format?: string
  quality?: string | number
  videoUrl?: string
  defaultQuality?: boolean
}

function extractMediaEndpoint(page: string): string | null {
  // Prefer mediaDefinitions (JSON-like) then mediaDefinition
  const keyMatch = page.match(/mediaDefinitions?\s*:\s*(\[[\s\S]*?\])\s*,/)
    || page.match(/mediaDefinitions?\s*:\s*(\[[\s\S]*?\])\s*}/)

  if (keyMatch) {
    try {
      const defs = JSON.parse(keyMatch[1]) as MediaDefinition[]
      const mp4Def = defs.find(d => typeof d.videoUrl === 'string' && d.videoUrl.includes('/media/mp4/'))
        || defs.find(d => typeof d.videoUrl === 'string')
      if (mp4Def?.videoUrl)
        return mp4Def.videoUrl.replace(/\\\//g, '/')
    }
    catch {
      // fall through to regex extraction
    }
  }

  const urlMatch = page.match(/"videoUrl"\s*:\s*"(https?:\\\/\\\/[^"]*\/media\/mp4\/\?s=[^"]+)"/)
    || page.match(/"videoUrl"\s*:\s*"(https?:\/\/[^"]*\/media\/mp4\/\?s=[^"]+)"/)

  if (urlMatch)
    return urlMatch[1].replace(/\\\//g, '/')

  return null
}

function qualityValue(q: MediaStream): number {
  if (typeof q.quality === 'number')
    return q.quality
  if (typeof q.quality === 'string') {
    const n = Number.parseInt(q.quality, 10)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function pickBestStream(streams: MediaStream[]): MediaStream | null {
  if (!streams.length)
    return null

  const sorted = [...streams].sort((a, b) => {
    const aq = qualityValue(a)
    const bq = qualityValue(b)
    if (bq !== aq)
      return bq - aq
    if (a.defaultQuality !== b.defaultQuality)
      return a.defaultQuality ? -1 : 1
    return 0
  })

  return sorted.find(s => s.videoUrl) || null
}

export async function getYoupornLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  if (!url) {
    return Promise.reject(new Error('url is required for getYoupornLink.'))
  }

  const { proxy, timeout } = await resolveConfig(options, cwd)
  const _proxy = proxy?.host !== '' ? proxy : undefined
  const userAgent = options.headers?.['User-Agent'] || options.headers?.['user-agent'] || useRandomUserAgent()

  const { data: page } = await axios.get(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      ...(options.headers || {}),
    },
    proxy: _proxy,
    timeout,
  })

  const mediaEndpoint = extractMediaEndpoint(page)
  if (!mediaEndpoint) {
    return Promise.reject(new Error('Failed to extract YouPorn media endpoint from page.'))
  }

  const { data: streams } = await axios.get(mediaEndpoint, {
    headers: {
      'User-Agent': userAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': url,
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      ...(options.headers || {}),
    },
    proxy: _proxy,
    timeout,
  })

  if (!Array.isArray(streams) || streams.length === 0) {
    return Promise.reject(new Error('Failed to fetch YouPorn media streams.'))
  }

  const best = pickBestStream(streams as MediaStream[])
  if (!best?.videoUrl) {
    return Promise.reject(new Error('Failed to select a YouPorn video URL.'))
  }

  const label = best.quality ? `${best.quality}p` : 'default'
  logger.info(`YouPorn: selected ${label} MP4 source.`)

  return best.videoUrl
}

export async function downloadYouporn(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const { url, cwd } = param
    const directLink = await getYoupornLink({ url, cwd }, options)
    directParams.push({ ...param, url: directLink })
  }

  if (directParams.length > 0) {
    await downloadVideosParallel(directParams, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Referer: 'https://www.youporn.com/',
      },
    })
  }
}
