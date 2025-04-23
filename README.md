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
  <summary>「Mystic」Websites</summary>

  - Animeidhentai (Google Chrome required)
</details>

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
    headless: false
  }
```

### Use in command line

> [!IMPORTANT]
> Some website listed in [Supported Websites](#supported-websites) requires Google Chrome installed for Puppeteer use. You have to use a config file.

#### Get Direct Link

```shell
# get video direct link
# Proxy:
#   -H, --proxyHost: proxy host
#   -P, --proxyPort: proxy port
#   -c, --config: Specified external config file.
#       e.g.: fast-dirpy get https://xxx -c ~/Downloads/fast-dirpy.config.json
#  --chromePath: Path to your Google Chrome browser.
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
> Some website listed in [Supported Websites](#supported-websites) requires Google Chrome installed for Puppeteer use. You have to use a config file or give parameter of puppeteer executable path.

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
fast-dirpy download https://www.bilibili.com/video/BV1TSPeeGE35 -p ./test.mp4
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

> [!IMPORTANT]
> If a website is listed in [Supported Websites](#supported-websites), then `getXXXLink` is to get direct link and `downloadXXX` is to download video. 

```ts
import { downloadDirpy, getBilibiliLink, getDirpyLink } from 'fast-dirpy'

// get direct link
const link = await getDirpyLink(
  {
    url: '<url>',
    cwd: '/path/to/external-config' // Optional: You can specify an external config file.
  },
  {
    host: '127.0.0.1',
    port: 7890
  }
)

// get bilibili direct link
const link = await getBilibiliLink(
  '<url>',
)

// download video
await downloadDirpy({
  url: '<url>',
  path: './download.mp4',
  cwd: '/path/to/external-config', // Optional: You can specify an external config file.
  proxy: {
    host: '127.0.0.1',
    port: 7890
  }
})

// download bilibili video
await downloadBilibili({
  url: '<url>',
  path: './myvideo.mp4'
})
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
