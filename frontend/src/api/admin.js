import api from './index'

export function getDashboardStats() {
  return api.get('/admin/dashboard/stats')
}

export function importStudentsFile(formData) {
  return api.post('/admin/students/import-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
}

// ── Students ────────────────────────────────────
export function getStudentList(params) {
  return api.get('/admin/students', { params })
}

export function getStudentDetail(id) {
  return api.get(`/admin/students/${id}`)
}

export function auditStudent(id, data) {
  return api.put(`/admin/students/${id}/audit`, data)
}

export function setStudentDepartment(id, data) {
  return api.put(`/admin/students/${id}/department`, data)
}

export function getDepartments() {
  return api.get('/admin/departments')
}

// ── Info Change ──────────────────────────────────
export function getInfoChangeRequests(params) {
  return api.get('/admin/info-change', { params })
}

export function auditInfoChangeRequest(id, data) {
  return api.put(`/admin/info-change/${id}`, data)
}

// ── Difficulty ──────────────────────────────────
export function getDifficultyApplications(params) {
  return api.get('/admin/difficulty-applications', { params })
}

export function auditDifficultyApplication(id, data) {
  return api.put(`/admin/difficulty-applications/${id}`, data)
}

// ── Scholarship ──────────────────────────────────
export function getScholarshipApplications(params) {
  return api.get('/admin/scholarship-applications', { params })
}

export function auditScholarshipApplication(id, data) {
  return api.put(`/admin/scholarship-applications/${id}`, data)
}

export function getGrantApplications(params) {
  return api.get('/admin/grant-applications', { params })
}

export function auditGrantApplication(id, data) {
  return api.put(`/admin/grant-applications/${id}`, data)
}

// ── Work Study ──────────────────────────────────
export function getWorkStudyPositions() {
  return api.get('/admin/work-study/positions')
}

export function createWorkStudyPosition(data) {
  return api.post('/admin/work-study/positions', data)
}

export function updateWorkStudyPosition(id, data) {
  return api.put(`/admin/work-study/positions/${id}`, data)
}

export function getWorkStudyApplications(params) {
  return api.get('/admin/work-study/applications', { params })
}

export function auditWorkStudyApplication(id, data) {
  return api.put(`/admin/work-study/applications/${id}`, data)
}

// ── Academic ────────────────────────────────────
export function importGrades(formData) {
  return api.post('/admin/grades/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
}

export function getMidtermEvaluations(params) {
  return api.get('/admin/midterm-evaluations', { params })
}

export function auditMidtermEvaluation(id, data) {
  return api.put(`/admin/midterm-evaluations/${id}`, data)
}

export function getAwards(params) {
  return api.get('/admin/awards', { params })
}

export function auditAward(id, data) {
  return api.put(`/admin/awards/${id}`, data)
}

// ── Career ──────────────────────────────────────
export function getCareerAppointments(params) {
  return api.get('/admin/career-appointments', { params })
}

export function confirmAppointment(id, data) {
  return api.put(`/admin/career-appointments/${id}`, data)
}

export function createJobInfo(data) {
  return api.post('/admin/job-infos', data)
}

export function updateJobInfo(id, data) {
  return api.put(`/admin/job-infos/${id}`, data)
}

export function deleteJobInfo(id) {
  return api.delete(`/admin/job-infos/${id}`)
}
