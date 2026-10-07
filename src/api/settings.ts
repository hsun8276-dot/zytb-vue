import request from '@/utils/request'

/** 获取所有系统配置 */
export async function getSystemConfig(): Promise<Record<string, string>> {
  return request.get('/config/all') as Promise<Record<string, string>>
}

/** 保存系统配置（批量） */
export async function saveSystemConfig(config: Record<string, string>): Promise<void> {
  return request.put('/config/save', config) as Promise<void>
}
/** ====== AI提示词管理 ====== */
export interface AiPrompt {
  id: number
  scene: string
  name: string
  content: string
  version: number
  remark: string
  deleted: number
  createTime: string
  updateTime: string
}
export async function getPromptList(): Promise<AiPrompt[]> {
  return request.get('/ai/prompt/list') as Promise<AiPrompt[]>
}
export async function getPromptHistory(scene: string): Promise<AiPrompt[]> {
  return request.get('/ai/prompt/history', { params: { scene } }) as Promise<AiPrompt[]>
}
export async function savePrompt(body: { scene: string; name?: string; content: string; remark?: string }): Promise<AiPrompt> {
  return request.post('/ai/prompt/save', body) as Promise<AiPrompt>
}
