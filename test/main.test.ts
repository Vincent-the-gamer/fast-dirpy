import { fastDownload, fastLink } from '../src'

// const a = await fastLink({
//   url: 'https://www.wow.xxx/zh/videos/tiny-blonde-cheats-with-bbc-for-sisters-boyfriend/?asgtbndr=1',
// })

// console.log(a)

await fastDownload({
  url: "https://www.wow.xxx/zh/videos/tiny-blonde-cheats-with-bbc-for-sisters-boyfriend/?asgtbndr=1",
  path: "./test-down.mp4"
}, {
  headers: {
    "Referer": "https://www.wow.xxx/"
  }
})
