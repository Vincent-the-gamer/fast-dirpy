export interface DirpyOptions {
  proxy?: {
    protocol?: string
    host: string
    port: number
  }
  timeout?: number
}

export interface DownloadParams {
  url: string
  path: string
}