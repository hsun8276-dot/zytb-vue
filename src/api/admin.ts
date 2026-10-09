import request from '@/utils/request'

export interface AdminOverview {
  users: {
    total: number
    fillerTotal: number
    fillerActive: number
    fillerExpired: number
    fillerDisabled: number
  }
  data: {
    collegeCount: number
    majorDictCount: number
    recruitMajorCount: number
    aspirationCount: number
    scoreLineYearCount: number
    scoreLineYears: number[]
  }
}

export function getAdminOverview() {
  return request.get('/user/admin/overview') as Promise<AdminOverview>
}

export interface AdminCollegeRow {
  id: number
  collegeCode: number
  collegeName: string
  province: string
  city: string
  level: string
  collegeType: string
  property: string
  department: string
  labels: string
  hasMaster: boolean
  hasDoctor: boolean
  website: string
}

export async function getAdminCollegePage(params: {
  page?: number
  size?: number
  province?: string
  city?: string
  keyword?: string
  level?: string
  collegeType?: string
  property?: string
}) {
  const r = await request.get('/college/admin/page', { params }) as {
    records: AdminCollegeRow[]
    total: number
  }
  return { records: r.records || [], total: Number(r.total || 0) }
}

export function getAdminCollegeFilters() {
  return request.get('/college/admin/filters') as Promise<{
    levels: string[]
    collegeTypes: string[]
    properties: string[]
  }>
}

export interface SysConfigItem {
  id: number
  configKey: string
  configValue: string
  remark: string
  updateTime?: string
}

export function getPublicConfig() {
  return request.get('/config/all') as Promise<Record<string, string>>
}

export function getAdminConfigList() {
  return request.get('/config/admin') as Promise<SysConfigItem[]>
}

export function saveAdminConfig(body: Record<string, string>) {
  return request.put('/config/admin', body) as Promise<void>
}

export interface AdminLogRow {
  id: number
  userId: number | null
  username: string | null
  realName: string | null
  module: string
  action: string
  requestParams: string | null
  responseData: string | null
  ip: string | null
  duration: number | null
  status: number
  createTime: string | null
}

export async function getAdminLogPage(params: {
  page?: number
  size?: number
  keyword?: string
  status?: number | ''
  module?: string
}) {
  const q: Record<string, unknown> = {
    page: params.page,
    size: params.size,
    keyword: params.keyword || undefined,
    module: params.module || undefined
  }
  if (params.status === 0 || params.status === 1) {
    q.status = params.status
  }
  const r = await request.get('/user/admin/logs', { params: q }) as {
    records: AdminLogRow[]
    total: number
  }
  return { records: r.records || [], total: Number(r.total || 0) }
}
