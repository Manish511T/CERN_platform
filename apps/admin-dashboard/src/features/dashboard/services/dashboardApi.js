import api from '../../../services/api'

export const getStatsApi          = () => api.get('/user?limit=1')
export const getActiveSOSApi      = () => api.get('/sos/active')
export const getAllBranchesApi     = () => api.get('/branch')
export const getOnlineVolunteersApi = () => api.get('/user/volunteers/online')
export const getNotificationStatsApi = () => api.get('/notification/stats')