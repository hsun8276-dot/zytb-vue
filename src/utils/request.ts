import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { encryptEnvelope } from './crypto'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 数组参数编码成 ids=1&ids=2，Spring 的 @RequestParam List 才能绑定（axios 默认是 ids[]=1）
  paramsSerializer: { indexes: null }
})

// 接口地址加密开关: true = 请求整体加密成信封统一POST /api/gw(浏览器只见密文);
// false = 明文直连真实路径(调试友好)。两端配合: 网关 ApiCryptoGlobalFilter 始终兼容两种形式
const ENVELOPE_ENABLED = false

// 不加密直连的路径: 网关解密入口自身 / 登录前取公钥 / video·img 标签请求(无法加密) / 公开资源
const PLAIN_PREFIXES = ['/gw', '/crypto/', '/video/stream/', '/video/media/']

// 请求拦截器
request.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const userId = localStorage.getItem('userId')
    if (userId) {
      config.headers['X-User-Id'] = userId
    }
    // 接口地址加密: 文件上传(FormData)/文件下载(blob)/白名单路径直连, 其余整体加密成信封
    // WebCrypto 仅在安全上下文(https/localhost)可用, 非安全上下文自动降级为明文直连
    const canEncrypt = ENVELOPE_ENABLED && typeof crypto !== 'undefined' && !!crypto.subtle
    if (
      !canEncrypt ||
      config.responseType === 'blob' ||
      config.data instanceof FormData ||
      PLAIN_PREFIXES.some(p => config.url?.startsWith(p))
    ) {
      return config
    }
    const method = (config.method || 'get').toUpperCase()
    const envelope: Record<string, unknown> = { m: method, p: (config.url || '').replace(/^\//, ''), ts: Date.now() }
    if (config.params && Object.keys(config.params).length) {
      // 与 axios 默认序列化对齐: 跳过 null/undefined 参数
      const q: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(config.params)) {
        if (v === null || v === undefined) continue
        q[k] = v
      }
      if (Object.keys(q).length) envelope.q = q
    }
    if (config.data !== undefined && method !== 'GET') {
      envelope.b = config.data
    }
    const d = await encryptEnvelope(envelope)
    config.method = 'post'
    config.url = '/gw'
    config.params = undefined
    config.data = { d }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 二进制响应(文件下载)直接返回, 不走统一code判断
    if (response.config.responseType === 'blob') {
      return res
    }
    if (res.code === 0) {
      return res.data
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request

/** 后端统一分页结构 */
export interface PageData<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** 兼容判断: 是否为后端分页对象 */
export function isPageData<T>(res: unknown): res is PageData<T> {
  return !!res && typeof res === 'object' && Array.isArray((res as PageData<T>).records)
}

/**
 * 从列表接口响应中取数组。
 * 后端列表接口统一返回 { records, total, ... } 分页对象,
 * 旧接口仍可能直接返回数组, 两种都兼容。
 */
export function listOf<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res
  if (isPageData<T>(res)) return res.records ?? []
  return []
}

/** 取分页对象(无分页时构造空页) */
export function pageOf<T>(res: unknown): PageData<T> {
  if (isPageData<T>(res)) return res
  return { records: Array.isArray(res) ? (res as T[]) : [], total: 0, size: 20, current: 1, pages: 0 }
}
