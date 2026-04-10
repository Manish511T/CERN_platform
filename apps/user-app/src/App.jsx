import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials, setLoading } from './store/slices/authSlice'
import api from './services/api'

import ProtectedRoute from './router/ProtectedRoute'
import PublicRoute    from './router/PublicRoute'

// Pages — lazy loaded for performance
import { lazy, Suspense } from 'react'
import Spinner from './shared/components/ui/Spinner'

const LoginPage    = lazy(() => import('./features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'))
const Dashboard    = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const SOSPage      = lazy(() => import('./features/sos/pages/SOSPage'))
const ProfilePage  = lazy(() => import('./features/profile/pages/ProfilePage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Spinner size="lg" />
  </div>
)

const App = () => {
  const dispatch = useDispatch()

  // On app start — try to restore session via refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh')
        const newToken = data.data.accessToken

        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` },
        })

        dispatch(setCredentials({
          user:        meRes.data.data.user,
          accessToken: newToken,
        }))
      } catch {
        // No valid session — user needs to login
        dispatch(setLoading(false))
      }
    }

    restoreSession()
  }, [dispatch])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes — redirect to dashboard if logged in */}
        <Route element={<PublicRoute redirectTo="/dashboard" />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sos"       element={<SOSPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
        </Route>

        {/* Default */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App