import { it } from 'vitest'
import { downloadM3U8, m3u8ToMp4 } from '../src/core/m3u8'

it("download m3u8 file", async () => {
    await downloadM3U8({
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        path: "x36xhzz.m3u8"
    })
})

it("parse m3u8 to mp4", async () => {
    await m3u8ToMp4({
        input: "x36xhzz.m3u8",
        output: "test.mp4",
    })
})