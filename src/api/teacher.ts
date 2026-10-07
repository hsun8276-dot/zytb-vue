import request, { listOf } from '@/utils/request'
import type { Question, Video, Paper, OcrTask, OcrQuestion, FinishTaskRequest } from './student'

/** ====== 题目管理 ====== */

/** 全部题目列表（老师端，含答案） */
export async function getAllQuestions(params?: {
  categoryId?: number
  subjectId?: number
  type?: number
  difficulty?: number
  status?: number
} & { page?: number; size?: number }): Promise<{ records: Question[]; total: number }> {
  const r = await request.get('/question/list', { params: { ...params, all: true } }) as { records: Question[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 新建题目 */
export async function createQuestion(data: Partial<Question>): Promise<Question> {
  return request.post('/question', data) as Promise<Question>
}

/** 更新题目 */
export async function updateQuestion(id: number, data: Partial<Question>): Promise<Question> {
  return request.put(`/question/${id}`, data) as Promise<Question>
}

/** 删除题目 */
export async function deleteQuestion(id: number): Promise<void> {
  return request.delete(`/question/${id}`) as Promise<void>
}

/** 审核题目 */
export async function auditQuestion(id: number, status: number): Promise<void> {
  return request.put(`/question/${id}/status`, null, { params: { status } }) as Promise<void>
}

/** 获取所有题目（用于选题组卷） */
export async function getQuestionSelectList(params?: {
  title?: string
  subjectId?: number
  type?: number
  difficulty?: number
} & { page?: number; size?: number }): Promise<{ records: Question[]; total: number }> {
  const r = await request.get('/question/list', { params: { ...params, all: true } }) as { records: Question[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** ====== 试卷管理 ====== */

/** 全部试卷列表（老师端） */
export async function getAllPapers(params?: {
  categoryId?: number
  type?: number
  status?: number
} & { page?: number; size?: number }): Promise<{ records: Paper[]; total: number }> {
  const r = await request.get('/exam/paper/list', { params: { ...params, all: true } }) as { records: Paper[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 新建试卷 */
export async function createPaper(data: Partial<Paper>): Promise<Paper> {
  return request.post('/exam/paper', data) as Promise<Paper>
}

/** 更新试卷 */
export async function updatePaper(id: number, data: Partial<Paper>): Promise<Paper> {
  return request.put(`/exam/paper/${id}`, data) as Promise<Paper>
}

/** 删除试卷 */
export async function deletePaper(id: number): Promise<void> {
  return request.delete(`/exam/paper/${id}`) as Promise<void>
}

/** 试卷详情 */
export async function getPaperDetail(id: number): Promise<Paper> {
  return request.get(`/exam/paper/${id}`) as Promise<Paper>
}

/** 试卷题目列表(服务端分页) */
export async function getPaperQuestions(paperId: number, page = 1, size = 20): Promise<{ records: any[]; total: number }> {
  const r = await request.get(`/exam/paper/${paperId}/questions`, { params: { page, size } }) as { records: any[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 添加题目到试卷 */
export async function addQuestionToPaper(paperId: number, questionId: number, score: number, sort: number): Promise<void> {
  return request.post(`/exam/paper/${paperId}/question`, null, { params: { questionId, score, sort } }) as Promise<void>
}

/** 修改试卷中题目的分值和顺序 */
export async function updatePaperQuestion(paperId: number, pqId: number, score: number, sort: number): Promise<void> {
  return request.put(`/exam/paper/${paperId}/question/${pqId}`, null, { params: { score, sort } }) as Promise<void>
}

/** 从试卷移除题目 */
export async function removeQuestionFromPaper(paperId: number, pqId: number): Promise<void> {
  return request.delete(`/exam/paper/${paperId}/question/${pqId}`) as Promise<void>
}

/** ====== 视频管理 ====== */

/** 全部视频列表（老师端） */
export async function getAllVideos(params?: {
  subjectId?: number
  type?: number
  status?: number
} & { page?: number; size?: number }): Promise<{ records: Video[]; total: number }> {
  const r = await request.get('/video/list', { params: { ...params, all: true } }) as { records: Video[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 新建视频 */
export async function createVideo(data: Partial<Video>): Promise<Video> {
  return request.post('/video', data) as Promise<Video>
}

/** 更新视频 */
export async function updateVideo(id: number, data: Partial<Video>): Promise<Video> {
  return request.put(`/video/${id}`, data) as Promise<Video>
}

/** 删除视频 */
export async function deleteVideo(id: number): Promise<void> {
  return request.delete(`/video/${id}`) as Promise<void>
}

/** 上传视频/封面文件到 MinIO */
export async function uploadFile(file: File, type: 'video' | 'cover'): Promise<{ url: string; name: string; size: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  return request.post('/video/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) as Promise<any>
}

/** ====== 学生管理 ====== */

/** 学生列表（仅学生角色, 服务端分页+关键字） */
export async function getStudentList(params?: { keyword?: string; page?: number; size?: number }): Promise<{ records: any[]; total: number }> {
  const r = await request.get('/user/list/students', { params }) as { records: any[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 开通学生账号（老师端） */
export async function createStudentAccount(data: {
  phone: string
  password: string
  realName?: string
  role?: string
  categoryId?: number
}): Promise<void> {
  return request.post('/user/create', { ...data, role: data.role || 'student' }) as Promise<void>
}

/** ====== 教师工作台 ====== */

/** 教师工作台统计数据 */
export async function getTeacherStats(): Promise<{
  classCount: number
  classStudentCount: number
  avgClassScore: number
  classExerciseCount: number
  classWrongCount: number
  recentRecords: any[]
  classWrongStats: any[]
}> {
  return request.get('/statistics/teacher') as Promise<any>
}

/** ====== 考试批改 ====== */

/** 考试记录列表（按试卷/班级筛选, 服务端分页） */
export async function getExamGradeRecords(params?: { paperId?: number; classId?: number; page?: number; size?: number }): Promise<{ records: any[]; total: number }> {
  const r = await request.get('/exam/grade/records', { params }) as { records: any[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 考试记录详情（含答案列表） */
export async function getExamGradeRecordDetail(recordId: number): Promise<any> {
  return request.get(`/exam/grade/record/${recordId}`) as Promise<any>
}

/** 批改主观题 */
export async function gradeAnswer(answerId: number, score: number, comment?: string): Promise<void> {
  return request.put(`/exam/grade/answer/${answerId}`, null, { params: { score, comment } }) as Promise<void>
}

/** ====== OCR 导入 ====== */

/** 上传图片并触发OCR识别 */
export async function ocrUploadImage(file: File, title?: string): Promise<OcrTask> {
  const formData = new FormData()
  formData.append('file', file)
  if (title) formData.append('title', title)
  return request.post('/ocr/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }) as Promise<OcrTask>
}

/** 追加图片到已有任务 */
export async function ocrAppendImage(taskId: number, file: File): Promise<OcrTask> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/ocr/${taskId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }) as Promise<OcrTask>
}

/** 获取OCR任务列表(服务端分页) */
export async function getOcrTaskList(page = 1, size = 20): Promise<{ records: OcrTask[]; total: number }> {
  const r = await request.get('/ocr/task/list', { params: { page, size } }) as { records: OcrTask[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 获取任务详情 */
export async function getOcrTaskDetail(id: number): Promise<OcrTask> {
  return request.get(`/ocr/task/${id}`) as Promise<OcrTask>
}

/** 获取任务的题目列表(服务端分页) */
export async function getOcrQuestions(taskId: number, page = 1, size = 20): Promise<{ records: OcrQuestion[]; total: number }> {
  const r = await request.get(`/ocr/task/${taskId}/questions`, { params: { page, size } }) as { records: OcrQuestion[]; total: number }
  return { records: r.records || [], total: Number(r.total || 0) }
}

/** 更新单题 */
export async function updateOcrQuestion(id: number, data: Partial<OcrQuestion>): Promise<OcrQuestion> {
  return request.put(`/ocr/question/${id}`, data) as Promise<OcrQuestion>
}

/** 重新解析原始文本 */
export async function reparseOcrText(taskId: number): Promise<OcrQuestion[]> {
  return listOf<OcrQuestion>(await request.post(`/ocr/task/${taskId}/reparse`))
}

/** 确认单题并保存到题库 */
export async function confirmOcrQuestion(id: number): Promise<OcrQuestion> {
  return request.post(`/ocr/question/${id}/confirm`) as Promise<OcrQuestion>
}

/** 完成导入：批量确认并创建试卷 */
export async function finishOcrTask(taskId: number, data: FinishTaskRequest): Promise<{ paperId: number; questionCount: number; failedCount: number; taskId: number }> {
  return request.post(`/ocr/task/${taskId}/finish`, data) as Promise<any>
}

/** 删除OCR任务（取消导入时清空未确认的暂存题目） */
export async function deleteOcrTask(taskId: number): Promise<void> {
  return request.delete(`/ocr/task/${taskId}`) as Promise<void>
}