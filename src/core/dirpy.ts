import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { useRandomUserAgent } from '../utils/userAgent'
import { downloadVideo } from '../utils/downloader'

export async function getDirpyLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.get('https://dirpy.com/studio', {
    params: {
      url,
    },
    headers: {
      'User-Agent': useRandomUserAgent(),
      'Referer': `https://dirpy.com/studio?url=${url}`,
    },
    proxy: _proxy,
    timeout,
  })

  const $ = load(data)

  let src = ''

  const mediaSourceDom = $('#media-source').attr()

  if (mediaSourceDom) {
    src = mediaSourceDom.src
  }

  return src
}

export async function downloadDirpy(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { path, url, cwd } = params
  const directLink = await getDirpyLink({ url }, options)
  await downloadVideo({
    url: directLink,
    path,
    cwd,
  }, options)
}
