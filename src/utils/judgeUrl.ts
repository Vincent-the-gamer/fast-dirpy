import { UrlType } from '../types'

export function judgeUrl(url: string): UrlType {
  const bvRegex = /BV[a-zA-Z0-9]+/
  if (url.includes('bilibili') || bvRegex.test(url)) {
    return UrlType.Bilibili
  }
  else if (url.includes('animeidhentai')) {
    return UrlType.AnimeIdHentai
  }
  return UrlType.Dirpy
}
