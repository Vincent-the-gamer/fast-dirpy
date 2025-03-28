import axios from "axios"
// @ts-expect-error - missing type definitions
import jsdom from "jsdom"
import fs from "fs"
import { useProxyConfig } from "./proxy"
import { url } from "inspector"

const { JSDOM } = jsdom

export async function getDirectLink(url: string, proxy?: Record<string, any>): Promise<string> {
    const proxyConfig = useProxyConfig(proxy || {})

    const { data } = await axios.get("https://dirpy.com/studio", {
        params: {
            url: encodeURIComponent(url)
        },
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
        },
        proxy: proxyConfig,
        timeout: 30000 // 30s
    })
    const { window } = new JSDOM(data)
    const { src }: { src: string } = window.document.getElementById("media-source")

    return src
}


// Download
interface DownloadParams {
    url: string,
    path: string
    puppeteer?: boolean
    proxy?: Record<string, any>
}


async function downloadVideo(params: DownloadParams): Promise<void> {
    const { proxy, path, url } = params

    const proxyConfig = useProxyConfig(proxy || {})

    const writer = fs.createWriteStream(path)
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        proxy: proxyConfig,
        onDownloadProgress: (progressEvent) => {
            const { loaded, total, progress } = progressEvent

            const message = `loaded:${loaded}  ` +
                `total: ${total}  ` +
                `progress: ${(progress! * 100).toFixed(2)}%\n`
            console.log(message)
        }
    })
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}


export async function downloadVideoFromRawLink(params: DownloadParams): Promise<void> {
    const { proxy, path, url } = params
    const directLink = await getDirectLink(url, proxy)
    await downloadVideo({
        url: directLink,
        path,
        proxy
    })
}
