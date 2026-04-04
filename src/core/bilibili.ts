import type { DirectLinkParams, DownloadParams, Options } from '../types'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { downloadVideosParallel } from '../utils/downloader'
import { logger } from '../utils/logger'
import { usePuppeteer } from '../utils/puppeteer'
import { useRandomUserAgent } from '../utils/userAgent'

export async function getBilibiliLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS) {
  const { url, cwd } = params
  const { proxy, puppeteer }: any = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { executablePath, headless } = puppeteer
  const browser = await usePuppeteer({
    executablePath,
    headless,
    args: [
      `--proxy-server=http://${_proxy?.host}:${proxy?.port}`, // proxy server
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--disable-web-security',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--window-size=1920,1080',
    ],
    slowMo: 10,
  })

  const page = await browser.newPage()
  const userAgent = useRandomUserAgent()
  await page.setUserAgent(userAgent)

  try {
    await page.goto('https://snapany.com/zh/bilibili')
    await page.waitForNetworkIdle()

    const inputSelector = 'input[name=\'link\']'
    await page.waitForSelector(inputSelector)
    await page.type(inputSelector, url, { delay: 10 }) // delay 模拟人工输入

    const buttonSelector = 'button[type=\'submit\']'
    await page.waitForSelector(buttonSelector)
    await page.click(buttonSelector)

    await page.waitForSelector('div[data-testid="flowbite-card"]')

    // 获取视频链接
    // 获取页面上所有的卡片
    const cardsData = await page.$$eval(
      'div[data-testid="flowbite-card"]',
      (cards) => {
        return cards.map((card) => {
          // 获取视频链接
          const videoLinkElement = card.querySelector('a[href*=".mp4"]')
          let videoUrl = videoLinkElement?.getAttribute('href') || ''
          videoUrl = videoUrl.replace(/&amp;/g, '&')

          return {
            videoUrl,
          }
        })
      },
    )

    return cardsData.filter(card => card.videoUrl)[0]?.videoUrl
  }
  catch (e) {
    logger.error(`Error during scraping: ${e}`)
  }
  finally {
    logger.info('Closing browser')
    await browser.close()
  }
}

export async function downloadBilibili(params: DownloadParams | DownloadParams[]) {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const url = await getBilibiliLink({
      url: param.url,
      cwd: param.cwd,
    })
    directParams.push({ ...param, url })
  }

  await downloadVideosParallel(directParams)
}
