import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideosParallel } from '../utils/downloader'
import { logger } from '../utils/logger'
import { useRandomUserAgent } from '../utils/userAgent'

interface EpornerSource {
  url: string
  quality: number
  isAv1: boolean
}

function parseQuality(fileName: string): number {
  const match = fileName.match(/(\d+)p(?:-av1)?\.mp4/i)
  return match ? Number(match[1]) : 0
}

function normalizeUrl(href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://'))
    return href
  return `https://www.eporner.com${href.startsWith('/') ? href : `/${href}`}`
}

function pickBestSource(sources: EpornerSource[]): EpornerSource | undefined {
  if (sources.length === 0)
    return undefined

  const sorted = [...sources].sort((a, b) => {
    if (a.quality !== b.quality)
      return b.quality - a.quality
    // prefer h264 (non-av1) over av1 at same quality
    if (a.isAv1 !== b.isAv1)
      return a.isAv1 ? 1 : -1
    return 0
  })

  return sorted[0]
}

export async function getEpornerLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)
  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.get(url!, {
    headers: {
      'User-Agent': useRandomUserAgent(),
      'Referer': 'https://www.eporner.com/',
    },
    proxy: _proxy,
    timeout,
  })

  const $ = load(data)
  const found = new Set<string>()

  $('a[href*="/dload/"]').each((_i, el) => {
    const href = $(el).attr('href')
    if (href && href.includes('/dload/') && href.includes('.mp4'))
      found.add(href)
  })

  // fallback: scan raw html for /dload/ links
  const regex = /\/dload\/[^\s"'<>]+\.mp4/gi
  const matches = data.match(regex) || []
  for (const m of matches)
    found.add(m)

  const sources: EpornerSource[] = Array.from(found).map((href) => {
    const abs = normalizeUrl(href)
    const fileName = abs.split('/').pop() || ''
    return {
      url: abs,
      quality: parseQuality(fileName),
      isAv1: /-av1\.mp4$/i.test(fileName),
    }
  }).filter(s => s.quality > 0)

  const best = pickBestSource(sources)
  if (!best) {
    return Promise.reject(
      new Error('Failed to extract Eporner download link from page'),
    )
  }

  logger.info(`Eporner: selected ${best.quality}p${best.isAv1 ? ' AV1' : ''} source.`)
  return best.url
}

export async function downloadEporner(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const { url, cwd } = param
    const directLink = await getEpornerLink({ url, cwd }, options)
    directParams.push({ ...param, url: directLink })
  }

  if (directParams.length > 0) {
    await downloadVideosParallel(directParams, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Referer: 'https://www.eporner.com/',
      },
    })
  }
}
