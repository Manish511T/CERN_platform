import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Heart } from 'lucide-react'
import { Button, Input, Card } from '../../../shared/components/ui'
import useRegister from '../hooks/useRegister'

const RegisterPage = () => {
  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
    phone:    '',
    role:     'user',
  })
  const [showPass, setShowPass] = useState(false)
  const { handleRegister, loading, error } = useRegister()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleRegister(form)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-50
                    flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join CERN</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create your emergency response account
          </p>
        </div>

        <Card padding="xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Create account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              icon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Password"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              icon={<Lock className="w-4 h-4" />}
              required
              hint="At least 6 characters"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              }
            />

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                I am registering as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'user',      label: 'User',      desc: 'Need help' },
                  { value: 'volunteer', label: 'Volunteer', desc: 'Provide help' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: value }))}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all duration-200
                      ${form.role === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                      }
                    `}
                  >
                    <div className={`text-sm font-medium ${
                      form.role === value ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 rounded-xl p-3"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <Button type="submit" size="full" loading={loading} className="mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterPage