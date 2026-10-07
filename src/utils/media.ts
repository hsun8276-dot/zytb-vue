/**
 * 媒体地址转换: 把 MinIO 直链改写为后端代理地址, 避免在浏览器网络面板暴露对象存储
 * http://host:9010/baoxilv/avatars/2026-09-30/x.png → /api/video/media/avatars/2026-09-30/x.png
 * 非对象存储地址(如外链校徽)原样返回
 */
const BUCKET_MARKER = '/baoxilv/'

export function mediaUrl(url?: string | null): string {
  if (!url) return ''
  const i = url.indexOf(BUCKET_MARKER)
  if (i === -1) return url
  return `/api/video/media/${url.substring(i + BUCKET_MARKER.length)}`
}
