# fast-dirpy

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A simple library/CLI to download youtube(etc.) videos.

## Installation

### As a library
```shell
npm i fast-dirpy
```

### As a **command line tool**
```shell
npm i fast-dirpy -g
```

## Usage

### Use in command line

#### Get Direct Link

```shell
# get video direct link
# Proxy:
#   -H, --proxyHost: proxy host
#   -P, --proxyPort: proxy port
fast-dirpy get https\://www.youtube.com/watch\?v\=SAXpBgkXt60 -H 127.0.0.1 -P 7890
```

#### Download Video
```shell
# get video direct link
# Path: --path, -P: Downloaded video save path.
#
# Proxy:
#  -H, --proxyHost: proxy host.
#  -P, --proxyPort: proxy port.
fast-dirpy download https\://www.youtube.com/watch\?v\=SAXpBgkXt60 -p ./test.mp4  -H 127.0.0.1 -P 7890
```

### Use as a library
```ts
import { downloadVideoFromRawLink, getDirectLink } from 'fast-dirpy'

// get direct link
const link = await getDirectLink(
  '<url>',
  {
    host: '127.0.0.1',
    port: 7890
  }
)

// download video
await downloadVideoFromRawLink({
  url,
  path: './download.mp4',
  proxy: {
    host: '127.0.0.1',
    port: 7890
  }
})
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [Vincent-the-gamer](https://github.com/Vincent-the-gamer)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/fast-dirpy?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/fast-dirpy
[npm-downloads-src]: https://img.shields.io/npm/dm/fast-dirpy?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/fast-dirpy
[bundle-src]: https://img.shields.io/bundlephobia/minzip/fast-dirpy?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=fast-dirpy
[license-src]: https://img.shields.io/github/license/Vincent-the-gamer/fast-dirpy.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Vincent-the-gamer/fast-dirpy/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/fast-dirpy
