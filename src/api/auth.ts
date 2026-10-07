import request from '@/utils/request'
import type { UserInfo } from '@/stores/user'

/** 登录返回 */
export interface LoginResult {
  token: string
  role: string
  username: string
  realName: string
  userId: number
}

/** 图形校验码 */
export async function getCaptcha(): Promise<{ captchaId: string; image: string }> {
  return request.get('/auth/captcha') as Promise<{ captchaId: string; image: string }>
}

/**
 * 登录(需图形校验码)
 * POST /auth/login
 * encryptedPassword: RSA 加密后的密码(优先于 password)
 */
export async function login(data: {
  username: string
  password?: string
  encryptedPassword?: string
  captchaId: string
  captchaCode: string
}): Promise<LoginResult> {
  return request.post('/auth/login', data) as Promise<LoginResult>
}

/**
 * 登出
 * POST /auth/logout(拦截器自动带 Authorization: Bearer token)
 */
export async function logout(): Promise<void> {
  return request.post('/auth/logout') as Promise<void>
}

/** 当前登录用户详情 */
export function getUserDetail(userId?: number) {
  return request.get('/user/detail', { params: { userId } }) as Promise<UserInfo>
}
