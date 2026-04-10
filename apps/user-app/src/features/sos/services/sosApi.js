import api from '../../../services/api'

export const triggerSOSApi = (formData) =>
  api.post('/sos/trigger', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const acceptSOSApi = (sosId) =>
  api.patch(`/sos/accept/${sosId}`)

export const updateSOSStatusApi = (sosId, status) =>
  api.patch(`/sos/status/${sosId}`, { status })

export const getSOSHistoryApi = (page = 1, limit = 20) =>
  api.get(`/sos/history?page=${page}&limit=${limit}`)

export const updateLocationApi = (latitude, longitude) =>
  api.post('/auth/location', { latitude, longitude })