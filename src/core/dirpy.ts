import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
// @ts-expect-error - missing type definitions
import jsdom from 'jsdom'
import { DEFAULT_DIRPY_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { useRandomUserAgent } from '../utils/userAgent'
import { downloadVideo } from './index'

const { JSDOM } = jsdom

export async function getDirpyLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_DIRPY_OPTIONS): Promise<string> {
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

  const { window } = new JSDOM(data)

  let src = ''

  const mediaSourceDom = window.document.getElementById('media-source')

  if (mediaSourceDom) {
    src = mediaSourceDom.src
  }

  return src
}

export async function downloadDirpy(params: DownloadParams, options: Partial<Options> = DEFAULT_DIRPY_OPTIONS): Promise<void> {
  const { path, url, cwd } = params
  const directLink = await getDirpyLink({ url }, options)
  await downloadVideo({
    url: directLink,
    path,
    cwd,
  }, options)
}
