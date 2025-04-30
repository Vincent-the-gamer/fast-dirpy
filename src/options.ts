import type { Options } from './types'
import deepmerge from 'deepmerge'
import { createConfigLoader } from 'unconfig'
import { DEFAULT_OPTIONS } from './constants'
import { logger } from './utils/logger'

export async function resolveConfig(options: Options, cwd?: string): Promise<Options> {
  const defaults = DEFAULT_OPTIONS

  const loader = createConfigLoader<Options>({
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
