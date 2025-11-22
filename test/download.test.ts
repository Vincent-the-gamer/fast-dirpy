import { downloadVideo, remoteM3U8ToMP4 } from '../src'

await remoteM3U8ToMP4({
  url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
})

await downloadVideo({
  url: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
  path: "./big_buck_bunny.mp4"
})

