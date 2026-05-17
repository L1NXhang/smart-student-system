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

// ── Admin safety management ─────────────────────
export function getLateReturnList(params) {
  return api.get('/safety/admin/late-return', { params })
}

export function auditLateReturn(id, data) {
  return api.put(`/safety/admin/late-return/${id}`, data)
}

export function getLeaveList(params) {
  return api.get('/safety/admin/leave', { params })
}

export function auditLeave(id, data) {
  return api.put(`/safety/admin/leave/${id}`, data)
}

export function createExam(data) {
  return api.post('/safety/admin/exams', data)
}

export function deleteExam(id) {
  return api.delete(`/safety/admin/exams/${id}`)
}

export function createQuestion(examId, data) {
  return api.post(`/safety/admin/exams/${examId}/questions`, data)
}

export function updateQuestion(id, data) {
  return api.put(`/safety/admin/questions/${id}`, data)
}

export function deleteQuestion(id) {
  return api.delete(`/safety/admin/questions/${id}`)
}

export function getIncidentList(params) {
  return api.get('/safety/admin/incidents', { params })
}

export function handleIncident(id, data) {
  return api.put(`/safety/admin/incidents/${id}`, data)
}
