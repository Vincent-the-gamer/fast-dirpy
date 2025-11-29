import { fastLink } from '../src'

const a = await fastLink({
  url: 'https://www.bilibili.com/video/BV1wQSLBBEs8',
})

console.log(a)

// await fastDownload({
//   url: "https://www.bilibili.com/video/BV1wQSLBBEs8",
//   path: "./test-down.mp4"
// })
