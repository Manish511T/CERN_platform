import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectIsAuth, selectIsLoading } from '../store/slices/authSlice'

// Redirects logged-in users away from login/register pages

const PublicRoute = ({ redirectTo = '/dashboard' }) => {
  const isAuth    = useSelector(selectIsAuth)
  const isLoading = useSelector(selectIsLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    )
  }

  return isAuth ? <Navigate to={redirectTo} replace /> : <Outlet />
}

export default PublicRoute