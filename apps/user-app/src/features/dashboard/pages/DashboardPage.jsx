import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Clock, CheckCircle, Phone } from 'lucide-react'

import { selectUser } from '../../../store/slices/authSlice'
import { Button, Card, Badge } from '../../../shared/components/ui'
import PageWrapper from '../../../shared/components/layout/PageWrapper'
import useAuth from '../../../shared/hooks/useAuth'

const DashboardPage = () => {
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Greeting function
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">{greeting()}</p>
          <h1 className="text-xl font-bold text-slate-900">
            {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" dot>
            {user?.role === 'user' ? 'Member' : user?.role?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Emergency SOS Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card
          padding="lg"
          className="bg-linear-to-br from-red-500 to-red-600 border-none text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-lg">Emergency SOS</h2>
              <p className="text-red-100 text-sm">
                Tap for immediate help
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="full"
            onClick={() => navigate('/sos')}
            className="bg-white text-red-600 hover:bg-red-50 border-none font-semibold"
          >
            Trigger SOS Alert
          </Button>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <Card padding="md" className="text-center">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">60</p>
          <p className="text-xs text-slate-500">Golden minutes</p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">24/7</p>
          <p className="text-xs text-slate-500">Response network</p>
        </Card>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
          Emergency Contacts
        </h3>

        <Card padding="none" className="divide-y divide-slate-50">
          {[
            { name: 'National Emergency', number: '112', color: 'text-red-600' },
            { name: 'Ambulance', number: '108', color: 'text-blue-600' },
            { name: 'Police', number: '100', color: 'text-slate-700' },
          ].map(({ name, number, color }) => (
            <a
              key={number}
              href={`tel:${number}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {name}
                </span>
              </div>

              <span className={`text-base font-bold ${color}`}>
                {number}
              </span>
            </a>
          ))}
        </Card>
      </motion.div>

      {/* Logout */}
      <div className="mt-6">
        <Button variant="ghost" size="full" onClick={logout}>
          Sign out
        </Button>
      </div>
    </PageWrapper>
  )
}

export default DashboardPage