import api from '../../../services/api'

export const acceptSOSApi  = (sosId) => api.patch(`/sos/accept/${sosId}`)
export const getHistoryApi = (page = 1) => api.get(`/sos/history?page=${page}&limit=20`)