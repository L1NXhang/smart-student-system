import api from './index'

export function getScholarshipApplications(params) {
  return api.get('/scholarship/applications', { params })
}

export function applyScholarship(data) {
  return api.post('/scholarship/applications', data)
}

export function getWorkStudyPositions(params) {
  return api.get('/work-study/positions', { params })
}

export function getWorkStudyPosition(id) {
  return api.get(`/work-study/positions/${id}`)
}

export function applyWorkStudy(data) {
  return api.post('/work-study/applications', data)
}

export function getMyWorkStudyApplications() {
  return api.get('/work-study/applications')
}
