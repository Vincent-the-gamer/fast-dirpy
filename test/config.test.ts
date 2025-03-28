import { expect, test } from "vitest";
import { resolveConfig } from "../src/options";

test("Config Load", async () => {
    const config = await resolveConfig({})

    // create fast-dirpy.config.ts first.
    expect(config).toBe({
        timeout: 20000,
        proxy: { protocol: 'http', host: '127.0.0.1', port: 7890 }
    })
})