import request, { listOf } from '@/utils/request'

/** 题目 */
export interface Question {
  id: number
  categoryId: number
  subjectId: number
  type: number
  difficulty: number
  content: string
  options: string | null
  answer: string | null
  analysis: string | null
  source: number
  /** 0待审核 1已发布 2已下架 */
  status: number
  createTime: string
}

/** 筛选参数 */
export interface QuestionFilter {
  categoryId?: number
  subjectId?: number
  type?: number
  difficulty?: number
  source?: number
}

/** 提交答案 */
export interface SubmitResult {
  isCorrect: boolean
  correctAnswer: string
  analysis: string
  score: number
}

/** 题目列表(服务端分页) */
export async function getQuestionList(filter: QuestionFilter & { page?: number; size?: number }): Promise<{ records: Question[]; total: number }> {
  const r = await request.get('/question/list', { params: { ...filter } }) as { records: Question[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 题目详情 */
export async function getQuestionDetail(id: number): Promise<Question> {
  return request.get(`/question/${id}`) as Promise<Question>
}

/** 提交答案 */
export async function submitAnswer(questionId: number, answer: string): Promise<SubmitResult> {
  return request.post('/question/submit', null, {
    params: { questionId, answer }
  }) as Promise<SubmitResult>
}

/** 学习统计 */
export interface StudyStats {
  todayCount: number
  todayCorrectRate: number
  weekCount: number
  wrongCount: number
  streakDays: number
}

/** 学习统计（默认查询当前登录用户；传入 studentId 时查询指定学生，需老师或管理员） */
export async function getStudyStats(studentId?: number): Promise<StudyStats> {
  return request.get('/statistics/student', {
    params: studentId !== undefined ? { studentId } : undefined
  }) as Promise<StudyStats>
}

/** 错题本 */
export interface WrongBookItem {
  id: number
  questionId: number
  wrongAnswer: string
  errorType: number
  reviewCount: number
  isMastered: number
  questionContent: string
  questionType: number
  difficulty: number
  options: string
  analysis: string
  categoryId: number
  subjectId: number
  lastReviewTime: string | null
}

export interface WrongBookStats {
  total: number
  pending: number
  masteredRate: number
}

/** 错题统计 */
export async function getWrongBookStats(): Promise<WrongBookStats> {
  return request.get('/wrong-book/stats') as Promise<WrongBookStats>
}

/** 错题列表(服务端分页+科目筛选) */
export async function getWrongBookList(params?: { page?: number; size?: number; subjectId?: number }): Promise<{ records: WrongBookItem[]; total: number }> {
  const r = await request.get('/wrong-book/list', {
    params: { page: params?.page ?? 1, size: params?.size ?? 20, subjectId: params?.subjectId }
  }) as { records: WrongBookItem[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 标记已掌握 */
export async function markMastered(id: number): Promise<void> {
  return request.post(`/wrong-book/mastered/${id}`) as Promise<void>
}

/** 复习错题 */
export async function reviewWrongBook(id: number): Promise<void> {
  return request.post(`/wrong-book/review/${id}`) as Promise<void>
}

/** 试卷 */
export interface Paper {
  id: number
  categoryId: number
  subjectId: number
  title: string
  description: string
  totalScore: number
  duration: number
  questionCount: number
  difficulty: number
  type: number
  status: number
}

/** 开始考试返回 */
export interface ExamStartResult {
  recordId: number
  paper: Paper
  questions: ExamQuestion[]
  duration: number
}

/** 考试题目 */
export interface ExamQuestion {
  pqId: number
  score: number
  id: number
  type: number
  content: string
  options: string
  difficulty: number
}

/** 试卷列表(服务端分页) */
export async function getPaperList(categoryId?: number, type?: number, status?: number, all?: boolean, page = 1, size = 20): Promise<{ records: Paper[]; total: number }> {
  const r = await request.get('/exam/paper/list', { params: { categoryId, type, status, all, page, size } }) as { records: Paper[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 开始考试 */
export async function startExam(paperId: number): Promise<ExamStartResult> {
  return request.post(`/exam/start/${paperId}`) as Promise<ExamStartResult>
}

/** 提交试卷 */
export async function submitExam(recordId: number, answers: { questionId: number; answer: string }[]): Promise<{ totalScore: number; objectiveScore: number; subjectiveScore: number }> {
  return request.post(`/exam/submit/${recordId}`, answers) as Promise<{ totalScore: number; objectiveScore: number; subjectiveScore: number }>
}

/** 考试记录列表 */
export interface ExamRecord {
  id: number
  paperId: number
  paperTitle: string
  totalScore: number
  objectiveScore: number
  subjectiveScore: number
  status: number
  startTime: string
  submitTime: string
  duration: number
  createTime: string
  classRank: number
  categoryRank: number
}

export async function getExamRecords(page = 1, size = 20): Promise<{ records: ExamRecord[]; total: number }> {
  const r = await request.get('/exam/record/list', { params: { page, size } }) as { records: ExamRecord[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 视频 */
export interface Video {
  id: number
  title: string
  chapter?: string
  description: string
  categoryId: number
  subjectId: number
  videoUrl: string
  coverUrl: string
  duration: number
  /** 文件大小（字节） */
  size?: number
  type: number
  viewCount: number
  playCount: number
  createTime: string
}

/** 视频列表(服务端分页) */
export async function getVideoList(categoryId?: number, subjectId?: number, type?: number, status?: number, all?: boolean, page = 1, size = 20): Promise<{ records: Video[]; total: number }> {
  const r = await request.get('/video/list', { params: { categoryId, subjectId, type, status, all, page, size } }) as { records: Video[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 视频详情 */
export async function getVideoDetail(id: number): Promise<Video> {
  return request.get(`/video/${id}`) as Promise<Video>
}

/** 视频进度 */
export interface VideoProgress {
  id: number
  studentId: number
  videoId: number
  watchDuration: number
  progress: number
  lastPosition: number
  completed: number
}

/** 更新视频进度 */
export async function updateVideoProgress(videoId: number, progress: number, watchDuration?: number, lastPosition?: number): Promise<VideoProgress> {
  return request.post('/video/progress', null, { params: { videoId, progress, watchDuration, lastPosition } }) as Promise<VideoProgress>
}

/** 获取单个视频进度 */
export async function getVideoProgress(videoId: number): Promise<VideoProgress> {
  return request.get(`/video/progress/${videoId}`) as Promise<VideoProgress>
}

/** 获取所有视频进度 */
export async function listVideoProgress(): Promise<{ progress: VideoProgress; videoTitle: string; videoDuration: number }[]> {
  return listOf(await request.get('/video/progress/list', { params: { page: 1, size: 1000 } }))
}

/** 通知消息 */
export interface Notification {
  id: number
  senderId: number
  receiverId: number
  type: number
  title: string
  content: string
  isRead: number
  readTime: string | null
  createTime: string
}

/** 通知列表(服务端分页) */
export async function getNotificationList(page = 1, size = 20): Promise<{ records: Notification[]; total: number }> {
  const r = await request.get('/notification/list', { params: { page, size } }) as { records: Notification[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 未读数量 */
export async function getNotificationUnreadCount(): Promise<number> {
  return request.get('/notification/unread-count') as Promise<number>
}

/** 标记已读 */
export async function markNotificationRead(id: number): Promise<void> {
  return request.put(`/notification/read/${id}`) as Promise<void>
}

/** 全部标记已读 */
export async function markAllNotificationsRead(): Promise<void> {
  return request.put('/notification/read-all') as Promise<void>
}

/** 发布通知（老师端：支持单个学生或全班发送） */
export async function sendNotification(params: {
  receiverIds?: number[]
  classId?: number
  type: number
  title: string
  content: string
}): Promise<number> {
  return request.post('/notification/send', null, { params }) as Promise<number>
}

/** 学习报告 */
export interface StudyReport {
  totalExercises: number
  totalCorrectRate: number
  totalWrong: number
  totalWatchSeconds: number
  daily: {
    reportDate: string
    exerciseCount: number
    correctCount: number
    wrongCount: number
    studyDuration: number
    newWrongCount: number
    masteredCount: number
  }[]
  subjectDist: { name: string; value: number }[]
  subjectAccuracy: { name: string; accuracy: number }[]
  weekTrend: { date: string; count: number; correct: number }[]
  /** 视频趋势（近7天） */
  videoTrend: { date: string; videoCount: number; watchSeconds: number }[]
  /** 最近考试记录 */
  recentExams: {
    id: number
    paperId: number
    paperTitle: string
    totalScore: number
    objectiveScore: number
    subjectiveScore: number
    status: number
    startTime: string
    submitTime: string
  }[]
  /** 考试平均分 */
  avgExamScore: number
  /** 考试次数 */
  examCount: number
  /** 视频学习数量 */
  videoCount: number
  /** 视频完成数量 */
  videoCompleted: number
}

export async function getStudyReport(): Promise<StudyReport> {
  return request.get('/report/student') as Promise<StudyReport>
}

/** 用户更新 */
export interface UserUpdate {
  realName?: string
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  gender?: number
  signature?: string
}

/** 更新个人信息 */
export async function updateProfile(data: UserUpdate): Promise<void> {
  return request.put('/user/profile', data) as Promise<void>
}

/** 上传头像 */
export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) as Promise<string>
}

/** 修改密码 */
export async function updatePassword(oldPassword: string, newPassword: string): Promise<void> {
  return request.put('/user/password', { oldPassword, newPassword }) as Promise<void>
}

/** 获取用户详细信息 */
export async function getUserDetail(userId: number): Promise<{
  id: number
  username: string
  realName: string
  phone: string
  avatar: string
  gender: number
  status: number
}> {
  return request.get('/user/detail', { params: { userId } }) as Promise<any>
}

/** 考试类/科目 */
export interface Category {
  id: number
  name: string
  code: string
}

export interface Subject {
  id: number
  name: string
  code: string
  type: number
}

/** 考生考试类 */
export async function getStudentCategory(): Promise<Category> {
  return request.get('/student/category') as Promise<Category>
}

/** 科目列表 */
export async function getSubjectList(): Promise<Subject[]> {
  return listOf<Subject>(await request.get('/student/subjects'))
}

/** ====== AI 智能服务 ====== */

/** AI 判题记录 */
export interface AiJudgmentRow {
  id: number
  questionId: number
  studentId: number
  studentAnswer: string | null
  aiAnswer: string | null
  aiScore: number | null
  aiComment: string | null
  confidence: number | null
  modelVersion: string | null
  createTime: string
}

/** AI 学习总结 */
export interface AiSummaryRow {
  id: number
  studentId: number
  summaryType: number
  periodStart: string
  periodEnd: string
  content: string
  status: number
  createTime: string
}

/** AI 薄弱点 */
export interface AiWeaknessRow {
  id: number
  subjectId: number
  subjectName: string
  weaknessScore: number
  correctRate: number
  totalCount: number
  suggestedExercises: string | null
  updateTime: string
}

/** AI 推荐 */
export interface AiRecommendationRow {
  id: number
  studentId: number
  recommendationType: number
  schoolId: number | null
  professionId: number | null
  admissionProbability: number | null
  reason: string | null
  status: number
  createTime: string
}

/** 学习日报 */
export interface DailyReportRow {
  id: number
  reportDate: string
  exerciseCount: number
  correctCount: number
  wrongCount: number
  studyDuration: number
  newWrongCount: number
  masteredCount: number
}

/** AI 判题记录列表(服务端分页) */
export async function getAiJudgmentList(page = 1, size = 20): Promise<{ records: AiJudgmentRow[]; total: number }> {
  const r = await request.get('/ai/judgment/list', { params: { page, size } }) as { records: AiJudgmentRow[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** AI 自动判题 */
export async function aiAutoJudge(params: { questionId?: number; answer: string; correctAnswer?: string; fullScore?: number }): Promise<{ id: number; score: number; comment: string; confidence: number }> {
  return request.post('/ai/judgment/auto', null, { params }) as Promise<any>
}

/** AI 学习总结列表(服务端分页) */
export async function getAiSummaryList(page = 1, size = 20): Promise<{ records: AiSummaryRow[]; total: number }> {
  const r = await request.get('/ai/summary/list', { params: { page, size } }) as { records: AiSummaryRow[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** AI 生成学习总结 */
export async function aiGenerateSummary(summaryType?: number): Promise<AiSummaryRow> {
  return request.post('/ai/summary/generate', null, { params: { summaryType } }) as Promise<AiSummaryRow>
}

/** AI 薄弱点列表 */
export async function getAiWeaknessList(): Promise<AiWeaknessRow[]> {
  return listOf<AiWeaknessRow>(await request.get('/ai/weakness/list', { params: { page: 1, size: 1000 } }))
}

/** AI 分析薄弱点 */
export async function aiAnalyzeWeakness(): Promise<any[]> {
  return request.post('/ai/weakness/analyze', null, {}) as Promise<any[]>
}

/** AI 推荐列表 */
export async function getAiRecommendationList(): Promise<AiRecommendationRow[]> {
  return listOf<AiRecommendationRow>(await request.get('/ai/recommendation/list', { params: { page: 1, size: 1000 } }))
}

/** AI 生成推荐 */
export async function aiGenerateRecommendation(): Promise<AiRecommendationRow> {
  return request.post('/ai/recommendation/generate', null, {}) as Promise<AiRecommendationRow>
}

/** 学习日报列表 */
export async function getDailyReports(): Promise<DailyReportRow[]> {
  return listOf<DailyReportRow>(await request.get('/ai/daily-report/list', { params: { page: 1, size: 1000 } }))
}

/** ====== OCR 导入 ====== */

/** OCR 导入任务 */
export interface OcrTask {
  id: number
  teacherId: number
  title: string
  sourceYear: number | null
  categoryId: number | null
  subjectId: number | null
  difficulty: number | null
  paperType: number | null
  totalImages: number
  processedImages: number
  status: number
  rawText: string | null
  paperId: number | null
  createTime: string
  updateTime: string
}

/** OCR 导入题目（暂存题目） */
export interface OcrQuestion {
  id: number
  taskId: number
  sort: number
  type: number
  content: string
  options: string | null
  answer: string | null
  analysis: string | null
  difficulty: number | null
  score: number | null
  confirmed: number
  questionId: number | null
  createTime: string
  updateTime: string
}

/** 完成导入请求参数 */
export interface FinishTaskRequest {
  paperTitle?: string
  categoryId: number
  subjectId: number
  totalScore: number
  duration: number
  difficulty: number
  paperType: number
  sourceYear?: number
}

/** ====== 院校库 ====== */

/** 院校 */
export interface School {
  id: number
  categoryId: number
  name: string
  logo: string | null
  website: string | null
  province: string | null
  city: string | null
  /** 0公办 1民办，旧数据可能为空 */
  type: number | null
  description: string | null
  /** 院校简介(官网抓取) */
  intro: string | null
  introSource: string | null
  schoolTag: string | null
  status: number
  createTime: string
  updateTime: string | null
}

/** 院校类型文字；type 未填写时按院校标签判断，只有 private 标签是民办 */
export function schoolTypeLabel(school: { type?: number | null; schoolTag?: string | null }): '公办' | '民办' {
  if (school.type != null) return school.type === 0 ? '公办' : '民办'
  return school.schoolTag === 'private' ? '民办' : '公办'
}

/** 分组后的院校分页信息 */
export interface SchoolGroupPage {
  records: School[]
  total: number
  page: number
  size: number
}

/** 按院校标签分组的院校列表（学生端院校导航，支持分页） */
export async function getSchoolListGrouped(page = 1, size = 8): Promise<Record<string, SchoolGroupPage>> {
  return request.get('/school/list/grouped', { params: { page, size } }) as Promise<Record<string, SchoolGroupPage>>
}

/** 院校详情 */
export async function getSchoolDetail(id: number): Promise<School> {
  return request.get(`/school/${id}`) as Promise<School>
}
/** AI错题详细讲解+举一反三 */
export interface AiExplainResult {
  errorAnalysis: string
  detailedSolution: string
  knowledgePoints: string[]
  variantsJson: string
  model: string
  cached: boolean
}
export function aiExplainQuestion(questionId: number, studentAnswer?: string) {
  return request.post<any, AiExplainResult>('/ai/explain', null, {
    params: { questionId, studentAnswer: studentAnswer || undefined },
    timeout: 120000
  })
}

/** AI举一反三变式答错 → 写入错题本(快照) */
export interface AiVariantPayload {
  content: string
  options?: Record<string, string>
  answer: string
  studentAnswer: string
  analysis?: string
  knowledgePoints?: string
}
export function addAiVariantWrong(payload: AiVariantPayload) {
  return request.post('/wrong-book/ai-variant', payload) as Promise<void>
}
