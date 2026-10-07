import request from '@/utils/request'

/** 登录返回 */
export interface LoginResult {
  token: string
  role: string
  username: string
  realName: string
  userId: number
}

/**
 * 登录
 * POST /auth/login
 * encryptedPassword: RSA 加密后的密码（优先于 password）
 */
export async function login(data: {
  username: string
  password?: string
  encryptedPassword?: string
}): Promise<LoginResult> {
  return request.post('/auth/login', data) as Promise<LoginResult>
}

/**
 * 注册
 * POST /auth/register
 */
export async function register(data: { phone: string; password: string; role: string }): Promise<void> {
  return request.post('/auth/register', data) as Promise<void>
}

/**
 * 登出
 * POST /auth/logout（拦截器自动带 Authorization: Bearer token）
 */
export async function logout(): Promise<void> {
  return request.post('/auth/logout') as Promise<void>
}

/** 获取当前用户信息（演示接口 header 注入） */
export async function getCurrentUser(): Promise<{
  userId: string
  username: string
  role: string
}> {
  return request.get('/user/info') as Promise<{
    userId: string
    username: string
    role: string
  }>
}

/**
 * 重置用户密码（管理员可重置任意账号，老师只能重置学生）
 * PUT /user/{id}/password/reset
 */
export async function resetUserPassword(userId: number, password: string): Promise<void> {
  return request.put(`/user/${userId}/password/reset`, { password }) as Promise<void>
}