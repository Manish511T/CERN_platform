import User from './auth.model.js'
import { generateTokenPair, verifyRefreshToken } from '../../utils/token.utils.js'
import {
  ConflictError, UnauthorizedError, NotFoundError, ForbiddenError,
} from '../../shared/errors.js'
import { toGeoJSONPoint } from '../../utils/geo.utils.js'
import logger from '../../config/logger.js'

// ─── PUBLIC REGISTRATION (user + volunteer only) ──────────────────────────────

export const register = async ({ name, email, password, role, phone }) => {
  // Double-check role restriction at service level
  if (!['user', 'volunteer'].includes(role)) {
    throw new ForbiddenError('Public registration only allows user or volunteer roles.')
  }

  const existing = await User.findOne({ email })
  if (existing) throw new ConflictError('Email is already registered')

  const user = await User.create({ name, email, password, role, phone })

  const { accessToken, refreshToken } = generateTokenPair(user._id)
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'user_registered', userId: user._id, role: user.role })

  return { user: user.toSafeObject(), accessToken, refreshToken }
}

// ─── ADMIN CREATE USER (any role, super admin only) ───────────────────────────

export const adminCreateUser = async ({ name, email, password, role, phone, branchId }) => {
  const existing = await User.findOne({ email })
  if (existing) throw new ConflictError('Email is already registered')

  const userData = { name, email, password, role, phone }

  // If creating branch_admin with a branchId, link them
  if (branchId && role === 'branch_admin') {
    userData.branchId = branchId
  }

  const user = await User.create(userData)

  logger.info({ event: 'admin_created_user', userId: user._id, role: user.role })

  return user.toSafeObject()
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken')

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid email or password')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) throw new UnauthorizedError('Invalid email or password')

  const { accessToken, refreshToken } = generateTokenPair(user._id)
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'user_login', userId: user._id, role: user.role })

  return { user: user.toSafeObject(), accessToken, refreshToken }
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new UnauthorizedError('No refresh token provided')
  }

  const decoded = verifyRefreshToken(incomingRefreshToken)

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  const { accessToken, refreshToken: newRefreshToken } =
    generateTokenPair(user._id)

  user.refreshToken = newRefreshToken
  await user.save({ validateBeforeSave: false })

  // Return role so controller can set correct cookie name
  return { accessToken, refreshToken: newRefreshToken, role: user.role }
}
// ─── LOGOUT ───────────────────────────────────────────────────────────────────

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null })
  logger.info({ event: 'user_logout', userId })
}

// ─── GET ME ───────────────────────────────────────────────────────────────────
export const getMe = async (userId) => {
  const user = await User.findById(userId)
    .populate('branchId', 'name code radiusMeters isActive')

  if (!user) throw new NotFoundError('User')
  return user.toSafeObject()
}

// ─── TOGGLE DUTY (volunteer only) ────────────────────────────────────────────

export const toggleDuty = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new NotFoundError('User')

  user.isOnDuty = !user.isOnDuty
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'duty_toggled', userId, isOnDuty: user.isOnDuty })
  return { isOnDuty: user.isOnDuty }
}

// ─── UPDATE LOCATION ──────────────────────────────────────────────────────────

export const updateLocation = async (userId, latitude, longitude) => {
  await User.findByIdAndUpdate(userId, {
    location: toGeoJSONPoint(latitude, longitude),
  })
}

// ─── FCM TOKEN ────────────────────────────────────────────────────────────────

export const registerFCMToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, { $addToSet: { fcmTokens: token } })
}

export const removeFCMToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, { $pull: { fcmTokens: token } })
}