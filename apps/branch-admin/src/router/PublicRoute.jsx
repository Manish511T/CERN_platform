import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectIsAuth, selectIsLoading } from '../store/slices/authSlice'

const PublicRoute = ({ redirectTo = '/dashboard' }) => {
  const isAuth    = useSelector(selectIsAuth)
  const isLoading = useSelector(selectIsLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    )
  }
  return isAuth ? <Navigate to={redirectTo} replace /> : <Outlet />
}

export default PublicRoute