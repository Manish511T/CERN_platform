import api from '../../../services/api'

export const getActiveSOSApi  = () => api.get('/sos/active')