export interface DirpyOptions {
    proxy?: {
        protocol?: string,
        host: string,
        port: number
    }
    timeout?: number
}