import api from './index'

export function getContacts() {
  return api.get('/chat/contacts')
}

export function getChatMessages(contactId, params) {
  return api.get(`/chat/messages/${contactId}`, { params })
}

export function uploadChatFile(formData) {
  return api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
}

export function getAnnouncements(params) {
  return api.get('/announcements', { params })
}

export function getAnnouncement(id) {
  return api.get(`/announcements/${id}`)
}

export function markAnnouncementRead(id) {
  return api.post(`/announcements/${id}/read`)
}

export function getUnreadAnnounceCount() {
  return api.get('/announcements/unread-count')
}

// Admin announcement management
export function createAnnouncement(data) {
  return api.post('/announcements', data)
}

export function updateAnnouncement(id, data) {
  return api.put(`/announcements/${id}`, data)
}

export function deleteAnnouncement(id) {
  return api.delete(`/announcements/${id}`)
}

export function submitFeedback(data) {
  return api.post('/feedbacks', data)
}

export function getMyFeedbacks() {
  return api.get('/feedbacks')
}

export function getEvents(params) {
  return api.get('/events', { params })
}

export function getEvent(id) {
  return api.get(`/events/${id}`)
}

export function registerEvent(id) {
  return api.post(`/events/${id}/register`)
}

export function cancelEvent(id) {
  return api.put(`/events/${id}/cancel`)
}

export function getMyEventRegistrations() {
  return api.get('/events/my-registrations')
}

// Admin event management
export function createEvent(data) {
  return api.post('/events', data)
}

export function updateEvent(id, data) {
  return api.put(`/events/${id}`, data)
}

export function deleteEvent(id) {
  return api.delete(`/events/${id}`)
}

export function getEventRegistrations(id) {
  return api.get(`/events/${id}/registrations`)
}
