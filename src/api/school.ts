import request from '@/utils/request'

/** 班级信息 */
export interface ClassInfo {
  id: number
  teacherId: number
  name: string
  grade: string
  description: string
  inviteCode: string
  status: number
  createTime: string
  updateTime: string
  deleted: number
}

/** 班级学生 */
export interface ClassStudent {
  scId: number
  id: number
  username: string
  realName: string
  phone: string
  status: number
  joinedAt: string
}

/** 可供添加的学生（学生角色、正常状态） */
export interface AvailableStudent {
  id: number
  username: string
  realName: string
  phone: string
}

/** 班级列表（老师端, 服务端分页） */
export async function getClassList(page = 1, size = 20): Promise<{ records: ClassInfo[]; total: number }> {
  const r = await request.get('/class/list', { params: { page, size } }) as { records: ClassInfo[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 全部班级(下拉选项用, 班级数量有限, 上限200) */
export async function getAllClassOptions(): Promise<ClassInfo[]> {
  const r = await request.get('/class/list', { params: { page: 1, size: 200 } }) as { records: ClassInfo[] }
  return r.records || []
}

/** 创建班级 */
export async function createClass(data: Partial<ClassInfo>): Promise<ClassInfo> {
  return request.post('/class', data) as Promise<ClassInfo>
}

/** 更新班级 */
export async function updateClass(id: number, data: Partial<ClassInfo>): Promise<ClassInfo> {
  return request.put(`/class/${id}`, data) as Promise<ClassInfo>
}

/** 删除班级 */
export async function deleteClass(id: number): Promise<void> {
  return request.delete(`/class/${id}`) as Promise<void>
}

/** 班级学生列表(服务端分页) */
export async function getClassStudents(classId: number, page = 1, size = 20): Promise<{ records: ClassStudent[]; total: number }> {
  const r = await request.get(`/class/students/${classId}`, { params: { page, size } }) as { records: ClassStudent[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 添加学生到班级 */
export async function addStudentToClass(classId: number, studentId: number): Promise<void> {
  return request.post('/class/student', null, { params: { classId, studentId } }) as Promise<void>
}

/** 从班级移除学生 */
export async function removeStudentFromClass(id: number): Promise<void> {
  return request.delete(`/class/student/${id}`) as Promise<void>
}

/** 所有学生列表（用于添加到班级, 服务端分页） */
export async function getAllStudents(page = 1, size = 20, keyword?: string): Promise<{ records: AvailableStudent[]; total: number }> {
  const r = await request.get('/class/all-students', { params: { page, size, keyword } }) as { records: AvailableStudent[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}