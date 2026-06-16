import api from './index'

export function getAssessmentQuestions(type) {
  return api.get(`/career/assessments/${type}/questions`)
}

export function submitAssessment(type, answers) {
  return api.post(`/career/assessments/${type}/submit`, { answers })
}

export function getAssessmentHistory() {
  return api.get('/career/assessments')
}

export function createAppointment(data) {
  return api.post('/career/appointments', data)
}

export function getMyAppointments() {
  return api.get('/career/appointments')
}

export function cancelAppointment(id) {
  return api.put(`/career/appointments/${id}/cancel`)
}

export function getJobInfos(params) {
  return api.get('/career/job-infos', { params })
}

export function getJobInfo(id) {
  return api.get(`/career/job-infos/${id}`)
}

export function favoriteJob(id) {
  return api.post(`/career/job-infos/${id}/favorite`)
}
