import { fastLink, fastDownload } from "../src";

// const link = await fastLink({
//     url: "xxx"
// })

// console.log(link)

await fastDownload({
    url: "xxx",
    path: "./download.mp4"
})