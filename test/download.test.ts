import { it } from 'vitest'
import { downloadVideo, remoteM3U8ToMP4 } from '../src'

it('download remote m3u8 to local mp4', async () => {
  await remoteM3U8ToMP4({
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  })
})

it('download mp4', async () => {
  await downloadVideo({
    url: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
    path: "./big_buck_bunny.mp4"
  })
})