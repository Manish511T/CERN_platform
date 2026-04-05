import { verifyAccessToken } from '../utils/token.utils.js'
import User from '../modules/auth/auth.model.js'

const socketMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers?.authorization?.split(' ')[1]

    if (!token) return next(new Error('Authentication required'))

    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id).select('-password')

    if (!user || !user.isActive) return next(new Error('User not found or deactivated'))

    socket.user = user
    next()
  } catch {
    next(new Error('Invalid token'))
  }
}

export default socketMiddleware