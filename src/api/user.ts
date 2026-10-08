import request from '@/utils/request'

/** 用户分页列表(管理员) */
export async function getUserPage(params: { page?: number; size?: number; keyword?: string }) {
  const r = await request.get('/user/list', { params }) as { records: UserRow[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

export interface UserRow {
  id: number
  username: string
  realName: string
  phone: string
  status: number
  roleCode: string
  roleName: string
  createTime: string
  expireTime: string | null
}

/** 开通账号(管理员): 默认密码123456 */
export function createUser(data: { username: string; realName: string; password?: string }) {
  return request.post('/user/create', data) as Promise<{ id: number }>
}

/** 启用/停用账号(管理员) */
export function updateUserStatus(id: number, status: 0 | 1) {
  return request.put(`/user/${id}/status`, null, { params: { status } }) as Promise<void>
}

/** 重置密码(管理员): 不传则重置为123456 */
export function resetUserPassword(id: number, password?: string) {
  return request.put(`/user/${id}/reset-password`, password ? { password } : {}) as Promise<void>
}

/** 重新开通/续期(管理员): 默认1年, 未到期顺延 */
export function renewUser(id: number, years = 1) {
  return request.put(`/user/${id}/renew`, null, { params: { years } }) as Promise<void>
}

/** 当前登录用户基本资料 */
export interface UserProfile {
  id: number
  username: string
  realName: string
  nickname: string
  phone: string
  email: string
  avatar: string
  signature: string
  gender: number
  status: number
  expireTime: string | null
  role: string
}

export function getMyProfile() {
  return request.get('/user/me') as Promise<UserProfile>
}

export function updateMyProfile(data: {
  realName?: string
  nickname?: string
  phone?: string
  email?: string
  gender?: number
  signature?: string
  avatar?: string
}) {
  return request.put('/user/profile', data) as Promise<void>
}

export function changeMyPassword(data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) {
  return request.put('/user/password', data) as Promise<void>
}
