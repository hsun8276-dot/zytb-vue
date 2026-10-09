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
}) {
  const r = await request.get('/college/admin/page', { params }) as {
    records: AdminCollegeRow[]
    total: number
  }
  return { records: r.records || [], total: Number(r.total || 0) }
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
