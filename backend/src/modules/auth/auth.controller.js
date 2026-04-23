import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../../utils/response.utils.js'
import * as authService from './auth.service.js'
import { env } from '../../config/env.js'

// Each app gets its own cookie name — prevents cross-app cookie conflicts
// when all apps run on localhost simultaneously
const COOKIE_NAME_BY_ROLE = {
  user:         'refreshToken_user',
  volunteer:    'refreshToken_volunteer',
  branch_admin: 'refreshToken_branch',
  super_admin:  'refreshToken_admin',
}

const getCookieName = (role) =>
  COOKIE_NAME_BY_ROLE[role] || 'refreshToken'

const cookieOptions = (maxAge = 7 * 24 * 60 * 60 * 1000) => ({
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge,
})

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body

  const { user, accessToken, refreshToken } = await authService.register({
    name, email, password, role, phone,
  })

  res.cookie(getCookieName(user.role), refreshToken, cookieOptions())
  sendCreated(res, { user, accessToken })
})

export const adminCreateUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, branchId } = req.body
  const user = await authService.adminCreateUser({
    name, email, password, role, phone, branchId,
  })
  sendCreated(res, { user })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { user, accessToken, refreshToken } = await authService.login({
    email, password,
  })

  res.cookie(getCookieName(user.role), refreshToken, cookieOptions())
  sendSuccess(res, { user, accessToken })
})

export const refresh = asyncHandler(async (req, res) => {
  // Try all possible cookie names — works for any app
  const incomingToken =
    req.cookies?.refreshToken_user     ||
    req.cookies?.refreshToken_volunteer ||
    req.cookies?.refreshToken_branch   ||
    req.cookies?.refreshToken_admin    ||
    req.cookies?.refreshToken           // legacy fallback

  const { accessToken, refreshToken, role } =
    await authService.refreshAccessToken(incomingToken)

  // Re-set with role-specific name
  res.cookie(getCookieName(role), refreshToken, cookieOptions())
  sendSuccess(res, { accessToken })
})

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id)

  const cookieName = getCookieName(req.user.role)
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure:   env.NODE_ENV === 'production',
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