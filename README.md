<div align="center">
  <img src=".github/fast-dirpy.png" style="width: 90px;"/>
  <h1>fast-dirpy</h1>
</div>

[![npm version][npm-version-src]][npm-version-href]
[![JSR][jsr-badge]](https://jsr.io/@vince-g/fast-dirpy)
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A simple library/CLI to download youtube(etc.) videos.

## Supported Websites

- [YouTube](https://www.youtube.com/)
- [Bilibili](https://www.bilibili.com/)

<details>
  <summary>NSFW</summary>

  * [Animehentai](https://animeidhentai.com/)
  * [Koreanpornmovies](https://koreanpornmovie.com/)
  * [XVideos](https://www.xvideos.com/)
  * [Missav](https://missav.ws/) (m3u8)
</details>

And `.m3u8` videos.

> [!IMPORTANT]
> From v0.3.0, .m3u8 downloader is no longer using ffmpeg.
> And it doesn't provide proxy settings, so, you need to use `export https_proxy=http://ip:port` to set proxy manually in terminal.

You can use this [userscript](https://greasyfork.org/zh-CN/scripts/449581-m3u8%E8%A7%86%E9%A2%91%E4%BE%A6%E6%B5%8B%E4%B8%8B%E8%BD%BD%E5%99%A8-%E8%87%AA%E5%8A%A8%E5%97%85%E6%8E%A2) to extract `.m3u8` sources from websites.

## Installation

### As a library
```shell
npm i fast-dirpy

# deno
deno add jsr:@vince-g/fast-dirpy
```

### As a **command line tool**
```shell
npm i fast-dirpy -g
```

### Additional: download `ffmpeg`

https://www.ffmpeg.org/download.html

## Usage

### Config file

> [!IMPORTANT]
> `fast-dirpy.config` can be `fast-dirpy.config.['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json']`

You can create a `fast-dirpy.config` file in your library root or same location in command line.

```ts
import { defineConfig } from 'fast-dirpy'

export default defineConfig({
  proxy: {
    protocol: 'http',
    host: '127.0.0.1',
    port: 7890,
  },
  timeout: 20000, // request timeout: 20s
  puppeteer: {
    // Path to Chrome. Please notice that you must give the inner unix executable file path in macOS.
    // /Applications/Google Chrome.app will not work.
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true
  }
}
```

### Use in command line

> [!IMPORTANT]
> Some website listed in [Supported Websites](#supported-websites) requires Google Chrome installed for Puppeteer use. You have to use a config file or give parameter of puppeteer executable path.

#### Get Direct Link

```shell
# get video direct link
# Proxy:
#   -H, --proxyHost: proxy host
#   -P, --proxyPort: proxy port
#   -c, --config: Specified external config file.
#       e.g.: fast-dirpy get https://xxx -c ~/Downloads/fast-dirpy.config.json
#   --chromePath: Path to your Google Chrome browser.
fast-dirpy get https\://www.youtube.com/watch\?v\=6c28qWDMPBA -H 127.0.0.1 -P 7890

# Bilibili source doesn't need any proxy, so it's disabled by default.
fast-dirpy get https://www.bilibili.com/video/BV1TSPeeGE35
```

if you have set your proxy config in `fast-dirpy.config.ts`, you can omit proxy parameters:

```shell
fast-dirpy get https\://www.youtube.com/watch\?v\=6c28qWDMPBA
```

#### Download Video

> [!IMPORTANT]
> 1. Some website listed in [Supported Websites](#supported-websites) requires Google Chrome installed for Puppeteer use. You have to use a config file or give parameter of puppeteer executable path.
> 2. `.m3u8` source is handled by `ffmpeg`.

```shell
# get video direct link
# Path: --path, -p: Downloaded video save path.
#
# Proxy:
#  -H, --proxyHost: proxy host.
#  -P, --proxyPort: proxy port.
#  -c, --config: Specified external config file.
#       e.g.: fast-dirpy get https://xxx -c ~/Downloads/fast-dirpy.config.json
#  --chromePath: Path to your Google Chrome browser.
fast-dirpy download https\://www.youtube.com/watch\?v\=6c28qWDMPBA -p ./test.mp4  -H 127.0.0.1 -P 7890

# Bilibili source doesn't need any proxy, so it's disabled by default.
fast-dirpy download https\://www.bilibili.com/video/BV1TSPeeGE35 -p ./test.mp4

# m3u8 sources
fast-dirpy download https\://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8 -p ./test.mp4

# mp4 sources
fast-dirpy download http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4 -p ./big_buck_bunny.mp4
```

if you have set your proxy config in `fast-dirpy.config.ts`, you can omit proxy parameters:

```shell
fast-dirpy download https\://www.youtube.com/watch\?v\=6c28qWDMPBA -p ./test.mp4
```

For further CLI help:

```shell
fast-dirpy --help
```

### Use as a library
```ts
import { fastLink, fastDownload } from 'fast-dirpy'

// get direct link
const link = await fastLink(
  {
    url: '<url>',
    cwd: '/path/to/external-config' // Optional: You can specify an external config file.
  },
  // options (Optional, can be omitted if you have a config file, this will overwrites your config file options.)
  {
    proxy: { ... }
  }
)

// download video
await fastDownload({
  url: '<url>',
  path: './download.mp4',
  cwd: '/path/to/external-config', // Optional: You can specify an external config file.
}, 
// options (Optional, can be omitted if you have a config file, this will overwrites your config file options.)
{
  proxy: { ... }
})

// Download `.m3u8` video
await remoteM3U8ToMP4({
  url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  path: './test.mp4',
})

// Download `.mp4` video
await downloadVideo({
    url: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
    path: "./big_buck_bunny.mp4"
})
```

## Test

To run single test case in Vitest, using:

```shell
pnpm run test src/test/xxx.test.ts:<line_number>
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [Vincent-the-gamer](https://github.com/Vincent-the-gamer)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/fast-dirpy?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/fast-dirpy
[npm-downloads-src]: https://img.shields.io/npm/dm/fast-dirpy?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/fast-dirpy
[license-src]: https://img.shields.io/github/license/Vincent-the-gamer/fast-dirpy.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Vincent-the-gamer/fast-dirpy/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/fast-dirpy
[jsr-badge]: https://jsr.io/badges/@vince-g/fast-dirpy
