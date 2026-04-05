import User from './auth.model.js'
import { generateTokenPair, verifyRefreshToken } from '../../utils/token.utils.js'
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../shared/errors.js'
import { toGeoJSONPoint } from '../../utils/geo.utils.js'
import logger from '../../config/logger.js'

// ─── REGISTER ────────────────────────────────────────────────────────────────

// export const register = async ({ name, email, password, role, phone }) => {
//   // Check duplicate email before attempting to create
//   const existing = await User.findOne({ email })
//   if (existing) throw new ConflictError('Email is already registered')

//   const user = await User.create({ name, email, password, role, phone })

//   const { accessToken, refreshToken } = generateTokenPair(user._id)

//   // Store hashed refresh token on user for rotation validation
//   user.refreshToken = refreshToken
//   await user.save({ validateBeforeSave: false })

//   logger.info({ event: 'user_registered', userId: user._id, role: user.role })

//   return { user: user.toSafeObject(), accessToken, refreshToken }
// }

export const register = async ({ name, email, password, role, phone }) => {
  try {
    console.log('1. register service called', { name, email, role })

    const existing = await User.findOne({ email })
    console.log('2. checked existing user', existing?._id)

    if (existing) throw new ConflictError('Email is already registered')

    const user = await User.create({ name, email, password, role, phone })
    console.log('3. user created', user._id)

    const { accessToken, refreshToken } = generateTokenPair(user._id)
    console.log('4. tokens generated')

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    console.log('5. refresh token saved')

    logger.info({ event: 'user_registered', userId: user._id, role: user.role })

    return { user: user.toSafeObject(), accessToken, refreshToken }
  } catch (err) {
    console.error('REGISTER ERROR:', err.message, err.stack)
    throw err
  }
}
// ─── LOGIN ───────────────────────────────────────────────────────────────────

export const login = async ({ email, password }) => {
  // Explicitly select password — it has select: false in schema
  const user = await User.findOne({ email }).select('+password +refreshToken')

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid email or password')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password')
  }

  const { accessToken, refreshToken } = generateTokenPair(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'user_login', userId: user._id, role: user.role })

  return { user: user.toSafeObject(), accessToken, refreshToken }
}

// ─── REFRESH TOKEN ───────────────────────────────────────────────────────────

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new UnauthorizedError('No refresh token provided')
  }

  // Verify signature first
  const decoded = verifyRefreshToken(incomingRefreshToken)

  // Then check it matches what we stored — prevents reuse of old tokens
  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  // Rotate: issue new pair, invalidate old refresh token
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id)

  user.refreshToken = newRefreshToken
  await user.save({ validateBeforeSave: false })

  return { accessToken, refreshToken: newRefreshToken }
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null })
  logger.info({ event: 'user_logout', userId })
}

// ─── GET CURRENT USER ────────────────────────────────────────────────────────

export const getMe = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new NotFoundError('User')
  return user.toSafeObject()
}

// ─── TOGGLE DUTY ─────────────────────────────────────────────────────────────

export const toggleDuty = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new NotFoundError('User')

  user.isOnDuty = !user.isOnDuty
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'duty_toggled', userId, isOnDuty: user.isOnDuty })

  return { isOnDuty: user.isOnDuty }
}

// ─── UPDATE LOCATION ─────────────────────────────────────────────────────────

export const updateLocation = async (userId, latitude, longitude) => {
  await User.findByIdAndUpdate(userId, {
    location: toGeoJSONPoint(latitude, longitude),
  })
}

// ─── REGISTER FCM TOKEN ──────────────────────────────────────────────────────

export const registerFCMToken = async (userId, token) => {
  // $addToSet: only adds if token doesn't already exist in array
  await User.findByIdAndUpdate(userId, {
    $addToSet: { fcmTokens: token },
  })
}

// ─── REMOVE FCM TOKEN ────────────────────────────────────────────────────────
// Called when FCM reports a token as invalid

export const removeFCMToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { fcmTokens: token },
  })
}