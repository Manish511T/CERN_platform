import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react'
import { Button, Input, Card } from '../../../shared/components/ui'
import useLogin from '../hooks/useLogin'

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const { handleLogin, loading, error } = useLogin()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleLogin(form)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to CERN</h1>
          <p className="text-slate-500 text-sm mt-1">
            Community Emergency Response Network
          </p>
        </div>

        <Card padding="xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
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

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 rounded-xl p-3"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              size="full"
              loading={loading}
              disabled={loading}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          In case of emergency, call{' '}
          <a href="tel:112" className="font-semibold text-red-500">112</a>
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage