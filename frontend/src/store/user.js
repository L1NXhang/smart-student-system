import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/auth'
import { login as loginApi, register as registerApi, getMe } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const user = ref(getUser())
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username, password) {
    const res = await loginApi(username, password)
    token.value = res.data.token
    user.value = res.data.user
    setToken(res.data.token)
    setUser(res.data.user)
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

  function logout() {
    token.value = null
    user.value = null
    removeToken()
    removeUser()
  }

  return { token, user, isLoggedIn, isAdmin, login, register, fetchUser, logout }
})
