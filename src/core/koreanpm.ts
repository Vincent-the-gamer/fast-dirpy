import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideosParallel } from '../utils/downloader'
import { useRandomUserAgent } from '../utils/userAgent'

export async function getKoreanPmLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': useRandomUserAgent(),
    },
    proxy: _proxy,
    timeout,
  })

  const $ = load(data)

  let link = ''

  const videoLinkDom = $('meta[itemprop="contentURL"]').attr()

  if (videoLinkDom) {
    link = videoLinkDom.content
  }

  return link
}

export async function downloadKoreanPm(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const { url, cwd } = param
    const directLink = await getKoreanPmLink({ url, cwd }, options)
    directParams.push({ ...param, url: directLink })
  }

  if (directParams.length > 0) {
    await downloadVideosParallel(directParams)
  }
}
