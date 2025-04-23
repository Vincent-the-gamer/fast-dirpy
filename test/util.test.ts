import { expect, it } from 'vitest'
import { UrlType } from '../src'
import { judgeUrl } from '../src/utils/judgeUrl'

it('judgeUrl', () => {
  const type: UrlType = judgeUrl('https://www.bilibili.com/video/BV1bk5bz7EMn/?spm_id_from=333.1007.tianma.6-1-17.click')
  expect(type).toBe(UrlType.Bilibili)
})
