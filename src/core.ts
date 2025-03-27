import axios from "axios"
// @ts-expect-error - missing type definitions
import jsdom from "jsdom"

const { JSDOM } = jsdom

export async function getDirectLink(url: string, proxy?: Record<string, any>): Promise<string> {

    const proxyConfig = proxy?.host && proxy.port ? {
        protocol: "http",
        host: proxy?.host,
        port: proxy?.port
    } : undefined

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
