import api from '../../../services/api'

export const loginApi    = (creds) => api.post('/auth/login', creds)
export const registerApi = (data)  => api.post('/auth/register', data)
export const toggleDutyApi = ()    => api.patch('/auth/duty')
export const updateLocationApi = (lat, lng) =>
  api.post('/auth/location', { latitude: lat, longitude: lng })