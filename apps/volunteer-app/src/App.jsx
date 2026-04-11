import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials, setLoading } from './store/slices/authSlice'
import { setDutyStatus } from './store/slices/dutySlice'
import api from './services/api'
import ProtectedRoute from './router/ProtectedRoute'
import PublicRoute    from './router/PublicRoute'
import AlertListener  from './features/alerts/components/AlertListener'

const LoginPage    = lazy(() => import('./features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'))
const Dashboard    = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const AlertPage    = lazy(() => import('./features/alerts/pages/AlertPage'))
const TrackingPage = lazy(() => import('./features/tracking/pages/TrackingPage'))
const HistoryPage  = lazy(() => import('./features/history/pages/HistoryPage'))
const ProfilePage  = lazy(() => import('./features/profile/pages/ProfilePage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent
                    rounded-full animate-spin" />
  </div>
)

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: refreshData } = await api.post('/auth/refresh')
        const token = refreshData.data.accessToken

        const { data: meData } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const user = meData.data.user
        dispatch(setCredentials({ user, accessToken: token }))
        dispatch(setDutyStatus(user.isOnDuty || false))
      } catch {
        dispatch(setLoading(false))
      }
    }

    restoreSession()
  }, [dispatch])

  return (
    <Suspense fallback={<PageLoader />}>
      {/* Global SOS alert listener — always mounted when logged in */}
      <AlertListener />

      <Routes>
        <Route element={<PublicRoute redirectTo="/dashboard" />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alert"     element={<AlertPage />} />
          <Route path="/tracking"  element={<TrackingPage />} />
          <Route path="/history"   element={<HistoryPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
        </Route>

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App