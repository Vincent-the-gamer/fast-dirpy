import type { CAC } from 'cac'
import { bold, dim } from 'ansis'
import { cac } from 'cac'
import restoreCursor from 'restore-cursor'
import pkgJson from '../package.json'
import { downloadBilibili, getBilibiliLink } from './core/bilibili'
import { downloadDirpy, getDirpyLink } from './core/dirpy'
import { logger, setSilent } from './utils/logger'
import { UrlType } from './types'
import { judgeUrl } from './utils/judgeUrl'
import { downloadAnimeIdHentai, getAnimeIdHentaiLink } from './core'

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

    const puppeteerOptions = chromePath ? {
      puppeteer: {
        executablePath: chromePath
      }
    } : undefined

    setSilent(!!silent)

    logger.info(
      `fast-dirpy ${dim(`v${version}`)} : ${bold(`Direct Link Getter`)}.`,
    )

    if (urlType === UrlType.Bilibili) {
      logger.info("Matched link source: Bilibili.")
      if (!url.includes('bilibili.com')) {
        logger.error('Please provide a valid Bilibili URL.')
        return
      }
      const link = await getBilibiliLink(url)
      console.log(link)
    }
    else if (urlType === UrlType.Dirpy) {
      logger.info("Matched link source: Dirpy.")

      const videoLink = await getDirpyLink({
        url,
        cwd: config,
      }, proxyOptions)

      console.log(videoLink)
    } else if (urlType === UrlType.AnimeIdHentai) {
      logger.info("Matched link source: Animeidhentai.")
      const videoLink = await getAnimeIdHentaiLink({
        url,
        cwd: config
      }, {
        ...proxyOptions,
        ...puppeteerOptions
      })

      console.log(videoLink)
    } else {
      logger.error("Your link is not supported!")
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

    const puppeteerOptions = chromePath ? {
      puppeteer: {
        executablePath: chromePath
      }
    } : undefined

    setSilent(!!silent)
    logger.info(
      `fast-dirpy ${dim(`v${version}`)} : ${bold(`Video Downloader`)}.`,
    )

    if (urlType === UrlType.Bilibili) {
      logger.info("Matched link source: Bilibili.")
      await downloadBilibili({
        url,
        path,
      })
    }
    else if (urlType === UrlType.Dirpy) {
      logger.info("Matched link source: Dirpy.")

      downloadDirpy({
        url,
        path: path || './dirpy.mp4',
        cwd: config,
      }, proxyOptions)
    } else if (urlType === UrlType.AnimeIdHentai) {
      logger.info("Matched link source: AnimeIdHentai.")

      await downloadAnimeIdHentai({
        url,
        path: path || "./animeidhentai.mp4",
        cwd: config
      }, {
        ...proxyOptions,
        ...puppeteerOptions
      })
    }
  })

cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()
