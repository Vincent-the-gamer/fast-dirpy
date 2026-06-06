import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideosParallel } from '../utils/downloader'
import { useRandomUserAgent } from '../utils/userAgent'

export async function getLewdNinjaVideoLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const urlSuffix = url!.replace('https://new.lewd.ninja', '').trim()

  const apiUrl = `https://new.lewd.ninja/api${urlSuffix}`

  const { data } = await axios.get(apiUrl!, {
    headers: {
      'User-Agent': useRandomUserAgent(),
      'Referer': url,
    },
    proxy: _proxy,
    timeout,
  })

  const link = data.animation.video
  return link
}

export async function downloadLewdNinjaVideo(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const directLink = await getLewdNinjaVideoLink({
      url: param.url,
      cwd: param.cwd,
    }, options)
    directParams.push({ ...param, url: directLink })
  }

  await downloadVideosParallel(directParams)
}
