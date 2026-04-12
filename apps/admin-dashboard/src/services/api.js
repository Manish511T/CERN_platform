import axios from 'axios'
import { API_BASE_URL } from '../shared/constants'
import { store } from '../store'
import { logout, setAccessToken } from '../store/slices/authSlice'

const api = axios.create({
  baseURL:         `${API_BASE_URL}/api`,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing    = true

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = data.data.accessToken
        store.dispatch(setAccessToken(newToken))
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        store.dispatch(logout())
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api