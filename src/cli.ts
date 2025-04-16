import type { CAC } from 'cac'
import { cac } from 'cac'
import restoreCursor from 'restore-cursor'
import pkgJson from '../package.json'
import { downloadVideoFromRawLink, getDirectLink } from './core'
import { getBilibiliDirectLink, downloadBilibiliVideo } from './bilibili'

const cli: CAC = cac('fast-dirpy')

cli.command('get <url>', 'get video direct link.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .option('--bilibili', 'Tell fast-dirpy to fetch a Bilibili link, then bypass proxy.')
  .option('--config, -c <path>', 'Give a specific config file.')
  .action(async (url, options) => {
    const { proxyHost: host, proxyPort: port, bilibili, config } = options

    if(bilibili) {
      if(!url.includes('bilibili.com')) {
        console.error('Please provide a valid Bilibili URL.')
        return
      }
      const link = await getBilibiliDirectLink(url)
      console.log(link)
    } else {
      const proxyOptions = host ? {
        proxy: { host, port },
      } : undefined

      console.log(config)

      const videoLink = await getDirectLink({
        url,
        cwd: config
      }, proxyOptions)
  
      console.log(videoLink)
    }
  })

cli.command('download <url>', 'download a video.')
  .option('--path, -p <path>', 'Download destination path + filename. e.g. /xxx/example.mp4.')
  .option('--proxyHost, -H <proxyHost>', 'Proxy host.')
  .option('--proxyPort, -P <proxyPort>', 'Proxy port.')
  .option('--bilibili', 'Tell fast-dirpy to download from a Bilibili link.')
  .option('--config, -c <path>', 'Give a specific config file.')
  .action(async (url, options) => {
    const { proxyHost: host, proxyPort: port, path, bilibili, config } = options

    if(bilibili) {
      await downloadBilibiliVideo({
        url,
        path
      })
    } else {
      const proxyOptions = host ? {
        proxy: { host, port },
      } : undefined
  
      downloadVideoFromRawLink({
        url,
        path: path || './download.mp4',
        cwd: config
      }, proxyOptions)
    }
  })


cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()
