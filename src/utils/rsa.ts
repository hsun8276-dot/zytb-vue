import { JSEncrypt } from 'jsencrypt'

/**
 * 密码等敏感字段 RSA 加密工具
 * <p>
 * 前端从后端获取 RSA 公钥，用公钥加密真实密码后传输；
 * 后端用私钥解密后校验，避免密码在浏览器开发者工具/网络抓包中明文暴露。
 */

/** 旧版本把公钥存在 localStorage，auth 服务重启换了密钥后会一直解密失败，这里清掉 */
localStorage.removeItem('baoxilv_rsa_public_key')

/** 公钥只缓存在内存里，刷新页面即重新获取（服务端每次启动都会生成新密钥对） */
let cachedPublicKey: string | null = null

async function getPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey
  const res = await requestCryptoKey()
  // 兼容 { code:0, data:{ publicKey } } 与直接返回 publicKey
  const publicKey = (res as any)?.publicKey ?? (res as any)?.data?.publicKey
  if (!publicKey) {
    throw new Error('获取加密公钥失败')
  }
  cachedPublicKey = publicKey
  return publicKey
}

async function requestCryptoKey(): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const resp = await fetch('/api/crypto/rsa/public-key', { signal: controller.signal })
    const json = await resp.json()
    return json?.data ?? json
  } finally {
    clearTimeout(timer)
  }
}

/** 用 RSA 公钥加密明文，返回 Base64 密文 */
export async function rsaEncrypt(plainText: string): Promise<string> {
  const publicKey = await getPublicKey()
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  const encrypted = encryptor.encrypt(plainText)
  if (!encrypted) {
    throw new Error('密码加密失败')
  }
  return encrypted
}

/** 重置公钥缓存（例如服务重启后密钥对变化导致解密失败时） */
export function resetRsaKeyCache(): void {
  cachedPublicKey = null
}

/** 登录时统一处理：返回加密后的密码与清除的明文 */
export async function encryptPasswordForLogin(password: string): Promise<{ encryptedPassword: string }> {
  try {
    const encryptedPassword = await rsaEncrypt(password)
    // 服务端优先使用 encryptedPassword，明文字段放空，避免明文出现在网络面板
    return { encryptedPassword }
  } catch {
    // 加密服务不可用时回退明文（接口需兼容），保证登录不中断
    return { encryptedPassword: '' }
  }
}