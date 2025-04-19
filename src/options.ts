import type { DirpyOptions } from './types'
import deepmerge from 'deepmerge'
import { createConfigLoader } from 'unconfig'
import { logger } from './utils/logger'

export const DEFAULT_DIRPY_OPTIONS: DirpyOptions = {
  timeout: 20000, // 20s
}

export async function resolveConfig(options: DirpyOptions, cwd?: string): Promise<DirpyOptions> {
  const defaults = DEFAULT_DIRPY_OPTIONS

  const loader = createConfigLoader<DirpyOptions>({
    sources: [
      {
        files: [
          'fast-dirpy.config',
        ],
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json'],
      },
    ],
    cwd: cwd || process.cwd(),
    merge: false,
  })

  const { config, sources } = await loader.load()

  if (!sources.length)
    return deepmerge(defaults, options)

  logger.info(`You are using config file: ${sources[0]}`)

  return deepmerge(deepmerge(defaults, config), options)
}
