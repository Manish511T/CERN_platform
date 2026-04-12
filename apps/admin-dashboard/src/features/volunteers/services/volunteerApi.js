import api from '../../../services/api'

export const getVolunteersApi   = (params = '') =>
  api.get(`/user?role=volunteer${params}`)
export const getOnlineVolunteersApi = () =>
  api.get('/user/volunteers/online')
export const getVolunteerStatsApi = (userId) =>
  api.get(`/user/${userId}/stats`)
export const deactivateUserApi  = (userId) =>
  api.patch(`/user/${userId}/deactivate`)
export const reactivateUserApi  = (userId) =>
  api.patch(`/user/${userId}/reactivate`)