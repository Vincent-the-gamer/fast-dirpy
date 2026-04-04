export interface Options {
  headers?: Record<string, any>
  proxy?: {
    protocol?: string
    host: string
    port: number
  }
  timeout?: number
  puppeteer?: {
    executablePath: string
    headless?: boolean
  }
}

export interface DirectLinkParams {
  url?: string
  cwd?: string
  missavHtmlPage?: string
}

export interface DownloadParams {
  url: string
  path?: string
  cwd?: string
  urlType?: UrlType
}

export type M3U8Params = DownloadParams & {
  ffmpegPath?: string
  concurrency?: number
  retries?: number
}

export enum UrlType {
  Bilibili,
  AnimeIdHentai,
  Dirpy,
  M3U8,
  KoreanPM,
  Hanime,
  MissAV,
  Wowxxx,
  XHamster,
  MP4,
}
