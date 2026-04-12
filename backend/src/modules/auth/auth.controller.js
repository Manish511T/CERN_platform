import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../../utils/response.utils.js'
import * as authService from './auth.service.js'
import { env } from '../../config/env.js'
import { ROLES } from '../../shared/constants.js'

// Cookie config — refresh token lives here
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                                    // JS cannot read it
  secure: env.NODE_ENV === 'production',             // HTTPS only in production
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days in ms
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body

  const { user, accessToken, refreshToken } = await authService.register({
    name, email, password, role, phone,
  })

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)

  sendCreated(res, { user, accessToken })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { user, accessToken, refreshToken } = await authService.login({
    email, password,
  })

  if (![ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN].includes(user.role)) {
    return res.status(403).json({ message: 'Admins only' })
  }


  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)

  sendSuccess(res, { user, accessToken })
})

export const refresh = asyncHandler(async (req, res) => {
  // Refresh token comes from httpOnly cookie — not request body
  const incomingRefreshToken = req.cookies?.refreshToken

  const { accessToken, refreshToken } = await authService.refreshAccessToken(
    incomingRefreshToken
  )

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)

  sendSuccess(res, { accessToken })
})

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id)

  // Clear the cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  })

  sendSuccess(res, { message: 'Logged out successfully' })
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id)
  sendSuccess(res, { user })
})

export const toggleDuty = asyncHandler(async (req, res) => {
  const result = await authService.toggleDuty(req.user._id)
  sendSuccess(res, result)
})

export const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body
  await authService.updateLocation(req.user._id, latitude, longitude)
  sendSuccess(res, { message: 'Location updated' })
})

export const registerFCMToken = asyncHandler(async (req, res) => {
  await authService.registerFCMToken(req.user._id, req.body.token)
  sendSuccess(res, { message: 'FCM token registered' })
})