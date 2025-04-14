import { downloadVideo } from './core'
import type { DownloadParams } from './types'

export function getBilibiliDirectLink(link: string): string {
    const BV = link.match(/BV[a-zA-Z0-9]+/)
    if(BV) {
        const link = `https://bilibili-real-url.deno.dev/${BV[0]}.mp4`
        return link
    }
    return ""
}

export async function downloadBilibiliVideo(params: DownloadParams) {
    const { path, url } = params

    const directLink = getBilibiliDirectLink(url)
    if(directLink !== "") {
        await downloadVideo({
            url: directLink,
            path: path || './download.mp4'
        })
    } else {
        console.error('Extract direct link failed!')
    }
}