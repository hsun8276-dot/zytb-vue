import request from '@/utils/request'

/** 志愿方案行(学生管理列表) */
export interface AspirationRow {
  id: number
  aspirationCode: string
  studentName: string
  gender: number
  genderText: string
  province: string
  year: number
  batch: string
  groupName: string
  score: number
  bonusScore: number
  firstSubject: string
  subjectsDisplay: string
  aspirationName: string
  highSchool: string
  contactPhone: string
  upperParam: number
  lowerParam: number
  submitStatus: number
  submitter: string
  submitTime: string | null
  createTime: string
  /* 采集扩展段(详情弹窗) */
  ethnicity?: string
  isFresh?: number
  chineseScore?: number | null
  mathScore?: number | null
  englishScore?: number | null
  elective1Score?: number | null
  elective2Score?: number | null
  elective3Score?: number | null
  heightCm?: number | string | null
  weightKg?: number | string | null
  colorBlind?: number
  colorWeakness?: number
  leftVision?: string
  rightVision?: string
  parentName?: string
  fatherJob?: string
  motherJob?: string
}

/** 创建方案入参: 学生核心信息(创建后不可改) */
export interface CreateAspirationParam {
  studentName: string
  gender: number
  province?: string
  year?: number
  batch?: string
  score: number
  bonusScore?: number
  firstSubject: '物理' | '历史'
  secondSubjects: string[]
  aspirationName?: string
  highSchool?: string
  contactPhone?: string
}

/** 方案分页列表(填报师看自己创建的, 管理员看全部) */
export async function getAspirationPage(params: { page?: number; size?: number; keyword?: string; submitStatus?: number }) {
  const r = await request.get('/aspiration/list', { params }) as { records: AspirationRow[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 创建方案(添加学生) */
export function createAspiration(data: CreateAspirationParam) {
  return request.post('/aspiration/create', data) as Promise<{ aspirationCode: string }>
}

/** 方案详情(学生详细信息) */
export function getAspirationDetail(code: string) {
  return request.get(`/aspiration/${code}`) as Promise<AspirationRow>
}

/** 编辑志愿信息段(志愿名称/就读高中/联系电话), 已交单锁定 */
export function updateAspirationInfo(code: string, data: { aspirationName?: string; highSchool?: string; contactPhone?: string }) {
  return request.put(`/aspiration/${code}`, data) as Promise<void>
}

/** 修改推荐滑杆参数(向上/向下分数) */
export function updateAspirationSlider(code: string, upperParam: number, lowerParam: number) {
  return request.put(`/aspiration/${code}/slider`, null, { params: { upperParam, lowerParam } }) as Promise<void>
}

/** 交单(1)/撤销交单(0) */
export function submitAspiration(code: string, status: 0 | 1) {
  return request.put(`/aspiration/${code}/submit`, null, { params: { status } }) as Promise<void>
}

/** 删除方案(逻辑删) */
export function deleteAspiration(code: string) {
  return request.delete(`/aspiration/${code}`) as Promise<void>
}
