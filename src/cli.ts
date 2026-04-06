import type { CAC } from 'cac'
import type { DownloadParams } from './types'
import fs from 'node:fs/promises'
import { bold, dim } from 'ansis'
import { cac } from 'cac'
import restoreCursor from 'restore-cursor'
import pkgJson from '../package.json'
import { downloadAnimeIdHentai, downloadBilibili, downloadDirpy, downloadHanime, downloadKoreanPm, downloadMissav, downloadWowxxx, downloadXHamster, getAnimeIdHentaiLink, getBilibiliLink, getDirpyLink, getKoreanPmLink, getWowxxxLink, getXHamsterLink, remoteM3U8ToMP4Parallel } from './core'
import { UrlType } from './types'
import { downloadVideosParallel } from './utils/downloader'
import { judgeUrl } from './utils/judgeUrl'
import { logger, setSilent } from './utils/logger'

const cli: CAC = cac('fast-dirpy')

const { version } = pkgJson

cli.command('get <url>', 'get video direct link.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .option('--config, -c <path>', 'Specify an external config file.')
  .option('--silent', 'Suppress non-error logs')
  .option('--chromePath', 'Path to your Google Chrome browser')
  .action(async (url, options) => {
    const urlType: UrlType = judgeUrl(url)

    const { proxyHost: host, proxyPort: port, config, silent, chromePath } = options

    const proxyOptions = host
      ? {
          proxy: { host, port },
        }
      : undefined

    const puppeteerOptions = chromePath
      ? {
          puppeteer: {
            executablePath: chromePath,
          },
        }
      : undefined

    setSilent(!!silent)

    logger.info(
      `fast-dirpy ${dim(`v${version}`)} : ${bold(`Direct Link Getter`)}.`,
    )

    if (urlType === UrlType.AnimeIdHentai) {
      logger.info('Matched link source: Animeidhentai.')
      const videoLink = await getAnimeIdHentaiLink({
        url,
        cwd: config,
      }, {
        ...proxyOptions,
        ...puppeteerOptions,
      })

      console.log(videoLink)
    }

    else if (urlType === UrlType.KoreanPM) {
      logger.info('Matched link source: KoreanPM.')
      const videoLink = await getKoreanPmLink({
        url,
        cwd: config,
      }, proxyOptions)

      console.log(videoLink)
    }

    else if (urlType === UrlType.Wowxxx) {
      logger.info('Matched link source: Wowxxx.')
      const videoLink = await getWowxxxLink({
        url,
        cwd: config,
      }, proxyOptions)

      console.log(videoLink)
    }

    else if (urlType === UrlType.XHamster) {
      logger.info('Matched link source: XHamster.')

      const videoLink = await getXHamsterLink({
        url,
        cwd: config,
      }, proxyOptions)

      console.log(videoLink)
    }

    else if (urlType === UrlType.Bilibili) {
      logger.info('Matched link source: Bilibili.')
      if (!url.includes('bilibili.com')) {
        logger.error('Please provide a valid Bilibili URL.')
        return
      }
      const link = getBilibiliLink(url)
      console.log(link)
    }
    else if (urlType === UrlType.Dirpy) {
      logger.info('Matched link source: Dirpy.')

      const videoLink = await getDirpyLink({
        url,
        cwd: config,
      }, proxyOptions)

      console.log(videoLink)
    }
    else {
      logger.error('Your link is not supported!')
    }
  })

cli.command('download', 'download a video.')
  .option('--json, -j <json>', 'JSON download params.')
  .option('--jsonFile, -F <jsonFile>', 'Path to a JSON file containing download params.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .option('--config, -c <path>', 'Specify an external config file.')
  .option('--silent', 'Suppress non-error logs')
  .option('--chromePath', 'Path to your Google Chrome browser')
  .action(async (options) => {
    const { json, jsonFile } = options

    if (!json && !jsonFile) {
      logger.error('No JSON params provided.')
      return
    }

    const buildParams = async (jsonStr: string, jsonFile: string) => {
      if (jsonStr) {
        return JSON.parse(jsonStr)
      }
      else if (jsonFile) {
        const fileContent = await fs.readFile(jsonFile, 'utf-8')
        return JSON.parse(fileContent)
      }
    }

    let params: DownloadParams | DownloadParams[] = await buildParams(json, jsonFile)

    if (!Array.isArray(params)) {
      params = [params] as DownloadParams[]
    }

    if (params.length < 1) {
      logger.error('No params provided.')
      return
    }

    const { proxyHost: host, proxyPort: port, config, silent, chromePath } = options

    const proxyOptions = host
      ? {
          proxy: { host, port },
        }
      : undefined

    const puppeteerOptions = chromePath
      ? {
          puppeteer: {
            executablePath: chromePath,
          },
        }
      : undefined

    setSilent(!!silent)
    logger.info(
      `fast-dirpy ${dim(`v${version}`)} : ${bold(`Video Downloader`)}.`,
    )

    for (const param of params) {
      param.urlType = judgeUrl(param.url)
      param.cwd = config
    }

    const bilibiliParams = params.filter(param => param.urlType === UrlType.Bilibili)
    const animeIdHentaiParams = params.filter(param => param.urlType === UrlType.AnimeIdHentai)
    const koreanPmParams = params.filter(param => param.urlType === UrlType.KoreanPM)
    const hanimeParams = params.filter(param => param.urlType === UrlType.Hanime)
    const wowxxxParams = params.filter(param => param.urlType === UrlType.Wowxxx)
    const xHamsterParams = params.filter(param => param.urlType === UrlType.XHamster)
    const dirpyParams = params.filter(param => param.urlType === UrlType.Dirpy)
    const mp4Params = params.filter(param => param.urlType === UrlType.MP4)
    const m3u8Params = params.filter(param => param.urlType === UrlType.M3U8)
    const missavParams = params.filter(param => param.urlType === UrlType.MissAV)

    if (bilibiliParams.length > 0) {
      await downloadBilibili(bilibiliParams)
    }

    if (animeIdHentaiParams.length > 0) {
      await downloadAnimeIdHentai(animeIdHentaiParams, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }

    if (koreanPmParams.length > 0) {
      await downloadKoreanPm(koreanPmParams, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }

    if (hanimeParams.length > 0) {
      await downloadHanime(hanimeParams, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }

    if (wowxxxParams.length > 0) {
      await downloadWowxxx(wowxxxParams, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }

    if (xHamsterParams.length > 0) {
      await downloadXHamster(xHamsterParams, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }

    if (missavParams.length > 0) {
      await downloadMissav(missavParams, {
        ...proxyOptions,
      })
    }

    if (dirpyParams.length > 0) {
      await downloadDirpy(dirpyParams, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }

    if (mp4Params.length > 0) {
      await downloadVideosParallel(mp4Params, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }

    if (m3u8Params.length > 0) {
      await remoteM3U8ToMP4Parallel(m3u8Params, {
        ...proxyOptions,
        ...puppeteerOptions,
      })
    }
  })

cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()
