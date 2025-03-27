import { cac } from "cac";
import type { CAC } from "cac";
import pkgJson from "../package.json"
import restoreCursor from "restore-cursor";
import { getDirectLink } from "./core";

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

cli.help()
cli.version(pkgJson.version)
cli.parse()

restoreCursor()