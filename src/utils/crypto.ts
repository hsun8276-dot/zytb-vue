/**
 * 接口地址加密(信封封装): 把 请求方法+路径+参数+请求体 整体加密成密文,
 * 统一 POST 到 /api/gw, 由网关解密后转发, 浏览器网络面板只见 /api/gw?xxx 不见真实接口路径。
 *
 * 说明: 密钥随前端打包分发, 属于"防直接观察"的混淆手段而非密码学机密;
 * 真正的访问控制仍由 JWT + 网关鉴权承担。
 */
const KEY_B64 = 'IH0zYCGnbvIp48FFuwa2siSBs5eDW6wyB58ZH/qNUXs='

let cachedKey: CryptoKey | null = null

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
}

async function getKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = await crypto.subtle.importKey('raw', b64ToBytes(KEY_B64) as BufferSource, 'AES-GCM', false, ['encrypt'])
  }
  return cachedKey
}

/** 加密为 iv(12B) + AES-GCM 密文 的 base64 */
export async function encryptEnvelope(obj: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(JSON.stringify(obj))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), plain as BufferSource)
  const out = new Uint8Array(12 + ct.byteLength)
  out.set(iv, 0)
  out.set(new Uint8Array(ct), 12)
  return bytesToB64(out)
}
