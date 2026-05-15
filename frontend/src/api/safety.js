import api from './index'

export function submitLateReturn(data) {
  return api.post('/safety/late-return', data)
}

export function getLateReturnRecords() {
  return api.get('/safety/late-return')
}

export function cancelLateReturn(id) {
  return api.put(`/safety/late-return/${id}/cancel`)
}

export function submitLeave(data) {
  return api.post('/safety/leave', data)
}

export function getLeaveRecords() {
  return api.get('/safety/leave')
}

export function cancelLeave(id) {
  return api.put(`/safety/leave/${id}/cancel`)
}

export function getExams() {
  return api.get('/safety/exams')
}

export function getExamQuestions(id) {
  return api.get(`/safety/exams/${id}/questions`)
}

export function submitExam(id, answers) {
  return api.post(`/safety/exams/${id}/submit`, { answers })
}

export function getExamRecord(id) {
  return api.get(`/safety/exams/${id}/record`)
}

export function reportIncident(data) {
  return api.post('/safety/incidents', data)
}

export function getIncidents() {
  return api.get('/safety/incidents')
}

export function importExamQuestions(examId, formData) {
  return api.post(`/safety/admin/exams/${examId}/questions/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
}
