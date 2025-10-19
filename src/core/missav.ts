import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from '../utils/logger'
import { usePuppeteer } from '../utils/puppeteer'
import { sleep } from '../utils/sleep'
import { useRandomUserAgent } from '../utils/userAgent'
import { remoteM3U8ToMP4 } from './m3u8'

async function fetchHtml(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS) {
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
      '--single-process',
      '--window-size=1920,1080',
    ],
    slowMo: 50,
    timezoneId: 'America/New_York',
    locale: 'en-US',
  })

  const page = await browser.newPage()
  const userAgent = useRandomUserAgent()
  await page.setUserAgent(userAgent)

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
    })

    if (response) {
      logger.info(`http status: ${response.status()}`)
    }

    const title = await page.title()
    const _content = await page.content()
    logger.info(`Page title: ${title}`)

    if (title.includes('Just a moment') || _content.includes('Checking your browser')) {
      logger.info(
        'Cloudflare challenge detected, waiting for it to complete...',
      )

      try {
        logger.info('Waiting for page title to change...')
        await page.waitForFunction('document.title != \'Just a moment...\'', {
          timeout: 30000,
        }),
        logger.info('Page title has changed')
      }
      catch (e) {
        logger.error(`Timeout waiting for title change: ${e}`)

        try {
          for (const selector of [
            'input[type=\'checkbox\']',
            '.ray-button',
            '#challenge-stage button',
            'button:has-text(\'Verify\')',
            'button:has-text(\'Continue\')',
          ]) {
            const element = await page.$(selector)
            if (element) {
              logger.info(`Found possible verification button: ${selector}`)
              await page.click(selector)
              sleep(5)
              break
            }
          }
        }
        catch (e) {
          logger.error(
            `Failed to click verification button: ${e}`,
          )
        }
      }
    }

    const currentTitle = await page.title()
    logger.info(`current page title: ${currentTitle}`)

    logger.info('Simulating page scroll...')

    for (let i = 0; i < 3; i++) {
      await page.evaluate('window.scrollBy(0, window.innerHeight / 2)')
      await page.evaluate('window.scrollBy(0, window.innerHeight / 4)')
    }

    logger.info('Getting page content...')
    const content = await page.content()
    logger.info('Page content retrieved successfully.')

    return content
  }
  catch (e) {
    logger.error(`Error during scraping: ${e}`)
  }
  finally {
    logger.info('Closing browser')
    await browser.close()
  }
}

async function getUuid(html: string) {
  const regex = /m3u8\|([a-f0-9|]+)\|com\|surrit\|https\|video/
  const uuidMatch = html.match(regex)
  if (!uuidMatch) {
    logger.error('Failed to extract UUID from HTML.')
    return null
  }

  const uuidResult = uuidMatch[1]
  const uuid = uuidResult.split('|').reverse().join('-')

  return uuid
}

function getMovieId(url: string) {
  const movieId = url.split('/').pop()
  if (!movieId) {
    logger.error('Failed to extract movie ID from URL.')
    return null
  }
  return movieId
}

export async function getMissavLink(params: DirectLinkParams) {
  const { url, cwd } = params
  const pageHtml: any = await fetchHtml({
    url,
    cwd,
  })
  const uuid = await getUuid(pageHtml)
  const playlist = `https://surrit.com/${uuid}/playlist.m3u8`
  const { data: list } = await axios.get(playlist)
  const regex = /(?:\d+p|\d+x\d+)\/video\.m3u8/g
  const matches = list.match(regex)

  const m3u8Url = `https://surrit.com/${uuid}/${matches[matches.length - 1]}`
  return m3u8Url
}

export async function downloadMissav(params: Partial<DownloadParams>) {
  const { url, cwd, path }: any = params

  const movieId: any = getMovieId(url!)
  const link = await getMissavLink({
    url,
    cwd,
  })

  await remoteM3U8ToMP4({
    url: link,
    cwd,
    path: path || `${movieId}.mp4`,
  })
}
