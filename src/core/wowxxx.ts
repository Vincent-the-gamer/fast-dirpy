import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideo } from '../utils/downloader'
import { logger } from '../utils/logger'
import { useRandomUserAgent } from '../utils/userAgent'

// Sort the video sizes, ensure the large size video to be at the end of array.
function compareSize(a: Record<string, any>, b: Record<string, any>) {
    const sizeA = a.label.slice(0, a.label.length - 1)
    const sizeB = b.label.slice(0, b.label.length - 1)
    return Number(sizeA) - Number(sizeB)
}

export async function getWowxxxLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<Record<string, any>[]> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': useRandomUserAgent(),
      'Referer': `https://www.wow.xxx/`,
    },
    proxy: _proxy,
    timeout,
  })

  const $ = load(data)

  const mediaSourceDoms: Record<string, any> = $('source[type="video/mp4"]')

  const sources = Object.values(mediaSourceDoms)
    .map(i => i.attribs)
    .filter(i => i !== undefined && i !== null)
    .sort(compareSize)

  return sources
}

export async function downloadWowxxx(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { path, url, cwd } = params
  const directLinks = await getWowxxxLink({ url }, options)

  if (directLinks.length > 0) {
    logger.success(`Successfully get video sources, size ${directLinks[directLinks.length - 1].label} to be downloaded.`)
  }

  await downloadVideo({
    url: directLinks[directLinks.length - 1].src,
    path,
    cwd,
  }, options)
}
