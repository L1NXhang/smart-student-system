import api from './index'

export function getGrades(params) {
  return api.get('/academic/grades', { params })
}

export function getAwards() {
  return api.get('/academic/awards')
}

export function submitAward(data) {
  return api.post('/academic/awards', data)
}

export function getDisciplinary() {
  return api.get('/academic/disciplinary')
}

export function getSecondClassroom(params) {
  return api.get('/academic/second-classroom', { params })
}

export function submitMidtermEvaluation(data) {
  return api.post('/academic/midterm-evaluation', data)
}

export function getMidtermEvaluation(semester) {
  return api.get(`/academic/midterm-evaluation/${semester}`)
}
