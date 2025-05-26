export interface Options {
  proxy?: {
    protocol?: string
    host: string
    port: number
  }
  timeout?: number
  puppeteer?: {
    executablePath: string
    headless?: boolean
  },
  ffmpeg?: string
}

export interface DirectLinkParams {
  url: string
  cwd?: string
}

export interface DownloadParams {
  url: string
  path: string
  cwd?: string
}

export enum UrlType {
  Bilibili,
  AnimeIdHentai,
  Dirpy,
  M3U8,
}
