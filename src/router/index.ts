import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/ForgotPassword.vue') },
  // 学生端
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    children: [
      { path: '', redirect: '/student/dashboard' },
      { path: 'dashboard', name: 'StudentDashboard', component: () => import('@/views/student/Dashboard.vue') },
      { path: 'colleges', name: 'StudentColleges', component: () => import('@/views/student/Colleges.vue') },
      { path: 'score', name: 'StudentScore', component: () => import('@/views/student/ScoreQuery.vue') },
      { path: 'aspiration', name: 'StudentAspiration', component: () => import('@/views/student/Aspiration.vue') },
      { path: 'recommend', name: 'StudentRecommend', component: () => import('@/views/student/Recommend.vue') },
      { path: 'profile', name: 'StudentProfile', component: () => import('@/views/student/Profile.vue') }
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
