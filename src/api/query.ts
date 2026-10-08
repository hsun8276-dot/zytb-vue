import request from '@/utils/request'
import type { UnvDetail, MajorDetail } from '@/api/fill'

export interface RecruitUnivRow {
  uabId: string
  unvCode: string
  unvName: string
  unvProvince: string
  unvCity: string
  planTotal: number
  batch: string
  groupName: string
  subjectType: string
  year: number
  examProvince: string
}

export interface RecruitMajorRow {
  recruitMajorId: string
  recruitMajorCode: string
  majorName: string
  schoolLength: number | null
  tuition: number | string | null
  majorPlan: number | null
  requiredSubjects: string
  majorRank: number | null
  majorGrade: string
  planExplain: string
}

export interface RecruitUnivQuery {
  province?: string
  year?: number
  batch?: string
  groupName?: string
  unvProvince?: string
  unvCity?: string
  unvName?: string
  majorName?: string
  page?: number
  size?: number
}

export async function getRecruitUnivPage(params: RecruitUnivQuery) {
  const r = await request.get('/aspiration/query/recruit/univs', { params }) as {
    records: RecruitUnivRow[]
    total: number
    pages?: number
  }
  return { records: r.records || [], total: Number(r.total || 0), pages: Number(r.pages || 0) }
}

export function getRecruitUnivMajors(uabId: string, keyword?: string) {
  return request.get(`/aspiration/query/recruit/univs/${encodeURIComponent(uabId)}/majors`, {
    params: { keyword: keyword || undefined }
  }) as Promise<RecruitMajorRow[]>
}

export function getQueryUnvDetail(uabId: string) {
  return request.get('/aspiration/query/recruit/unv-detail', { params: { uabId } }) as Promise<UnvDetail>
}

export function getQueryMajorDetail(rid: string) {
  return request.get('/aspiration/query/recruit/major-detail', { params: { rid } }) as Promise<MajorDetail>
}

/* ---------- 历年省控线 ---------- */

export interface ControlLineRow {
  province: string
  year: number
  batch: string
  groupName: string
  score: number
}

export function getControlLineProvinces() {
  return request.get('/aspiration/query/control-line/provinces') as Promise<string[]>
}

export function getControlLineYears(province: string) {
  return request.get('/aspiration/query/control-line/years', { params: { province } }) as Promise<number[]>
}

export async function getControlLinePage(params: {
  province: string
  year: number
  page?: number
  size?: number
}) {
  const r = await request.get('/aspiration/query/control-line/list', { params }) as {
    records: ControlLineRow[]
    total: number
  }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/* ---------- 一分一档表 ---------- */

export interface ScoreRankingRow {
  province: string
  year: number
  tableType: string
  groupName: string
  score: number
  sameCount: number
  cumulative: number
}

export function getScoreRankingProvinces() {
  return request.get('/aspiration/query/score-ranking/provinces') as Promise<string[]>
}

export function getScoreRankingYears(province: string) {
  return request.get('/aspiration/query/score-ranking/years', { params: { province } }) as Promise<number[]>
}

export function getScoreRankingGroups(province: string, year: number) {
  return request.get('/aspiration/query/score-ranking/groups', { params: { province, year } }) as Promise<string[]>
}

export async function getScoreRankingPage(params: {
  province: string
  year: number
  groupName: string
  tableType?: string
  page?: number
  size?: number
}) {
  const r = await request.get('/aspiration/query/score-ranking/list', { params }) as {
    records: ScoreRankingRow[]
    total: number
  }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 导出一分一档 Excel(blob 下载) */
export async function exportScoreRanking(params: {
  province: string
  year: number
  groupName: string
  tableType?: string
}) {
  const axios = (await import('axios')).default
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  const resp = await axios.get('/api/aspiration/query/score-ranking/export', {
    params,
    responseType: 'blob',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'X-User-Id': userId || ''
    }
  })
  const cd = resp.headers['content-disposition'] || ''
  const m = /filename\*=UTF-8''([^;]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd)
  const fileName = m ? decodeURIComponent(m[1]) : '一分一档表.xlsx'
  const url = URL.createObjectURL(resp.data)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
