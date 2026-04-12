import api from '../../../services/api'

export const getUsersApi      = (params = '') => api.get(`/user?role=user${params}`)
export const deactivateUserApi = (userId) => api.patch(`/user/${userId}/deactivate`)
export const reactivateUserApi = (userId) => api.patch(`/user/${userId}/reactivate`)