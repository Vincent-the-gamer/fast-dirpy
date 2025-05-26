import { it } from 'vitest'
import { remoteM3U8ToMP4 } from '../src/core/m3u8'

it('download remote m3u8 to local mp4', async () => {
  await remoteM3U8ToMP4({
    input: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    output: 'test.mp4',
  })
})
