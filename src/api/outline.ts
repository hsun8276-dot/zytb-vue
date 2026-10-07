import request from '@/utils/request'

/** 考试大纲/考试说明 */
export interface ExamOutline {
  id: number
  categoryId: number
  year: number
  title: string
  sourceUrl: string
  sourceName: string
  announcementUrl: string
  status: number
  createTime: string
  updateTime: string
}

export interface ExamOutlinePayload {
  categoryId: number
  year: number
  title: string
  sourceUrl: string
  sourceName?: string
  announcementUrl?: string
  status?: number
}

/** 考试大纲列表(学生端/公开) */
export function listOutlines(params: { categoryId?: number; year?: number }) {
  return request.get<any, ExamOutline[]>('/outline/list', { params })
}

/** 考试大纲分页(管理端) */
export function pageOutlines(params: {
  page?: number
  size?: number
  categoryId?: number
  year?: number
  keyword?: string
}) {
  return request.get<any, { records: ExamOutline[]; total: number }>('/outline/page', { params })
}

/** 新建/更新考试大纲(管理端) */
export function saveOutline(data: ExamOutlinePayload) {
  return request.post<any, ExamOutline>('/outline', data)
}

/** 更新考试大纲(管理端) */
export function updateOutline(id: number, data: Partial<ExamOutlinePayload>) {
  return request.put<any, ExamOutline>(`/outline/${id}`, data)
}

/** 删除考试大纲(管理端) */
export function deleteOutline(id: number) {
  return request.delete<any, void>(`/outline/${id}`)
}
