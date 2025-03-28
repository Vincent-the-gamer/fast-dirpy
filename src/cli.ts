import { cac } from "cac";
import type { CAC } from "cac";
import pkgJson from "../package.json"
import restoreCursor from "restore-cursor";
import { downloadVideoFromRawLink, getDirectLink } from "./core";

const cli: CAC = cac("fast-dirpy")

cli.command("get <url>", "get video direct link.")
   .option("--proxyHost, -H <proxyHost>", "Proxy host.")
   .option("--proxyPort, -P <proxyPort>", "Proxy port.")
   .action(async (url, options) => {
    const videoLink = await getDirectLink(url, {
        host: options.proxyHost || null,
        port: options.proxyPort || null
    })

    console.log(videoLink)
   })

cli.command("download <url>", "download a video.")
   .option("--path, -p <path>", "Download destination path + filename. e.g. /xxx/example.mp4.")
   .option("--proxyHost, -H <proxyHost>", "Proxy host.")
   .option("--proxyPort, -P <proxyPort>", "Proxy port.")
   .action(async (url, options) => {
        const host =  options.proxyHost || null
        const port = options.proxyPort || null

        downloadVideoFromRawLink({
            url,
            path: options.path || "./download.mp4",
            proxy: {
                host, 
                port
            }
        })
   })

cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()