import request from '@/utils/request'

export interface CollegeListItem {
  collegeCode: number
  collegeName: string
}

export interface CollegeDetail {
  collegeCode: number
  collegeName: string
  collegeProvince: string
  collegeCity: string
  collegeAdmin: string
  collegeLevel: string
  collegeType: string
  collegeProperty: string
  collegeImg: string
  collegeLabels: string[]
  website: string
  recruitWebsite: string
  email: string
  phone: string[]
  address: string
  collegeInfo: string
  accommodation: string
  advantage: string
  recruitRule: string
  teachers: string
  scholarship: string
  transferMajor: string
  famousAlumni: string
  partnerEnterprise: string
  collegeTime: string
  keyLab: string
  vrAddress: string
  baiduBaike: string
  studentTeacherRatio: string
  doubleFirstClass: string
  extraPic: string
  hasMaster: boolean
  hasDoctor: boolean
  canRecommend?: boolean
  ranks?: { rankName: string; rankValue: string; year?: number }[]
  reports?: { newsName: string; newsUrl: string; title: string }[]
  graduates?: {
    year: number
    graduationNum?: number | null
    num?: number | null
    masterNum?: number | null
    home?: number | null
    abroad?: number | null
    masterRate?: string
  }[]
  estimates?: { level: string; majors: string }[]
}

export interface CollegeMajorGroup {
  category: string
  majors: string[]
  majorText: string
}

export interface MajorDictItem {
  majorCode: string
  majorName: string
  firstDiscipline: string
  category: string
}

export interface MajorCollegeItem {
  collegeCode: number
  collegeName: string
  province: string
  city: string
}

export function getCollegeProvinces() {
  return request.get('/college/search/provinces') as Promise<string[]>
}

export function getCollegeCities(province: string) {
  return request.get('/college/search/cities', { params: { province } }) as Promise<string[]>
}

export function searchColleges(params: { province?: string; city?: string; name?: string }) {
  return request.get('/college/search/colleges', { params }) as Promise<CollegeListItem[]>
}

export function getCollegeDetail(code: number) {
  return request.get(`/college/detail/${code}`) as Promise<CollegeDetail>
}

export function getCollegeMajors(code: number) {
  return request.get(`/college/detail/${code}/majors`) as Promise<CollegeMajorGroup[]>
}

export function getMajorCategories() {
  return request.get('/college/majors/categories') as Promise<string[]>
}

export function getMajorDisciplines(category: string) {
  return request.get('/college/majors/disciplines', { params: { category } }) as Promise<string[]>
}

export function searchMajorDict(params: {
  category?: string
  discipline?: string
  keyword?: string
}) {
  return request.get('/college/majors/dict', { params }) as Promise<MajorDictItem[]>
}

export function searchMajorNames(keyword: string) {
  return request.get('/college/majors/names', { params: { keyword } }) as Promise<string[]>
}

export function getCollegesByMajor(majorName: string) {
  return request.get('/college/majors/colleges', { params: { majorName } }) as Promise<MajorCollegeItem[]>
}

export interface MajorLevelItem {
  id: number
  name: string
}

export interface MajorTreeGroup {
  name: string
  code: string
}

export interface MajorTreeCategory {
  category: string
  groups: MajorTreeGroup[]
}

export interface MajorGroupDetail {
  groupCode: string
  majorGroup: string
  category: string
  level: number | null
  majors: { majorCode: string; majorName: string }[]
}

export function getMajorLevels() {
  return request.get('/college/majors/levels') as Promise<MajorLevelItem[]>
}

export function getMajorTree(level: number) {
  return request.get('/college/majors/tree', { params: { level } }) as Promise<MajorTreeCategory[]>
}

export function getMajorsByGroup(code: string) {
  return request.get('/college/majors/group', { params: { code } }) as Promise<MajorGroupDetail>
}

export interface ProfessionListItem {
  occId: number
  occName: string
  industry: string
  occType: string
  positionSalary: string
}

export interface ProfessionDetail extends ProfessionListItem {
  definition: string
  occIntroduction: string
  jobRequire: string
  occTrait: string
  developmentSpace: string
  workContact: string
}

export interface ProfessionMajorItem {
  majorCode: string
  majorName: string
  bachelor: string
  duration: string
}

export function getProfessionIndustries() {
  return request.get('/college/professions/industries') as Promise<string[]>
}

export function getProfessionTypes(industry: string) {
  return request.get('/college/professions/types', { params: { industry } }) as Promise<string[]>
}

export function searchProfessions(params: {
  industry?: string
  occType?: string
  occName?: string
}) {
  return request.get('/college/professions/search', { params }) as Promise<ProfessionListItem[]>
}

export function getProfessionDetail(occId: number) {
  return request.get(`/college/professions/${occId}`) as Promise<ProfessionDetail>
}

export function getProfessionMajors(occId: number) {
  return request.get(`/college/professions/${occId}/majors`) as Promise<ProfessionMajorItem[]>
}
