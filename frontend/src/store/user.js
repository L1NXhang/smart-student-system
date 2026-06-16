import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/auth'
import { login as loginApi, register as registerApi, getMe, changePassword as changePasswordApi } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const user = ref(getUser())
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isDepartmentHead = computed(() => user.value?.departmentRole === 'head')
  const department = computed(() => user.value?.department)
  const isFirstLogin = computed(() => !!localStorage.getItem('smart_student_first_login'))

  async function login(username, password) {
    const res = await loginApi(username, password)
    token.value = res.data.token
    user.value = res.data.user
    setToken(res.data.token)
    setUser(res.data.user)
    if (res.data.user?.passwordChanged === false || res.data.user?.firstLogin) {
      localStorage.setItem('smart_student_first_login', '1')
      return { ...res.data.user, needChangePassword: true }
    }
    localStorage.removeItem('smart_student_first_login')
    return res.data.user
  }

  async function register(data) {
    return await registerApi(data)
  }

  async function fetchUser() {
    const res = await getMe()
    user.value = res.data
    setUser(res.data)
    return res.data
  }

  async function changePassword(oldPassword, newPassword) {
    return await changePasswordApi(oldPassword || user.value?.password || '123456', newPassword)
  }

  function logout() {
    token.value = null
    user.value = null
    removeToken()
    removeUser()
    localStorage.removeItem('smart_student_first_login')
  }

  return { token, user, isLoggedIn, isAdmin, isDepartmentHead, department, isFirstLogin, login, register, fetchUser, changePassword, logout }
})
