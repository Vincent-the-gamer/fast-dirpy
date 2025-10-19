import type { Options } from './types'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_OPTIONS: Options = {
  timeout: 20000, // 20s
}

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
