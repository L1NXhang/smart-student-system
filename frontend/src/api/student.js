import api from './index'

export function getStudentInfo() {
  return api.get('/student/info')
}

export function submitInfoChange(data) {
  return api.post('/student/info-change', data)
}

export function getInfoChangeList(params) {
  return api.get('/student/info-change', { params })
}

export function submitDifficultyApplication(formData) {
  return api.post('/student/difficulty-application', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getDifficultyStatus() {
  return api.get('/student/difficulty-application')
}
