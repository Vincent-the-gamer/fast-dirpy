import type { CAC } from 'cac'
import { cac } from 'cac'
import restoreCursor from 'restore-cursor'
import pkgJson from '../package.json'
import { downloadVideoFromRawLink, getDirectLink } from './core'

const cli: CAC = cac('fast-dirpy')

cli.command('get <url>', 'get video direct link.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .action(async (url, options) => {
    const { host, port } = options

    const proxyOptions = host ? {
      proxy: { host, port },
    } : undefined

    const videoLink = await getDirectLink(url, proxyOptions)

    console.log(videoLink)
  })

cli.command('download <url>', 'download a video.')
  .option('--path, -p <path>', 'Download destination path + filename. e.g. /xxx/example.mp4.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .action(async (url, options) => {
    const { host, port } = options

    const proxyOptions = host ? {
      proxy: { host, port },
    } : undefined

    downloadVideoFromRawLink({
      url,
      path: options.path || './download.mp4',
    }, proxyOptions)
  })

cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()
