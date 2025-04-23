import { expect, it } from 'vitest'
import { judgeUrl } from '../src/utils/judgeUrl'
import { UrlType } from '../src'

it("judgeUrl", () => {
    const type: UrlType = judgeUrl("https://www.bilibili.com/video/BV1bk5bz7EMn/?spm_id_from=333.1007.tianma.6-1-17.click")
    expect(type).toBe(UrlType.Bilibili)
})