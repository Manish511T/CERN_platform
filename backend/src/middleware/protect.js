import { verifyAccessToken } from '../utils/token.utils.js'
import { UnauthorizedError } from '../shared/errors.js'
import asyncHandler from '../utils/asyncHandler.js'
import User from '../modules/auth/auth.model.js'

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided')
  }

  const token = authHeader.split(' ')[1]
  const decoded = verifyAccessToken(token)

  const user = await User.findById(decoded.id).select('-password')
  if (!user || !user.isActive) {
    throw new UnauthorizedError('User not found or deactivated')
  }

  req.user = user
  next()
})

export default protect