import type { CAC } from 'cac'
import { bold, dim } from 'ansis'
import { cac } from 'cac'
import restoreCursor from 'restore-cursor'
import pkgJson from '../package.json'
import { downloadBilibiliVideo, getBilibiliDirectLink } from './bilibili'
import { downloadVideoFromRawLink, getDirectLink } from './core'
import { logger, setSilent } from './utils/logger'

const cli: CAC = cac('fast-dirpy')

const { version } = pkgJson

cli.command('get <url>', 'get video direct link.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .option('--bilibili', 'Tell fast-dirpy to fetch a Bilibili link, then bypass proxy.')
  .option('--config, -c <path>', 'Specify an external config file.')
  .option('--silent', 'Suppress non-error logs')
  .action(async (url, options) => {
    const { proxyHost: host, proxyPort: port, bilibili, config, silent } = options

    setSilent(!!silent)
    logger.info(
      `fast-dirpy ${dim(`v${version}`)} : ${bold(`Direct Link Getter`)}.`,
    )

    if (bilibili) {
      if (!url.includes('bilibili.com')) {
        logger.error('Please provide a valid Bilibili URL.')
        return
      }
      const link = await getBilibiliDirectLink(url)
      console.log(link)
    }
    else {
      const proxyOptions = host
        ? {
            proxy: { host, port },
          }
        : undefined

      const videoLink = await getDirectLink({
        url,
        cwd: config,
      }, proxyOptions)

      console.log(videoLink)
    }
  })

cli.command('download <url>', 'download a video.')
  .option('--path, -p <path>', 'Download destination path + filename. e.g. /xxx/example.mp4.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .option('--bilibili', 'Tell fast-dirpy to download from a Bilibili link.')
  .option('--config, -c <path>', 'Specify an external config file.')
  .option('--silent', 'Suppress non-error logs')
  .action(async (url, options) => {
    const { proxyHost: host, proxyPort: port, path, bilibili, config, silent } = options

    setSilent(!!silent)
    logger.info(
      `fast-dirpy ${dim(`v${version}`)} : ${bold(`Video Downloader`)}.`,
    )

    if (bilibili) {
      await downloadBilibiliVideo({
        url,
        path,
      })
    }
    else {
      const proxyOptions = host
        ? {
            proxy: { host, port },
          }
        : undefined

      downloadVideoFromRawLink({
        url,
        path: path || './download.mp4',
        cwd: config,
      }, proxyOptions)
    }
  })

cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()
