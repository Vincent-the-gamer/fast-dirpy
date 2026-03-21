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
  downloadXHamster,
  getAnimeIdHentaiLink,
  getBilibiliLink,
  getDirpyLink,
  getHanimeLink,
  getKoreanPmLink,
  getXHamsterLink,
  remoteM3U8ToMP4Parallel,
} from './core'
import { downloadWowxxx, getWowxxxLink } from './core/wowxxx'
import { UrlType } from './types'
import { downloadVideo, downloadVideosParallel } from './utils/downloader'
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
    const link = await getBilibiliLink({ url, cwd })
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

export async function fastDownload(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  if (params.length < 1) {
    logger.error('No valid params provided.')
    return
  }

  const { proxy, puppeteer } = options

  const proxyOptions = proxy || {}
  const puppeteerOptions = puppeteer || {}

  for (const param of params) {
    param.urlType = judgeUrl(param.url)
  }

  logger.info(
    `fast-dirpy ${dim(`v${version}`)} : ${bold(`Video Downloader`)}.`,
  )

  const bilibiliParams = params.filter(param => param.urlType === UrlType.Bilibili)
  const animeIdHentaiParams = params.filter(param => param.urlType === UrlType.AnimeIdHentai)
  const koreanPmParams = params.filter(param => param.urlType === UrlType.KoreanPM)
  const hanimeParams = params.filter(param => param.urlType === UrlType.Hanime)
  const wowxxxParams = params.filter(param => param.urlType === UrlType.Wowxxx)
  const xHamsterParams = params.filter(param => param.urlType === UrlType.XHamster)
  const dirpyParams = params.filter(param => param.urlType === UrlType.Dirpy)
  const mp4Params = params.filter(param => param.urlType === UrlType.MP4)
  const m3u8Params = params.filter(param => param.urlType === UrlType.M3U8)



  if(bilibiliParams.length > 0) {
    await downloadBilibili(bilibiliParams)
  }

  if(animeIdHentaiParams.length > 0) {
    await downloadAnimeIdHentai(animeIdHentaiParams, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  if(koreanPmParams.length > 0) {
    await downloadKoreanPm(koreanPmParams, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  if(hanimeParams.length > 0) {
    await downloadHanime(hanimeParams, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  if(wowxxxParams.length > 0) {
    await downloadWowxxx(wowxxxParams, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  if(xHamsterParams.length > 0) {
    await downloadXHamster(xHamsterParams, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  if(dirpyParams.length > 0) {
    await downloadDirpy(dirpyParams, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  if(mp4Params.length > 0) {
    await downloadVideosParallel(mp4Params, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }

  if(m3u8Params.length > 0) {
    await remoteM3U8ToMP4Parallel(m3u8Params, {
      ...proxyOptions,
      ...puppeteerOptions,
    })
  }
}

export * from './config'
export * from './constants'
export * from './core'
export * from './types'
export * from './utils/downloader'
