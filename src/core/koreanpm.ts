import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { useRandomUserAgent } from '../utils/userAgent'
import { downloadVideo } from './index'

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

export async function downloadKoreanPm(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { path, url, cwd } = params
  const directLink = await getKoreanPmLink({ url }, options)
  await downloadVideo({
    url: directLink,
    path,
    cwd,
  }, options)
}
