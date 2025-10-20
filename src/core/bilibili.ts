import type { DownloadParams } from '../types'
import { downloadVideo } from '../utils/downloader'

export function getBilibiliLink(link: string): string {
  const BV = link.match(/BV[a-zA-Z0-9]+/)
  if (BV) {
    const link = `https://bilibili-real-url.deno.dev/${BV[0]}.mp4`
    return link
  }
  return ''
}

export async function downloadBilibili(params: DownloadParams) {
  const { path, url } = params

  const directLink = getBilibiliLink(url)
  if (directLink !== '') {
    await downloadVideo({
      url: directLink,
      path: path || './download.mp4',
    })
  }
  else {
    console.error('Extract direct link failed!')
  }
}
