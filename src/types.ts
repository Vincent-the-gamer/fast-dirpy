export interface DirpyOptions {
  proxy?: {
    protocol?: string
    host: string
    port: number
  }
  timeout?: number
}

export interface DirectLinkParams {
  url: string,
  cwd?: string
}

export interface DownloadParams {
  url: string
  path: string
  cwd?: string
}