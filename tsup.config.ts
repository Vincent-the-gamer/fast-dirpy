import type { Options } from 'tsup'

export default <Options> {
  entryPoints: [
    "./src/cli.ts"
  ],
  clean: true,
  format: ['esm'],
  dts: true,
  minify: true,
  // compatible with __dirname in cjs and import.meta.url in mjs.
  shims: true
}