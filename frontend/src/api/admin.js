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
