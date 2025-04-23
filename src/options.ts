import type { DirpyOptions } from './types'
import deepmerge from 'deepmerge'
import { createConfigLoader } from 'unconfig'
import { DEFAULT_DIRPY_OPTIONS } from './constants'
import { logger } from './utils/logger'

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

  logger.info(`Config file found: ${sources[0]}`)

  return deepmerge(deepmerge(defaults, config), options)
}
