import { useState } from 'react'
import { motion }   from 'framer-motion'
import { Mail, Lock, GitBranch, Eye, EyeOff } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast           from 'react-hot-toast'
import { setCredentials } from '../../../store/slices/authSlice'
import api    from '../../../services/api'
import socket from '../../../socket/socket'

const LoginPage = () => {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/auth/login', form)
      const { user, accessToken } = data.data

      if (user.role !== 'branch_admin') {
        setError('Access denied. Branch Admin credentials required.')
        setLoading(false)
        return
      }

      dispatch(setCredentials({ user, accessToken }))
      socket.auth = { token: accessToken }
      socket.connect()

      toast.success(`Welcome, ${user.name.split(' ')[0]}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900
                    to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-teal-500 rounded-2xl shadow-lg mb-4">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Branch Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            CERN Branch Management Portal
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="branchadmin@cern.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                             focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                             focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white
                         font-semibold rounded-xl transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2">
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
              )}
              Sign in to Branch Portal
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Branch Admin access only. Contact Super Admin for credentials.
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage