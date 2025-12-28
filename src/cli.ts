import type { CAC } from 'cac'
import { bold, dim } from 'ansis'
import { cac } from 'cac'
import restoreCursor from 'restore-cursor'
import pkgJson from '../package.json'
import { downloadAnimeIdHentai, downloadHanime, getAnimeIdHentaiLink, getHanimeLink, remoteM3U8ToMP4 } from './core'
import { downloadBilibili, getBilibiliLink } from './core/bilibili'
import { downloadDirpy, getDirpyLink } from './core/dirpy'
import { downloadKoreanPm, getKoreanPmLink } from './core/koreanpm'
import { downloadMissav } from './core/missav'
import { UrlType } from './types'
import { downloadVideo } from './utils/downloader'
import { judgeUrl } from './utils/judgeUrl'
import { logger, setSilent } from './utils/logger'
import { downloadWowxxx, getWowxxxLink } from './core/wowxxx'

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

    else if (urlType === UrlType.Bilibili) {
      logger.info('Matched link source: Bilibili.')
      if (!url.includes('bilibili.com')) {
        logger.error('Please provide a valid Bilibili URL.')
        return
      }
      const link = await getBilibiliLink(url)
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

cli.command('download <url>', 'download a video.')
  .option('--path, -p <path>', 'Download destination path + filename. e.g. /xxx/example.mp4.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .option('--config, -c <path>', 'Specify an external config file.')
  .option('--silent', 'Suppress non-error logs')
  .option('--chromePath', 'Path to your Google Chrome browser')
  .action(async (url, options) => {
    const urlType = judgeUrl(url)

    const { proxyHost: host, proxyPort: port, path, config, silent, chromePath } = options

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

    if (urlType === UrlType.Bilibili) {
      logger.info('Matched link source: Bilibili.')
      await downloadBilibili({
        url,
        path,
      })
    }
    else if (urlType === UrlType.Dirpy) {
      logger.info('Matched link source: Dirpy.')

      downloadDirpy({
        url,
        path: path || './dirpy.mp4',
        cwd: config,
      }, proxyOptions)
    }
    else if (urlType === UrlType.AnimeIdHentai) {
      logger.info('Matched link source: AnimeIdHentai.')

      await downloadAnimeIdHentai({
        url,
        path: path || './animeidhentai.mp4',
        cwd: config,
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
        cwd: config,
      }, proxyOptions)
    }

    else if (urlType === UrlType.Wowxxx) {
      logger.info('Matched link source: Wowxxx.')
      await downloadWowxxx({
        url,
        path: path || './wowxxx.mp4',
        cwd: config,
      }, proxyOptions)
    }

    else if (urlType === UrlType.MissAV) {
      logger.info('Matched link source: MissAV.')
      await downloadMissav({
        url,
        path,
        cwd: config,
      })
    }
    else if (urlType === UrlType.Hanime) {
      logger.info('Matched link source: Hanime.')
      await downloadHanime({
        url,
        path,
        cwd: config,
      })
    }
    else if (urlType === UrlType.M3U8) {
      logger.info('Matched link source: m3u8.')

      await remoteM3U8ToMP4({
        url,
        path: path || './m3u8-download.mp4',
        cwd: config,
      })
    }
    else if (urlType === UrlType.MP4) {
      logger.info('Matched link source: mp4.')

      await downloadVideo({
        url,
        path,
        cwd: config,
      })
    }
    else {
      logger.error('Your link is not supported!')
    }
  })

cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()
