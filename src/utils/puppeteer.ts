import puppeteer from 'puppeteer-core'

export async function usePuppeteer(launchConfig?: Record<string, any>) {
  const browser = await puppeteer.launch(launchConfig)
  return browser
}
