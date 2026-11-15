import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideosParallel } from '../utils/downloader'
import { logger } from '../utils/logger'
import { useRandomUserAgent } from '../utils/userAgent'

const BILIBILI_PARSE_API = 'https://xapi.peanutdl.com/beibei'

interface BilibiliParseResponse {
  status?: number
  mp4?: {
    status?: number
    player_url?: string
    info_description?: string
    info_size?: string
  }
  video_audio?: {
    status?: number
    Array_Video?: Array<{
      status?: number
      id?: string
      title?: string
      codecs?: string
      bandwidth?: string
      info_base_url?: string
    }>
    Array_Audio?: Array<{
      status?: number
      id?: string
      title?: string
      codecs?: string
      bandwidth?: string
      info_base_url?: string
    }>
  }
  info?: {
    Title?: string
    Bvid?: string
  }
  message?: string
  msg?: string
  error?: string
}

function pickBestDashUrl(items?: Array<{ status?: number; info_base_url?: string; bandwidth?: string; id?: string }>): string | undefined {
  if (!items || items.length === 0)
    return undefined

  const valid = items.filter(item => item?.status === 0 && item.info_base_url)
  if (valid.length === 0)
    return undefined

  const sorted = [...valid].sort((a, b) => Number(b.bandwidth || 0) - Number(a.bandwidth || 0))
  return sorted[0]?.info_base_url
}

export async function getBilibiliLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  if (!url) {
    return Promise.reject(new Error('url is required for getBilibiliLink.'))
  }

  const { proxy, timeout } = await resolveConfig(options, cwd)
  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.post<BilibiliParseResponse>(
    BILIBILI_PARSE_API,
    {
      api: 'BEIBEI',
      url,
      captcha: '',
      id: '',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': useRandomUserAgent(),
        'Origin': 'https://peanutdl.com',
        'Referer': 'https://peanutdl.com/',
        ...(options.headers || {}),
      },
      proxy: _proxy,
      timeout: timeout || 30000,
    },
  )

  if (data?.status !== 0) {
    const message = data?.message || data?.msg || data?.error || 'Unknown parse error'
    return Promise.reject(new Error(`Failed to parse Bilibili video: ${message}`))
  }

  // Prefer combined mp4 when available.
  if (data.mp4?.status === 0 && data.mp4.player_url) {
    if (data.mp4.info_description) {
      logger.info(`Bilibili: selected combined MP4 source (${data.mp4.info_description}).`)
    }
    return data.mp4.player_url
  }

  // Fallback: best separate video stream URL (audio merging not handled automatically).
  const bestVideo = pickBestDashUrl(data.video_audio?.Array_Video)
  if (bestVideo) {
    logger.info('Bilibili: combined MP4 unavailable, using best DASH video stream (audio may require separate handling).')
    return bestVideo
  }

  return Promise.reject(new Error('Failed to extract a downloadable Bilibili URL from parse response.'))
}

export async function downloadBilibili(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const { url, cwd } = param
    const directLink = await getBilibiliLink({ url, cwd }, options)
    directParams.push({ ...param, url: directLink })
  }

  if (directParams.length > 0) {
    await downloadVideosParallel(directParams, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Referer: 'https://www.bilibili.com/',
      },
    })
  }
}
