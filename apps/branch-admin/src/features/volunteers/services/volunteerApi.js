import api from '../../../services/api'

// Get volunteers in current branch admin's branch
export const getBranchVolunteersApi = (branchId) =>
  api.get(`/branch/${branchId}/volunteers`)

export const manageVolunteerApi = (branchId, volunteerId, action) =>
  api.post(`/branch/${branchId}/volunteers`, { volunteerId, action })

export const deactivateUserApi = (userId) =>
  api.patch(`/user/${userId}/deactivate`)

export const reactivateUserApi = (userId) =>
  api.patch(`/user/${userId}/reactivate`)

export const getVolunteerStatsApi = (userId) =>
  api.get(`/user/${userId}/stats`)