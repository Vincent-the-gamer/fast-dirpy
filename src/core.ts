import axios from "axios"
// @ts-expect-error - missing type definitions
import jsdom from "jsdom"
import fs from "fs"
import { resolveConfig } from "./options"
import type { DirpyOptions } from "./types"
import { DEFAULT_DIRPY_OPTIONS } from "./options"

const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
}

const { JSDOM } = jsdom

export async function getDirectLink(url: string, options: Partial<DirpyOptions> = DEFAULT_DIRPY_OPTIONS): Promise<string> {
    const { proxy, timeout } = await resolveConfig(options)

    let _proxy = proxy?.host !== "" ? proxy : undefined

    const urlEncoded = encodeURIComponent(url)

    const { data } = await axios.get("https://dirpy.com/studio", {
        params: {
            url: urlEncoded
        },
        headers: {
            ...commonHeaders,
        },
        proxy: _proxy,
        timeout
    })
    const { window } = new JSDOM(data)
    
    let src = ""

    const mediaSourceDom = window.document.getElementById("media-source")

    if(mediaSourceDom) {
        src = mediaSourceDom.src
    }

    return src
}


// Download
interface DownloadParams {
    url: string,
    path: string,
}


async function downloadVideo(params: DownloadParams, options: Partial<DirpyOptions> = DEFAULT_DIRPY_OPTIONS): Promise<void> {
    const { path, url } = params

    const { proxy, timeout } = await resolveConfig(options)

    let _proxy = proxy?.host !== "" ? proxy : undefined

    if(url === "") {
        return Promise.reject("Extract direct link failed!")
    }

    const writer = fs.createWriteStream(path)
    const response = await axios({
        url,
        headers: {
            ...commonHeaders
        },
        method: 'GET',
        responseType: 'stream',
        proxy: _proxy,
        timeout,
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


export async function downloadVideoFromRawLink(params: DownloadParams, options: Partial<DirpyOptions> = DEFAULT_DIRPY_OPTIONS): Promise<void> {
    const { path, url } = params
    const directLink = await getDirectLink(url, options)
    await downloadVideo({
        url: directLink,
        path,
    }, options)
}


getDirectLink("https://www.xvideos.com/video.hciubkd2832/huge_tits_ebony_fucked_by_gym_coach_during_training")