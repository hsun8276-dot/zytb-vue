import request, { listOf } from '@/utils/request'

/** 数据看板返回 */
export interface DashboardData {
  totalUsers: number
  todayActive: number
  totalQuestions: number
  totalVideos: number
  totalExercises: number
  correctRate: number
  categoryDistribution: { name: string; count: number }[]
  weeklyTrend: { day: string; count: number }[]
}

/** 管理端数据看板 */
export async function getDashboardStats(): Promise<DashboardData> {
  return request.get('/statistics/dashboard') as Promise<DashboardData>
}

/** 用户列表（示例） */
export interface UserRow {
  id: number
  username: string
  realName: string | null
  phone: string | null
  status: number
  createTime: string
  roles?: { code: string; name: string }[]
}

export async function getUserList(): Promise<UserRow[]> {
  return listOf<UserRow>(await request.get('/user/list', { params: { page: 1, size: 500 } }))
}

/** 更新用户状态（启用/禁用） */
export async function updateUserStatus(id: number, status: number): Promise<void> {
  return request.put(`/user/${id}/status`, null, { params: { status } }) as Promise<void>
}

/** 新增用户（管理端，可赋予任意角色） */
export async function createUser(data: {
  phone: string
  password: string
  realName?: string
  role: string
  /** 学生必填 */
  categoryId?: number
}): Promise<void> {
  return request.post('/user/create', data) as Promise<void>
}

/** 考试类 */
export interface CategoryRow {
  id: number
  code: string
  name: string
  description: string | null
  leadSchool: string | null
  totalScore: number
}

export async function getCategoryList(): Promise<CategoryRow[]> {
  return listOf<CategoryRow>(await request.get('/category/list', { params: { page: 1, size: 500 } }))
}

/** 新建考试类 */
export async function createCategory(data: Partial<CategoryRow>): Promise<CategoryRow> {
  return request.post('/category', data) as Promise<CategoryRow>
}

/** 更新考试类 */
export async function updateCategory(id: number, data: Partial<CategoryRow>): Promise<CategoryRow> {
  return request.put(`/category/${id}`, data) as Promise<CategoryRow>
}

/** 删除考试类 */
export async function deleteCategory(id: number): Promise<void> {
  return request.delete(`/category/${id}`) as Promise<void>
}

/** ====== 内容审核 ====== */

/** 题目列表（管理端，含未发布, 服务端分页） */
export async function getPendingQuestions(params?: {
  status?: number
  page?: number
  size?: number
}): Promise<{ records: any[]; total: number }> {
  const r = await request.get('/question/list', { params: { ...params, all: true } }) as { records: any[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 通用审核状态：question=题目 / video=视频 / paper=试卷 */
export async function auditStatus(id: number, status: number, type: 'question' | 'video' | 'paper'): Promise<void> {
  if (type === 'question') {
    return request.put(`/question/${id}/status`, null, { params: { status } }) as Promise<void>
  }
  if (type === 'video') {
    return request.put(`/video/${id}/status`, null, { params: { status } }) as Promise<void>
  }
  return request.put(`/exam/paper/${id}/status`, null, { params: { status } }) as Promise<void>
}

/** ====== 系统日志 ====== */

export interface SysLogRow {
  id: number
  userId: number | null
  userName: string | null
  module: string | null
  action: string | null
  requestParams: string | null
  responseData: string | null
  ip: string | null
  duration: number | null
  status: number | null
  createTime: string | null
}

export async function getSysLogs(params?: {
  module?: string
  status?: number
  page?: number
  size?: number
}): Promise<{ total: number; rows: SysLogRow[]; page: number; size: number }> {
  return request.get('/statistics/log/list', { params }) as Promise<{ total: number; rows: SysLogRow[]; page: number; size: number }>
}

/** 清空系统日志 */
export async function clearSysLogs(): Promise<void> {
  return request.delete('/statistics/log/clear') as Promise<void>
}