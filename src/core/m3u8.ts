import type { M3U8Params, Options } from '../types'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import m3u8stream from 'm3u8stream'
import { __dirname, DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from '../utils/logger'

// 生成简单的标识符（使用URL的最后部分）
function getM3U8Identifier(params: Partial<M3U8Params>): string {
  const shortId = params.url?.split('/').pop() || 'unknown'
  return `[${shortId}]`
}

export interface M3U8DownloadProgress {
  segment: any
  totalSegments: number
  downloaded: number
  downloadedMB: number
  percent: number
}

export interface ParallelM3U8Progress {
  total: number
  completed: number
  failed: number
  currentParams: M3U8Params
  identifier?: string
  status: 'pending' | 'downloading' | 'success' | 'failed'
  downloadProgress?: M3U8DownloadProgress
  error?: Error
}

/**
 * 下载单个M3U8视频并转换为MP4
 */
export async function remoteM3U8ToMP4(
  params: M3U8Params,
  options: Partial<Options> = DEFAULT_OPTIONS,
  onProgress?: (progress: M3U8DownloadProgress) => void,
): Promise<void> {
  const { url, cwd, path: filePath } = params

  const { proxy, timeout } = await resolveConfig(options, cwd)

  if (!url) {
    return Promise.reject(new Error('M3U8 URL is required!'))
  }

  const identifier = getM3U8Identifier(params)
  const outputPath = filePath ?? path.resolve(__dirname, '../m3u8-download.mp4')

  logger.info(`${identifier} Starting M3U8 download from: ${url}`)
  logger.info(`${identifier} Output path: ${outputPath}`)

  return new Promise((resolve, reject) => {
    try {
      // 创建m3u8stream
      const stream = m3u8stream(url, {
        // 可以添加请求头等配置
        requestOptions: {
          headers: options.headers,
          timeout,
          // 如果有代理配置，可以在这里设置
          ...(proxy?.host ? { proxy: `http://${proxy.host}:${proxy.port}` } : {}),
        },
      })

      const writer = createWriteStream(outputPath)

      // 处理下载进度
      stream.on('progress', (segment, totalSegments, downloaded) => {
        const downloadedMB = downloaded / 1024 / 1024
        const percent = totalSegments > 0 ? (segment.num / totalSegments) * 100 : 0

        const progress: M3U8DownloadProgress = {
          segment,
          totalSegments,
          downloaded,
          downloadedMB,
          percent,
        }

        logger.info(`${identifier} Segment: ${segment.num}/${totalSegments}, Downloaded: ${downloadedMB.toFixed(2)}MB (${percent.toFixed(2)}%)`)

        // 回调进度
        onProgress?.(progress)
      })

      // 处理错误
      stream.on('error', (error) => {
        logger.error(`${identifier} M3U8 stream error: ${error.message}`)
        writer.end()
        reject(error)
      })

      // 管道传输
      stream.pipe(writer)

      // 处理写入完成
      writer.on('finish', () => {
        logger.info(`${identifier} M3U8 download completed successfully`)
        resolve()
      })

      // 处理写入错误
      writer.on('error', (error) => {
        logger.error(`${identifier} File write error: ${error.message}`)
        reject(error)
      })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(`${identifier} Failed to initialize M3U8 download: ${errorMessage}`)
      reject(error)
    }
  })
}

/**
 * 并行下载多个M3U8视频
 * @param paramsList M3U8参数列表
 * @param options 下载选项
 * @param maxConcurrent 最大并行数，默认3（M3U8下载较消耗资源，默认值比普通视频小）
 * @param onProgress 总体进度回调
 * @param onDownloadProgress 单个文件下载进度回调
 * @returns Promise<void[]>
 */
export async function remoteM3U8ToMP4Parallel(
  paramsList: M3U8Params[],
  options: Partial<Options> = DEFAULT_OPTIONS,
  maxConcurrent: number = 3,
  onProgress?: (progress: ParallelM3U8Progress) => void,
  onDownloadProgress?: (identifier: string, progress: M3U8DownloadProgress) => void,
): Promise<void[]> {
  const results: Promise<void>[] = []
  const executing: Set<Promise<void>> = new Set()

  // 跟踪下载状态
  let completed = 0
  let failed = 0
  const total = paramsList.length

  logger.info(`Starting parallel M3U8 downloads: ${total} videos, max concurrent: ${maxConcurrent}`)

  for (const [index, params] of paramsList.entries()) {
    const identifier = getM3U8Identifier(params)

    // 创建下载任务，并处理成功/失败状态
    const promise = remoteM3U8ToMP4(params, options, (downloadProgress) => {
      // 回调单个文件的下载进度
      onDownloadProgress?.(identifier, downloadProgress)

      // 同时也可以回调总体进度（处于下载中状态）
      onProgress?.({
        total,
        completed,
        failed,
        currentParams: params,
        identifier,
        status: 'downloading',
        downloadProgress,
      })
    })
      .then((result) => {
        completed++
        executing.delete(promise)

        logger.info(`${index + 1}/${total} ${identifier} M3U8 download completed`)

        // 回调进度（成功）
        onProgress?.({
          total,
          completed,
          failed,
          currentParams: params,
          identifier,
          status: 'success',
        })

        return result
      })
      .catch((error) => {
        failed++
        executing.delete(promise)

        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error(`${identifier} M3U8 download failed: ${errorMessage}`)

        // 回调进度（失败）
        onProgress?.({
          total,
          completed,
          failed,
          currentParams: params,
          identifier,
          status: 'failed',
          error,
        })

        // 不抛出错误，让其他下载继续
        return Promise.resolve()
      })

    results.push(promise)
    executing.add(promise)

    // 并发控制
    if (executing.size >= maxConcurrent) {
      await Promise.race(executing)
    }
  }

  // 等待所有下载完成
  const finalResults = await Promise.allSettled(results)

  // 汇总日志
  logger.info(`Parallel M3U8 downloads finished. Success: ${completed}, Failed: ${failed}, Total: ${total}`)

  // 返回成功的结果，忽略失败的
  return finalResults
    .filter((result): result is PromiseFulfilledResult<void> => result.status === 'fulfilled')
    .map(result => result.value)
}
