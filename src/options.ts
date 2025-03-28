import { createConfigLoader } from "unconfig";
import { DirpyOptions } from "./types";
import deepmerge from "deepmerge"

export const DEFAULT_DIRPY_OPTIONS: DirpyOptions = {
    timeout: 20000, // 20s
}

export async function resolveConfig(options: DirpyOptions): Promise<DirpyOptions> {
    const defaults = DEFAULT_DIRPY_OPTIONS

    const loader = createConfigLoader<DirpyOptions>({
        sources: [
            {
                files: [
                    'fast-dirpy.config',
                ],
                extensions: ["ts", "mts", "cts", "js", "mjs", "cjs"],
            },
        ],
        cwd: process.cwd(),
        merge: false,
    })

    const { config, sources } = await loader.load()

    if (!sources.length)
        return deepmerge(defaults, options)

    // console.log(`config file found ${sources[0]}`)

    return deepmerge(deepmerge(defaults, config), options)
}