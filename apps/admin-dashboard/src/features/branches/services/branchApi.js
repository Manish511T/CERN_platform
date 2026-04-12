import api from '../../../services/api'

export const getBranchesApi       = () => api.get('/branch')
export const createBranchApi      = (data) => api.post('/branch', data)
export const updateBranchApi      = (id, data) => api.patch(`/branch/${id}`, data)
export const deleteBranchApi      = (id) => api.delete(`/branch/${id}`)
export const assignAdminApi       = (branchId, userId) =>
  api.post(`/branch/${branchId}/assign-admin`, { userId })
export const getBranchVolunteersApi = (branchId) =>
  api.get(`/branch/${branchId}/volunteers`)
export const manageVolunteerApi   = (branchId, volunteerId, action) =>
  api.post(`/branch/${branchId}/volunteers`, { volunteerId, action })