import type { Options } from '../types'
import { spawn } from 'node:child_process'
import { DEFAULT_OPTIONS } from '../constants'
import { resolveConfig } from '../options'
import { logger } from '../utils/logger'

interface M3U8ParserParams {
  input: string
  output: string
  cwd?: string
}

/**
 * Get remote m3u8 stream, then use ffmpeg to parse it to mp4.
 */
export async function remoteM3U8ToMP4(params: M3U8ParserParams, options: Partial<Options> = DEFAULT_OPTIONS) {
  const { cwd, input, output } = params

  const { ffmpeg, proxy } = await resolveConfig(options, cwd)

  const _proxy = proxy?.host !== '' ? proxy : undefined

  const ffmpegShell = spawn(ffmpeg as string || 'ffmpeg', [
    '-http_proxy',
    `${_proxy?.protocol}://${_proxy?.host}:${_proxy?.port}`,
    '-i',
    input,
    '-bsf:a',
    'aac_adtstoasc',
    '-vcodec',
    'copy',
    '-acodec',
    'copy',
    '-crf',
    '50',
    output,
  ], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  ffmpegShell.stdout?.on('data', (data) => {
    logger.info(data)
  })

  ffmpegShell.stderr?.on('data', (data) => {
    logger.error(`FFmpeg stderr: ${data.toString()}`)
    process.exit(1)
  })

  ffmpegShell.stdin?.on('error', (err) => {
    logger.error(err)
    process.exit(1)
  })

  ffmpegShell.on('close', () => {
    process.exit(0)
  })
}
