import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { useRandomUserAgent } from '../utils/userAgent'
import { remoteM3U8ToMP4 } from './m3u8'

export async function getXHamsterLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': useRandomUserAgent(),
      'Referer': 'https://xhamster.com',
    },
    proxy: _proxy,
    timeout,
  })

  const $ = load(data)

  let link = ''

  const videoLinkDomAttr = $('head link[rel="preload"][crossorigin="true"][as="fetch"]').attr()

  if (videoLinkDomAttr) {
    link = videoLinkDomAttr.href
  }

  return link
}

export async function downloadXHamster(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { path, url, cwd } = params
  let directLink = await getXHamsterLink({ url }, options)
  if (!directLink) {
    return Promise.reject(
      new Error('Failed to fetch XHamster video link'),
    )
  }

  if (directLink.includes('1080p')) {
    directLink = directLink.replace('_TPL_', '1080p')
  }
  else if (directLink.includes('720p')) {
    directLink = directLink.replace('_TPL_', '720p')
  }
  else if (directLink.includes('480p')) {
    directLink = directLink.replace('_TPL_', '480p')
  }
  else if (directLink.includes('240p')) {
    directLink = directLink.replace('_TPL_', '240p')
  }
  else {
    directLink = directLink.replace('_TPL_', '144p')
  }

  remoteM3U8ToMP4({
    url: directLink,
    cwd,
    path: path || `./xhamster-vid.mp4`,
  })
}
