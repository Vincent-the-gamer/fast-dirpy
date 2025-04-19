import type { Options } from 'tsdown'

export default <Options> {
  entry: [
    './src/{index,cli,config}.ts',
  ],
  clean: true,
  format: ['esm'],
  dts: true,
  minify: false,
  // compatible with __dirname in cjs and import.meta.url in mjs.
  shims: true,
}
