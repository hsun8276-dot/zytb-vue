import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  realName: string
  nickname: string
  avatar: string
  role: string
  phone: string
  email: string
  gender: number
  signature: string
}

// 用户状态管理
export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  // 角色在登录时写入 localStorage，刷新页面后 userInfo 需要重新拉取，角色从这里恢复
  const role = ref<string>(localStorage.getItem('role') || '')

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    if (info.role) {
      role.value = info.role
      localStorage.setItem('role', info.role)
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    role.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('role')
  }

  // 登录后拉取完整用户信息（含头像/昵称/签名等，刷新页面也能恢复）
  const fetchUserInfo = async (getUserDetail: (userId: number) => Promise<any>) => {
    const id = localStorage.getItem('userId')
    if (!id) return
    try {
      const detail = await getUserDetail(Number(id))
      userInfo.value = { ...detail, role: userInfo.value?.role || role.value || undefined } as UserInfo
    } catch {
      /* 忽略 */
    }
  }

  return { token, userInfo, role, setToken, setUserInfo, fetchUserInfo, logout }
})
