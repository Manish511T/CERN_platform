import api from '../../../services/api'

export const loginApi    = (creds) => api.post('/auth/login', creds)
export const getMeApi    = ()       => api.get('/auth/me')