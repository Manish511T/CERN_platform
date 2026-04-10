import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginApi } from '../services/authApi'
import useAuth from '../../../shared/hooks/useAuth'

const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handleLogin = async ({ email, password }) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await loginApi({ email, password })
      login(data.data.user, data.data.accessToken)
      toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, loading, error }
}

export default useLogin