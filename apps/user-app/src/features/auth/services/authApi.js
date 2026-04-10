import api from '../../../services/api'

export const loginApi = (credentials) =>
  api.post('/auth/login', credentials)

export const registerApi = (userData) =>
  api.post('/auth/register', userData)

export const logoutApi = () =>
  api.post('/auth/logout')

export const getMeApi = () =>
  api.get('/auth/me')

export const updateLocationApi = (coords) =>
  api.post('/auth/location', coords)