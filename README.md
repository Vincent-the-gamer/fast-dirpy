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

- [Animehentai](https://animeidhentai.com/)
- [Koreanpornmovies](https://koreanpornmovie.com/)
- [XVideos](https://www.xvideos.com/)
- [Hanime1.me](https://hanime1.me/)
- [wow.xxx](https://www.wow.xxx/)
- [rule34.xyz](https://rule34.xyz/) (2d/3d videos)

> [!WARNING]
> MissAV has a cloudflare challenge page which can't be bypassed using puppeteer/playwright, so you need to download the html page manually
> (no js and css needed, only html), then pass the local file path to extract m3u8 source.
> `fast-dirpy download --json '[{"url": "missav:/home/xxx/Downloads/xxx.html", "path": "./msav-test.mp4"}]'`
>
> And this method is unstable, sometimes you'll get http 429.

- [missav](https://missav.ws/)

> [!WARNING]
> XHamster requests are mostly failed, so above v1.0.2, it also provides manual link extract method.
> download the html page(no js and css needed, only html), then pass the local file path to extract m3u8 source.
> `fast-dirpy download --json '[{"url": "xhamster:/home/xxx/Downloads/xxx.html", "path": "./xhamster-test.mp4"}]'`

- [xhamster](https://xhamster.com/) (m3u8, if error, manually download html page and )

  </details>

And `.m3u8` videos.

## Agent Skill

fast-dirpy now has a skill: [Find fast-dirpy skill](https://github.com/Vincent-the-gamer/skills)

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
fast-dirpy get https://www.youtube.com/watch?v=6c28qWDMPBA -H 127.0.0.1 -P 7890

# Bilibili source doesn't need any proxy, so it's disabled by default.
fast-dirpy get https://www.bilibili.com/video/BV1TSPeeGE35
```

if you have set your proxy config in `fast-dirpy.config.ts`, you can omit proxy parameters:

```shell
fast-dirpy get https\://www.youtube.com/watch\?v\=6c28qWDMPBA
```

#### Download Video

> [!IMPORTANT]
>
> 1. Some website listed in [Supported Websites](#supported-websites) requires Google Chrome installed for Puppeteer use. You have to use a config file or give parameter of puppeteer executable path.
> 2. You can download multiple videos in parallel at version `v1.0.0` and above.

```shell
# Proxy:
#  -H, --proxyHost: proxy host.
#  -P, --proxyPort: proxy port.
#  -c, --config: Specified external config file.
#       e.g.: fast-dirpy get https://xxx -c ~/Downloads/fast-dirpy.config.json
#  --chromePath: Path to your Google Chrome browser.

fast-dirpy download --json '[{"url": "https://www.bilibili.com/video/BV1uEAWzuEHC","path": "./cmd-test.mp4"}]' -H 127.0.0.1 -P 7890

fast-dirpy download --jsonFile ./test/params.json -H 127.0.0.1 -P 7890
```

if you have set your proxy config in `fast-dirpy.config.ts`, you can omit proxy parameters:

```shell
fast-dirpy download --jsonFile ./test/params.json

fast-dirpy download --json '[{"url": "https://www.bilibili.com/video/BV1uEAWzuEHC","path": "./cmd-test.mp4"}]'
```

For further CLI help:

```shell
fast-dirpy --help
```

### Use as a library

> [!IMPORTANT]
> You can download multiple videos in parallel at version `v1.0.0` and above.

```ts
import { fastLink, fastDownload, remoteM3U8ToMP4, downloadVideo } from 'fast-dirpy'

// get direct link, returns string or object(some cases)
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
await fastDownload([{
  url: '<url>',
  path: './download.mp4',
  cwd: '/path/to/external-config', // Optional: You can specify an external config file.
}],
// options (Optional, can be omitted if you have a config file, this will overwrites your config file options.)
{
  proxy: { ... }
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
