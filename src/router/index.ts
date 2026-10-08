import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/ForgotPassword.vue') },
  // 志愿填报子页面(独立全屏, 复刻参考系统 AspMng.aspx)
  { path: '/fill/:code', name: 'AspirationFill', component: () => import('@/views/fill/AspirationFill.vue') },
  // 填报师端
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    children: [
      { path: '', redirect: '/student/dashboard' },
      { path: 'dashboard', name: 'StudentDashboard', component: () => import('@/views/student/Dashboard.vue') },
      // 志愿填报
      { path: 'aspiration/plan', name: 'StudentAspirationPlan', component: () => import('@/views/student/AspirationPlan.vue'), meta: { title: '填报方案' } },
      { path: 'aspiration/list', name: 'StudentAspirationList', component: () => import('@/views/student/UnderConstruction.vue'), meta: { title: '志愿表管理' } },
      // 前台交单
      { path: 'submit/aspiration', name: 'StudentSubmitAspiration', component: () => import('@/views/student/SubmitAspiration.vue'), meta: { title: '志愿交单（3+1+2）' } },
      { path: 'submit/records', redirect: '/student/submit/aspiration' },
      // 综合查询
      { path: 'query/recruit', name: 'StudentQueryRecruit', component: () => import('@/views/student/QueryRecruit.vue'), meta: { title: '招生信息（3+1+2）' } },
      { path: 'query/control-line', name: 'StudentQueryControlLine', component: () => import('@/views/student/QueryControlLine.vue'), meta: { title: '历年省控线查询' } },
      { path: 'query/rank', name: 'StudentQueryRank', component: () => import('@/views/student/QueryScoreRanking.vue'), meta: { title: '一分一档表查询' } },
      { path: 'query/tools', name: 'StudentQueryTools', component: () => import('@/views/student/UnderConstruction.vue'), meta: { title: '综合查询工具' } },
      { path: 'query/early', name: 'StudentQueryEarly', component: () => import('@/views/student/UnderConstruction.vue'), meta: { title: '提前批查询系统' } },
      { path: 'query/college', redirect: '/student/query/recruit' },
      { path: 'query/major', redirect: '/student/query/recruit' },
      { path: 'query/score-line', redirect: '/student/query/control-line' },
      // 个人信息维护
      { path: 'profile', name: 'StudentProfile', component: () => import('@/views/student/UnderConstruction.vue'), meta: { title: '基本资料' } },
      { path: 'password', name: 'StudentPassword', component: () => import('@/views/student/UnderConstruction.vue'), meta: { title: '修改密码' } }
    ]
  },
  // 教师端
  {
    path: '/teacher',
    component: () => import('@/layouts/TeacherLayout.vue'),
    children: [
      { path: '', redirect: '/teacher/dashboard' },
      { path: 'dashboard', name: 'TeacherDashboard', component: () => import('@/views/teacher/Dashboard.vue') },
      { path: 'students', name: 'TeacherStudents', component: () => import('@/views/teacher/Students.vue') },
      { path: 'aspirations', name: 'TeacherAspirations', component: () => import('@/views/teacher/Aspirations.vue') }
    ]
  },
  // 管理端
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/Users.vue') },
      { path: 'colleges', name: 'AdminColleges', component: () => import('@/views/admin/Colleges.vue') },
      { path: 'settings', name: 'AdminSettings', component: () => import('@/views/admin/Settings.vue') }
    ]
  },
  // 根路径按角色跳转
  { path: '/', redirect: () => {
      const role = localStorage.getItem('role')
      if (role === 'admin') return '/admin'
      if (role === 'teacher') return '/teacher'
      return '/student'
    } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫: 未登录去 /login
router.beforeEach(to => {
  const token = localStorage.getItem('token')
  if (to.path === '/login' || to.path === '/forgot-password') {
    if (token) {
      const role = localStorage.getItem('role')
      return role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student'
    }
    return true
  }
  if (!token) return '/login'
  return true
})

export default router
