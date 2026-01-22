import type { DirectLinkParams, DownloadParams, Options } from './types'
import { bold, dim } from 'ansis'
import pkgJson from '../package.json' with { type: 'json' }
import { DEFAULT_OPTIONS } from './constants'
import {
  downloadAnimeIdHentai,
  downloadBilibili,
  downloadDirpy,
  downloadHanime,
  downloadKoreanPm,
  downloadMissav,
  downloadXHamster,
  getAnimeIdHentaiLink,
  getBilibiliLink,
  getDirpyLink,
  getHanimeLink,
  getKoreanPmLink,
  getMissavLink,
  getXHamsterLink,
  remoteM3U8ToMP4,
} from './core'
import { downloadWowxxx, getWowxxxLink } from './core/wowxxx'
import { UrlType } from './types'
import { downloadVideo } from './utils/downloader'
import { judgeUrl } from './utils/judgeUrl'
import { logger } from './utils/logger'

const { version } = pkgJson

export async function fastLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string | Record<string, any>[]> {
  const { url, cwd } = params
  const { proxy, puppeteer } = options

  const proxyOptions = proxy || {}
  const puppeteerOptions = puppeteer || {}

  const urlType = judgeUrl(url)

  logger.info(
    `fast-dirpy ${dim(`v${version}`)} : ${bold(`Direct Link Getter`)}.`,
  )

  if (urlType === UrlType.Bilibili) {
    logger.info('Matched link source: Bilibili.')
    if (!url.includes('bilibili.com')) {
      logger.error('Please provide a valid Bilibili URL.')
      return ''
    }
    const link = await getBilibiliLink(url)
    return link
  }
  else if (urlType === UrlType.AnimeIdHentai) {
    logger.info('Matched link source: Animeidhentai.')
    const videoLink = await getAnimeIdHentaiLink({
      url,
      cwd,
    }, {
      ...proxyOptions,
      ...puppeteerOptions,
    })

    return videoLink
  }
  else if (urlType === UrlType.KoreanPM) {
    logger.info('Matched link source: KoreanPM.')
    const videoLink = await getKoreanPmLink({
      url,
      cwd,
    }, proxyOptions)

    return videoLink
  }
  else if (urlType === UrlType.MissAV) {
    logger.info('Matched link source: MissAV.')
    const videoLink = await getMissavLink({
      url,
      cwd,
    })
    return videoLink
  }
  else if (urlType === UrlType.Hanime) {
    logger.info('Matched link source: Hanime.')

    const videoLinks = await getHanimeLink({
      url,
      cwd,
    }, proxyOptions)

    return videoLinks
  }
  else if (urlType === UrlType.Wowxxx) {
    logger.info('Matched link source: Wowxxx.')

    const videoLinks = await getWowxxxLink({
      url,
      cwd,
    }, proxyOptions)

    return videoLinks
  }
  else if (urlType === UrlType.XHamster) {
    logger.info('Matched link source: XHamster.')

    const videoLinks = await getXHamsterLink({
      url,
      cwd,
    }, proxyOptions)

    return videoLinks
  }
  else if (urlType === UrlType.Dirpy) {
    logger.info('Matched link source: Dirpy.')

    const videoLink = await getDirpyLink({
      url,
      cwd,
    }, proxyOptions)

    return videoLink
  }
  else {
    logger.error('Your link is not supported!')
    return ''
  }
}

export async function fastDownload(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { url, path, cwd } = params
  const { proxy, puppeteer } = options

  const proxyOptions = proxy || {}
  const puppeteerOptions = puppeteer || {}

  const urlType = judgeUrl(url)
  logger.info(
    `fast-dirpy ${dim(`v${version}`)} : ${bold(`Video Downloader`)}.`,
  )

  if (urlType === UrlType.Bilibili) {
    logger.info('Matched link source: Bilibili.')
    await downloadBilibili({
      url,
      path,
    })
  }

  else if (urlType === UrlType.AnimeIdHentai) {
    logger.info('Matched link source: AnimeIdHentai.')

    await downloadAnimeIdHentai({
      url,
      path: path || './animeidhentai.mp4',
      cwd,
    }, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  else if (urlType === UrlType.KoreanPM) {
    logger.info('Matched link source: KoreanPM.')
    await downloadKoreanPm({
      url,
      path: path || './korean-pm.mp4',
      cwd,
    }, proxyOptions)
  }

  else if (urlType === UrlType.MissAV) {
    logger.info('Matched link source: MissAV.')
    await downloadMissav({
      url,
      path,
      cwd,
    })
  }

  else if (urlType === UrlType.Hanime) {
    logger.info('Matched link source: Hanime.')

    await downloadHanime({
      url,
      path,
      cwd,
    }, proxyOptions)
  }

  else if (urlType === UrlType.Wowxxx) {
    logger.info('Matched link source: Wowxxx.')

    await downloadWowxxx({
      url,
      path,
      cwd,
    }, proxyOptions)
  }

  else if (urlType === UrlType.XHamster) {
    logger.info('Matched link source: XHamster.')

    await downloadXHamster({
      url,
      path,
      cwd,
    }, proxyOptions)
  }

  else if (urlType === UrlType.Dirpy) {
    logger.info('Matched link source: Dirpy.')

    downloadDirpy({
      url,
      path: path || './dirpy.mp4',
      cwd,
    }, proxyOptions)
  }

  else if (urlType === UrlType.MP4) {
    logger.info('Matched link source: mp4.')

    await downloadVideo({
      url,
      path: path || './mp4-download.mp4',
      cwd,
    }, proxyOptions)
  }

  else if (urlType === UrlType.M3U8) {
    logger.info('Matched link source: m3u8.')

    remoteM3U8ToMP4({
      url,
      path: path || './m3u8-download.mp4',
      cwd,
    })
  }
  else {
    logger.error('Your link is not supported!')
  }
}

export * from './config'
export * from './constants'
export * from './core'
export * from './types'
export * from './utils/downloader'
