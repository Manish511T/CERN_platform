import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginApi } from '../services/authApi'
import useAuth from '../../../shared/hooks/useAuth'

const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  const handleLogin = async ({ email, password }) => {
    // ✅ Basic validation (fast fail)
    if (!email || !password) {
      const msg = 'Email and password are required'
      setError(msg)
      toast.error(msg)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await loginApi({ email, password })
      const { user, accessToken } = response.data.data

      // ✅ RBAC check
      if (user.role !== 'user') {
        throw new Error('Please use the correct app for your role.')
      }

      // ✅ Save auth
      login(user, accessToken)

      const firstName = user?.name?.split(' ')[0] || 'User'

      toast.success(`Welcome back, ${firstName}!`)

      navigate('/dashboard', { replace: true })

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.'

      if (isMounted.current) {
        setError(message)
        toast.error(message)
      }

    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }

  return { handleLogin, loading, error }
}

export default useLogin