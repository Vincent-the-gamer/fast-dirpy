import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { useRandomUserAgent } from '../utils/userAgent'
import { downloadVideosParallel } from '../utils/downloader'

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

    directParams.push({ ...param, url: directLink })
  }

  await downloadVideosParallel(directParams)
}
