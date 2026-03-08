import { remoteM3U8ToMP4Parallel } from "../src";

await remoteM3U8ToMP4Parallel([{
  url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8',
  path: './test1.mp4'
}, {
  url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8',
  path: './test2.mp4'
}])