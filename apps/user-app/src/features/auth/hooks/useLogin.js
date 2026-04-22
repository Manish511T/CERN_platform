import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginApi } from '../services/authApi'
import useAuth from '../../../shared/hooks/useAuth'

const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await loginApi({ email, password })
      const { user, accessToken } = response.data.data

      // ✅ RBAC: restrict non-user roles
      if (user.role !== 'user') {
        toast.error('Please use the correct app for your role.')
        return
      }

      // ✅ Save auth state
      login(user, accessToken)

      // ✅ Safe name handling
      const firstName = user?.name?.split(' ')[0] || 'User'

      toast.success(`Welcome back, ${firstName}!`)

      // ✅ Redirect
      navigate('/dashboard', { replace: true })

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please try again.'

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, loading, error }
}

export default useLogin