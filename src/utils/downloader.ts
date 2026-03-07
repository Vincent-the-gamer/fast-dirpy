import type { DownloadParams, Options } from '../types'
import fs from 'node:fs'
import axios from 'axios'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from './logger'
import { useRandomUserAgent } from './userAgent'

// 生成简单的标识符（使用索引+视频ID或URL的简短形式）
const getVideoIdentifier = (params: DownloadParams): string => {
  // 标识符则使用URL的最后部分
  const shortId = params.url.split('/').pop() || 'unknown'
  return `[${shortId}]`
}

export async function downloadVideo(params: DownloadParams, options: Partial<Options> = DEFAULT_OPTIONS): Promise<void> {
  const { path, url } = params

  const identifier = getVideoIdentifier(params)

  const { proxy, timeout } = await resolveConfig(options)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  if (url === '') {
    return Promise.reject(
      new Error('Extract direct link failed!'),
    )
  }

  const writer = fs.createWriteStream(path || './download.mp4')
  const response = await axios({
    url,
    headers: {
      'User-Agent': useRandomUserAgent(),
      ...options.headers,
    },
    method: 'GET',
    responseType: 'stream',
    proxy: _proxy,
    timeout,
    onDownloadProgress: (progressEvent) => {
      const { loaded, total, progress } = progressEvent

      const message = `[${identifier ?? ''}] loaded:${loaded}  `
        + `total: ${total}  `
        + `progress: ${(progress! * 100).toFixed(2)}%`
      logger.info(message)
    },
  })
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

export interface ParallelDownloadProgress {
  total: number
  completed: number
  failed: number
  currentParams: DownloadParams,
  identifier?: string,
  status: 'pending' | 'success' | 'failed'
  error?: Error
}

/**
 * 并行下载多个视频
 * @param paramsList 下载参数列表
 * @param options 下载选项
 * @param maxConcurrent 最大并行数，默认5
 * @param onProgress 进度回调函数
 * @returns Promise<void[]>
 */
export async function downloadVideosParallel(
  paramsList: DownloadParams[],
  options: Partial<Options> = DEFAULT_OPTIONS,
  maxConcurrent: number = 5,
  onProgress?: (progress: ParallelDownloadProgress) => void,
): Promise<void[]> {
  const results: Promise<void>[] = []
  const executing: Set<Promise<void>> = new Set()

  // 跟踪下载状态
  let completed = 0
  let failed = 0
  const total = paramsList.length

  logger.info(`Starting parallel downloads: ${total} videos, max concurrent: ${maxConcurrent}`)

  for (const [index, params] of paramsList.entries()) {
    const identifier = getVideoIdentifier(params)

    // 创建下载任务，并处理成功/失败状态
    const promise = downloadVideo(params, options)
      .then((result) => {
        completed++
        executing.delete(promise)

        logger.info(`${index + 1}/${total} ${identifier} Download completed`)

        // 回调进度
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
        logger.error(`${identifier} Download failed: ${errorMessage}`)

        // 回调进度
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
  logger.info(`Parallel downloads finished. Success: ${completed}, Failed: ${failed}, Total: ${total}`)

  // 返回成功的结果，忽略失败的
  return finalResults
    .filter((result): result is PromiseFulfilledResult<void> => result.status === 'fulfilled')
    .map(result => result.value)
}