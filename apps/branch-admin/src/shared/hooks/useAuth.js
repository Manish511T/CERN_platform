import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  selectUser, selectIsAuth, selectIsLoading,
  setCredentials, logout as logoutAction,
} from '../../store/slices/authSlice'
import api    from '../../services/api'
import socket from '../../socket/socket'

const useAuth = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const isAuth    = useSelector(selectIsAuth)
  const isLoading = useSelector(selectIsLoading)

  const login = (userData, accessToken) => {
    dispatch(setCredentials({ user: userData, accessToken }))
    socket.auth = { token: accessToken }
    socket.connect()
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    socket.disconnect()
    dispatch(logoutAction())
    navigate('/login', { replace: true })
  }

  return { user, isAuth, isLoading, login, logout }
}

export default useAuth