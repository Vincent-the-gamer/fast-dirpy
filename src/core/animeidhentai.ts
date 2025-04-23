import type { DirectLinkParams, DirpyOptions, DownloadParams } from '../types'
import axios from 'axios'
// @ts-expect-error - missing type definitions
import jsdom from 'jsdom'
import { downloadVideo } from '.'
import { DEFAULT_DIRPY_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { usePuppeteer } from '../utils/puppeteer'
import { useRandomUserAgent } from '../utils/userAgent'

const { JSDOM } = jsdom

/**
 * Requires puppeteer
 */
async function getPlayerPage(params: DirectLinkParams, options: Partial<DirpyOptions> = DEFAULT_DIRPY_OPTIONS) {
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

  const { window } = new JSDOM(data)

  let src = ''

  const iframe = window.document.querySelector('div.embed.rad2 > iframe')

  if (iframe) {
    src = iframe.src
  }

  return src
}

export async function getAnimeIdHentaiLink(params: DirectLinkParams, options: Partial<DirpyOptions> = DEFAULT_DIRPY_OPTIONS): Promise<string> {
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

export async function downloadAnimeIdHentai(params: DownloadParams, options: Partial<DirpyOptions> = DEFAULT_DIRPY_OPTIONS): Promise<void> {
  const { path, url, cwd } = params
  const directLink = await getAnimeIdHentaiLink({ url }, options)
  await downloadVideo({
    url: directLink,
    path,
    cwd,
  }, options)
}
