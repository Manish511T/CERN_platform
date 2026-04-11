import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { setCredentials } from '../../../store/slices/authSlice'
import { setDutyStatus }  from '../../../store/slices/dutySlice'
import { loginApi }       from '../services/authApi'
import socket             from '../../../socket/socket'

const LoginPage = () => {
  const [form,     setForm]    = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const dispatch   = useDispatch()
  const navigate   = useNavigate()

  const handleChange = (e) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await loginApi(form)
      const { user, accessToken } = data.data

      dispatch(setCredentials({ user, accessToken }))
      dispatch(setDutyStatus(user.isOnDuty || false))

      socket.auth = { token: accessToken }
      socket.connect()

      toast.success(`Welcome, ${user.name.split(' ')[0]}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white
                    to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-green-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">CERN Volunteer</h1>
          <p className="text-slate-500 text-sm mt-1">
            Emergency Response Network
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100
                        shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Volunteer Sign in
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-4 h-4 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border
                             border-slate-200 text-sm focus:outline-none
                             focus:ring-2 focus:ring-green-500
                             focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-4 h-4 text-slate-400" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border
                             border-slate-200 text-sm focus:outline-none
                             focus:ring-2 focus:ring-green-500
                             focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600"
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-green-600 hover:bg-green-700
                         text-white font-semibold rounded-xl
                         transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
              )}
              Sign in
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New volunteer?{' '}
            <Link to="/register"
              className="text-green-600 font-medium hover:text-green-700">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage