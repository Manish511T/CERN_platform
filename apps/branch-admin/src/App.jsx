import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate }   from 'react-router-dom'
import { useDispatch }               from 'react-redux'
import { setCredentials, setLoading } from './store/slices/authSlice'
import api            from './services/api'
import ProtectedRoute from './router/ProtectedRoute'
import PublicRoute    from './router/PublicRoute'

const LoginPage      = lazy(() => import('./features/auth/pages/LoginPage'))
const DashboardPage  = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const VolunteersPage = lazy(() => import('./features/volunteers/pages/VolunteersPage'))
const SOSMonitorPage = lazy(() => import('./features/sos/pages/SOSMonitorPage'))

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent
                    rounded-full animate-spin" />
  </div>
)

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const restore = async () => {
      try {
        const { data: r } = await api.post('/auth/refresh')
        const token = r.data.accessToken
        const { data: m } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = m.data.user

        // Only allow branch_admin role
        if (user.role !== 'branch_admin') {
          dispatch(setLoading(false))
          return
        }

        dispatch(setCredentials({ user, accessToken: token }))
      } catch {
        dispatch(setLoading(false))
      }
    }
    restore()
  }, [dispatch])

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<PublicRoute redirectTo="/dashboard" />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/sos"        element={<SOSMonitorPage />} />
        </Route>

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App