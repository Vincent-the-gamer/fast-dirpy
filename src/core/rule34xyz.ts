import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideosParallel } from '../utils/downloader'
import { useRandomUserAgent } from '../utils/userAgent'

export async function getRule34XyzVideoLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.get(url!, {
    headers: {
      'User-Agent': useRandomUserAgent(),
      'Referer': `https://rule34.xyz`,
    },
    proxy: _proxy,
    timeout,
  })

  const $ = load(data)

  let src = ''

  const mediaSourceDom = $('source[type="video/mp4"]').attr()

  if (mediaSourceDom) {
    const original = mediaSourceDom.src
    const highres = original.replace('mov480', 'mov')
    src = `https://rule34.xyz${highres}`
  }

  return src
}

export async function downloadRule34XyzVideo(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const directLink = await getRule34XyzVideoLink({
      url: param.url,
      cwd: param.cwd,
    }, options)
    directParams.push({ ...param, url: directLink })
  }

  await downloadVideosParallel(directParams)
}
