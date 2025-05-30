import type { DirectLinkParams, DownloadParams, Options } from '../types'
import axios from 'axios'
import { load } from 'cheerio'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { usePuppeteer } from '../utils/puppeteer'
import { useRandomUserAgent } from '../utils/userAgent'
import { downloadVideo } from './index'

/**
 * Requires puppeteer
 */
async function getPlayerPage(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS) {
  const { url, cwd } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': useRandomUserAgent(),
    },
    proxy: _proxy,
    timeout,
  })

  const $ = load(data)

  let src = ''

  const iframe = $('div.embed.rad2 > iframe').attr()

  if (iframe) {
    src = iframe.src
  }

  return src
}

export async function getAnimeIdHentaiLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<string> {
  const { url, cwd } = params
  const { proxy, puppeteer }: any = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const playerLink = await getPlayerPage({
    url,
  }, {
    proxy: _proxy,
  })

  const { executablePath, headless } = puppeteer
  const browser = await usePuppeteer({
    executablePath,
    headless,
    args: [
      `--proxy-server=http://${_proxy?.host}:${proxy?.port}`, // proxy server
    ],
  })
  const userAgent = useRandomUserAgent()
  const page = await browser.newPage()
  await page.setUserAgent(userAgent)

  await page.goto(playerLink)
  await page.waitForSelector('div.play.p-pulse')
  await page.click('div.play.p-pulse')

  await page.waitForSelector('div.frame > iframe')
  const innerPlayerLink = await page.$eval('div.frame > iframe', el => el.src)

  const page2 = await browser.newPage()

  await page2.goto(`${innerPlayerLink}`)
  await page2.waitForSelector('video.jw-video.jw-reset')

  const link = await page2.$eval('video.jw-video.jw-reset', el => el.src)

  await browser.close()
  return link
}

export async function downloadAnimeIdHentai(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { path, url, cwd } = params
  const directLink = await getAnimeIdHentaiLink({ url }, options)
  await downloadVideo({
    url: directLink,
    path,
    cwd,
  }, options)
}
