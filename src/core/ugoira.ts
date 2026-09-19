import axios from "axios";
import { DirectLinkParams, DownloadParams, Options } from "../types";
import { DEFAULT_OPTIONS } from "../constants";
import { resolveConfig } from "../options";
import { downloadVideosParallel } from "../utils/downloader";

/**
 * Use ugoira.com to extract gif/mp4 from pixiv animated images
 */
export async function getUgoiraLink(params: DirectLinkParams, options: Partial<Options> = DEFAULT_OPTIONS) {
  const { url, cwd } = params
  const { proxy } = await resolveConfig(options, cwd)

  const artworkId = url!.match(/\/artworks\/(\d+)/)?.[1];
  const { data } = await axios.post(`https://ugoira.com/api/illusts/queue`, {
    text: artworkId
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://ugoira.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    },
    proxy
  });

  const link = data.data[0].preview.mp4
  return link;
}

export async function downloadUgoiraVideo(params: DownloadParams | DownloadParams[], options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  if (!Array.isArray(params)) {
    params = [params] as DownloadParams[]
  }

  const directParams = []

  for (const param of params) {
    const directLink = await getUgoiraLink({
      url: param.url,
      cwd: param.cwd,
    }, options)
    directParams.push({ ...param, url: directLink })
  }

  await downloadVideosParallel(directParams, {
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://ugoira.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    },
  })
}
