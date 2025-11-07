import { UrlType } from '../types'

export function judgeUrl(url: string): UrlType {
  const bvRegex = /BV[a-zA-Z0-9]+/
  if (url.includes('bilibili') || bvRegex.test(url)) {
    return UrlType.Bilibili
  }
  else if (url.includes('animeidhentai')) {
    return UrlType.AnimeIdHentai
  }
  else if (url.includes('koreanpornmovie')) {
    return UrlType.KoreanPM
  }
  else if (url.includes('missav')) {
    return UrlType.MissAV
  }
  else if ( 
    url.endsWith('.m3u8') ||
    url.includes('.m3u8') && !url.endsWith('.mp4')
  ) {
    return UrlType.M3U8
  }
  else if (
    url.endsWith('.mp4') ||
    url.includes('.mp4') && !url.endsWith('.m3u8')
  ) {
    return UrlType.MP4
  }
  return UrlType.Dirpy
}
