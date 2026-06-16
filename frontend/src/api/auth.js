import api from './index'

export function login(username, password) {
  return api.post('/auth/login', { username, password })
}

export function register(data) {
  return api.post('/auth/register', data)
}

export function getMe() {
  return api.get('/auth/me')
}

export function changePassword(oldPassword, newPassword) {
  return api.put('/auth/password', { oldPassword, newPassword })
}
