import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { useRandomUserAgent } from '../utils/userAgent'
import { downloadVideo } from '../utils/downloader'
import { logger } from '../utils/logger'

// Sort the video sizes, ensure the large size video to be at the end of array.
function compareSize(a: Record<string, any>, b: Record<string, any>) {
  return Number(a.size) - Number(b.size);
}

export async function getHanimeLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<Record<string, any>[]> {
    const { url, cwd } = params

    const { proxy, timeout } = await resolveConfig(options, cwd)

    const _proxy = proxy?.host !== '' ? proxy : undefined

    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': useRandomUserAgent(),
            'Referer': `https://hanime1.me/`,
        },
        proxy: _proxy,
        timeout,
    })

    const $ = load(data)

    let sources: Record<string, any>[] = []

    const mediaSourceDoms: Record<string, any> = $('source[type="video/mp4"]')
    
    for(let value of Object.values(mediaSourceDoms)) {
        sources.push(value.attribs)
    }

    sources = sources.filter(i => i !== undefined && i !== null)
                     .sort(compareSize)

    return sources
}

export async function downloadHanime(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
    const { path, url, cwd } = params
    const directLinks = await getHanimeLink({ url }, options)

    if(directLinks.length > 0) {
        logger.success(`Successfully get video sources, size ${directLinks[directLinks.length - 1].size} to be downloaded.`)
    }

    await downloadVideo({
        url: directLinks[directLinks.length - 1].src,
        path,
        cwd,
    }, options)
}