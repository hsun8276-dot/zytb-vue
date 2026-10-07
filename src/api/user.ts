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
