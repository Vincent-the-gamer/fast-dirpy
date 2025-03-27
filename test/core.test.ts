import { test, expect } from "vitest"
import { downloadVideo } from "../src/core"

test("Download video", async () => {
    const link = await downloadVideo("https://www.xvideos.com/video.uiepedff775/_", {
        host: "127.0.0.1",
        port: 7890
    })

    expect(link).toBe(
        "https://cdn77-vid-mp4.xvideos-cdn.com/dv0Bo6qmGyiruMAzU8W0Kw==,1743074997/videos/3gp/7/8/a/xvideos.com_78af7093c595d05e7c1ce689d6c64940-1.mp4?ui=NTEuODEuMTk3LjEzNi0tL3ZpZGVvLnVpZXBlZGZmNzc1L2hvdF9idXN0eV9h"
    )
})