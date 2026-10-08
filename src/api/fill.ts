import axios from 'axios'
import router from '@/router'

/**
 * 志愿填报子页面专用请求实例。
 * 与全局 request 的区别: 失败不弹 ElMessage, 由页面用参考系统的 Notify 样式展示错误。
 */
const http = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const userId = localStorage.getItem('userId')
  if (userId) config.headers['X-User-Id'] = userId
  return config
})

http.interceptors.response.use(
  response => {
    if (response.config.responseType === 'blob') return response
    const res = response.data
    if (res && res.code === 0) return res.data
    return Promise.reject(new Error(res?.message || '请求失败'))
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    const msg = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

/* ======================== 数据结构 ======================== */

export interface ProbabilityParams {
  upperBound: number
  lowerBound: number
  minMarkProbability: number
  avgMarkProbability: number
}

export interface FillHeader {
  aspirationCode: string
  studentName: string
  gender: number
  genderText: string
  province: string
  year: number
  batch: string
  groupName: string
  subjectType: string
  artsOrScience: string
  firstSubject: string
  secondSubjects: string
  subjectsDisplay: string
  score: number
  bonusScore: number | null
  rank: number | null
  sameCount: number | null
  aspirationName: string
  highSchool: string
  contactPhone: string
  ethnicity: string
  isFresh: number | null
  chineseScore: number | null
  mathScore: number | null
  englishScore: number | null
  elective1Score: number | null
  elective2Score: number | null
  elective3Score: number | null
  heightCm: number | string | null
  weightKg: number | string | null
  leftVision: string
  rightVision: string
  colorBlind: number | null
  colorWeakness: number | null
  parentName: string
  fatherJob: string
  motherJob: string
  submitStatus: number
  upperParam: number
  lowerParam: number
  selectedCount: number
  recommendCount: number
  upperLimit: number
  controlScore: number | null
  probabilityParams: ProbabilityParams
}

export interface MajorHistory {
  RecruitMajorID: string | null
  Year: number
  EquivalentYear: number
  Plan: number | null
  AvgMark: number | null
  MinMark: number | null
  EquivalentAvgMark: number | null
  EquivalentMinMark: number | null
  AvgMarkRank: number | null
  MinMarkRank: number | null
  AvgMarkPercentile: number | null
  MinMarkPercentile: number | null
}

/** 招生专业行(与参考系统 MajorTemplate 字段同名) */
export interface MajorRow {
  uabID: string
  UnvCode: string
  UnvName: string
  UnvShortName: string
  MapUrl: string
  BaikeUrl: string
  CharterUrl: string
  ToolTipText: string
  NewName: string
  HasMasterUnit: boolean
  HasDoctorUnit: boolean
  CanRecommend: boolean
  HotUrl: string
  Year: number
  Batch: string
  ArtsOrScience: string
  Province: string
  City: string
  UnvRank: number | string | null
  UnvAttributes: string[]
  UnvNature: string
  UnvType: string
  RecruitMajorID: string
  RecruitMajorCode: string
  MajorName: string
  MajorPlan: number | null
  SchoolLength: string | number | null
  Tuition: string | number | null
  TuitionText: string
  MajorDirection: string
  RecruitPlanExplain: string
  MajorGrade: string | null
  MajorRank: number | string | null
  RequiredSubjects: string[]
  ElectiveSubjects: string[]
  MajorCodes: string[]
  UnvFirstTimeAdmission: boolean
  MajorAttendtionType: string
  PreAvgMark: number | null
  PreMinMark: number | null
  PreAvgMarkRank: number | null
  PreMinMarkRank: number | null
  PreAvgPercentile: number | null
  PreMinPercentile: number | null
  RecruitProbability: number
  Probability: string
  MajorHistorys: MajorHistory[]
  IsNew?: boolean
  SortNo?: number
}

export interface OneClickInfo {
  province: string
  selectedCount: number
  upperLimit: number
  max: number
  init: number
  recommendCount: number
}

export type UnivGroupKey = 'province' | 'unv_type' | 'unv_attribute' | 'unv_nature'

export interface UnivFilter {
  options: Record<UnivGroupKey, string[]>
  excluded: Record<UnivGroupKey, string[]>
}

export interface OtherFilter {
  presetKeywords: string[]
  schoolLength: number
  tuitionMin: number | null
  tuitionMax: number | null
  includeUnknownTuition: boolean
  presetInclude: string[]
  presetExclude: string[]
  customInclude: string
  customExclude: string
}

export interface MajorFilterItem {
  id: number
  majorCode: string
  majorName: string
  disciplineCode: string
  discipline: string
  categoryCode: string
  category: string
}

export interface DictOption { code: string; name: string; categoryCode?: string }

export interface HistoryRow {
  Year: number
  Batch: string
  ArtsOrScience: string
  GroupCode?: string
  UnvCode?: string
  UnvName: string
  RecruitMajorCode?: string
  MajorName?: string
  FirstSubject?: string
  SecondSubjects?: string
  Plan: number | null
  AvgMark: number | null
  MinMark: number | null
  AvgMarkPercentile: number | null
  MinMarkPercentile: number | null
  AvgMarkRank: number | null
  MinMarkRank: number | null
}

export interface UnvDetail {
  info: {
    UnvName: string
    UnvCode: string
    Year: number
    Province: string
    Batch: string
    ArtsOrScience: string
    PreAvgMark: number | null
    PreMinMark: number | null
    PreAvgMarkRank: number | null
    PreMinMarkRank: number | null
    PreAvgPercentile: number | null
    PreMinPercentile: number | null
  }
  tracked: HistoryRow[]
  all: HistoryRow[]
  majors: {
    RecruitMajorID: string
    RecruitMajorCode: string
    MajorName: string
    FirstSubject: string
    SecondSubjects: string
    MajorPlan: number | null
    PredictMethod: string
    PreAvgMark: number | null
    PreMinMark: number | null
    PreAvgPercentile: number | null
    PreMinPercentile: number | null
  }[]
}

export interface MajorDetail { info: MajorRow; histories: HistoryRow[] }

export interface MajorMappingRow {
  MajorCode: string
  MajorName: string
  Level: string
  DisciplineCode: string
  DisciplineName: string
}

export interface ReportData {
  header: FillHeader
  ranking: { score: number; sameCount: number; cumulative: number }[]
  majors: MajorRow[]
}

/* ======================== 接口 ======================== */

const base = (code: string) => `/aspiration/fill/${code}`

export const fillApi = {
  header: (code: string) => http.get(`${base(code)}/header`) as Promise<FillHeader>,

  recommend: (code: string, upperParam: number, lowerParam: number) =>
    http.post(`${base(code)}/recommend`, { upperParam, lowerParam }) as Promise<{ recordCount: number; lowMark: number; highMark: number }>,
  recommendList: (code: string, page: number, size: number) =>
    http.get(`${base(code)}/recommend`, { params: { page, size } }) as Promise<{ total: number; page: number; size: number; list: MajorRow[] }>,

  searchUnv: (code: string, body: { unvName?: string; majorName?: string; city?: string; maxMark?: number | null }) =>
    http.post(`${base(code)}/search/unv`, body) as Promise<MajorRow[]>,
  searchDebut: (code: string, body: { unvName?: string; majorName?: string; city?: string }) =>
    http.post(`${base(code)}/search/debut`, body) as Promise<MajorRow[]>,

  selected: (code: string) => http.get(`${base(code)}/selected`) as Promise<MajorRow[]>,
  addSelected: (code: string, rid: string) =>
    http.post(`${base(code)}/selected`, { rid }) as Promise<{ selectedCount: number }>,
  removeSelected: (code: string, rid: string) =>
    http.post(`${base(code)}/selected/remove`, { rid }) as Promise<{ selectedCount: number }>,
  removeAll: (code: string) => http.post(`${base(code)}/selected/remove-all`) as Promise<unknown>,
  clearNew: (code: string) => http.post(`${base(code)}/selected/clear-new`) as Promise<unknown>,
  saveOrder: (code: string, rids: string[]) => http.put(`${base(code)}/selected/order`, { rids }) as Promise<unknown>,
  autoOrder: (code: string, method: number) =>
    http.post(`${base(code)}/selected/auto-order`, { method }) as Promise<string[]>,

  oneClickInfo: (code: string) => http.get(`${base(code)}/one-click`) as Promise<OneClickInfo>,
  oneClick: (code: string, count: number) =>
    http.post(`${base(code)}/one-click`, { count }) as Promise<{ added: number; selectedCount: number }>,

  univFilter: (code: string) => http.get(`${base(code)}/filter/unv`) as Promise<UnivFilter>,
  saveUnivFilter: (code: string, excluded: Record<UnivGroupKey, string[]>) =>
    http.put(`${base(code)}/filter/unv`, excluded) as Promise<unknown>,
  otherFilter: (code: string) => http.get(`${base(code)}/filter/other`) as Promise<OtherFilter>,
  saveOtherFilter: (code: string, body: Omit<OtherFilter, 'presetKeywords'>) =>
    http.put(`${base(code)}/filter/other`, body) as Promise<unknown>,
  majorFilter: (code: string) => http.get(`${base(code)}/filter/major`) as Promise<MajorFilterItem[]>,
  addMajorFilter: (code: string, majorIds: number[]) =>
    http.post(`${base(code)}/filter/major`, { majorIds }) as Promise<unknown>,
  removeMajorFilter: (code: string, majorIds: number[]) =>
    http.post(`${base(code)}/filter/major/remove`, { majorIds }) as Promise<unknown>,
  clearMajorFilter: (code: string) => http.post(`${base(code)}/filter/major/clear`) as Promise<unknown>,

  dictOptions: () =>
    http.get('/aspiration/fill-dict/options') as Promise<{ categories: DictOption[]; disciplines: DictOption[] }>,
  dictMajors: (params: { category?: string; discipline?: string; name?: string }) =>
    http.get('/aspiration/fill-dict/majors', { params }) as Promise<{ overflow: boolean; list: MajorFilterItem[] }>,

  unvDetail: (code: string, uabId: string) =>
    http.get(`${base(code)}/unv-detail`, { params: { uabId } }) as Promise<UnvDetail>,
  majorDetail: (code: string, rid: string) =>
    http.get(`${base(code)}/major-detail`, { params: { rid } }) as Promise<MajorDetail>,
  majorMapping: (code: string, rid: string) =>
    http.get(`${base(code)}/major-mapping`, { params: { rid } }) as Promise<MajorMappingRow[]>,
  report: (code: string) => http.get(`${base(code)}/report`) as Promise<ReportData>,

  /** 导出 Excel 志愿单, rids 为空导出全部 */
  async export(code: string, rids?: string[]) {
    const resp = await http.post(`${base(code)}/export`, { rids: rids ?? [] }, { responseType: 'blob' })
    const blob = (resp as unknown as { data: Blob; headers: Record<string, string> })
    const cd = blob.headers['content-disposition'] || ''
    const m = /filename\*=UTF-8''([^;]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd)
    const fileName = m ? decodeURIComponent(m[1]) : '志愿单.xlsx'
    const url = URL.createObjectURL(blob.data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
}
