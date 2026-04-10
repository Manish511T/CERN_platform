import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerApi } from '../services/authApi'
import useAuth from '../../../shared/hooks/useAuth'

const useRegister = () => {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handleRegister = async (formData) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await registerApi(formData)
      login(data.data.user, data.data.accessToken)
      toast.success('Account created successfully!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { handleRegister, loading, error }
}

export default useRegister