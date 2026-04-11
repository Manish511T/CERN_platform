import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { setCredentials } from '../../../store/slices/authSlice'
import { setDutyStatus }  from '../../../store/slices/dutySlice'
import { registerApi }    from '../services/authApi'
import socket             from '../../../socket/socket'

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'volunteer',
  })
  const [loading,  setLoading]  = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const handleChange = (e) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await registerApi(form)
      const { user, accessToken } = data.data

      dispatch(setCredentials({ user, accessToken }))
      dispatch(setDutyStatus(false))

      socket.auth = { token: accessToken }
      socket.connect()

      toast.success('Welcome to CERN Volunteer Network!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    w-full px-4 py-2.5 rounded-xl border border-slate-200
    text-sm focus:outline-none focus:ring-2 focus:ring-green-500
    focus:border-transparent
  `

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white
                    to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-green-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join as Volunteer</h1>
          <p className="text-slate-500 text-sm mt-1">
            Help save lives in your community
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100
                        shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name',     label: 'Full Name',  type: 'text',     placeholder: 'Amit Verma'         },
              { name: 'email',    label: 'Email',      type: 'email',    placeholder: 'amit@example.com'   },
              { name: 'phone',    label: 'Phone',      type: 'tel',      placeholder: '9876543210'         },
              { name: 'password', label: 'Password',   type: 'password', placeholder: 'Min. 6 characters'  },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {label}
                </label>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required={name !== 'phone'}
                  className={inputClass}
                />
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-green-600 hover:bg-green-700
                         text-white font-semibold rounded-xl transition-colors
                         disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
              )}
              Register as Volunteer
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already registered?{' '}
            <Link to="/login"
              className="text-green-600 font-medium hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage