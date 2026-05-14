import api from './index'

export function getStudentInfo() {
  return api.get('/student/info')
}

export function updateStudentInfo(data) {
  return api.put('/student/info', data)
}

export function uploadPhoto(formData) {
  return api.put('/student/info/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function submitInfoChange(data) {
  return api.post('/student/info-change', data)
}

export function batchSubmitInfoChange(data) {
  return api.post('/student/info-change/batch', data)
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
