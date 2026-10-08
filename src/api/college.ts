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
  hasMaster: boolean
  hasDoctor: boolean
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
