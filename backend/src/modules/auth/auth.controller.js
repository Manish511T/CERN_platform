import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../../utils/response.utils.js'
import * as authService from './auth.service.js'
import { env } from '../../config/env.js'

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body

  const { user, accessToken, refreshToken } = await authService.register({
    name, email, password, role, phone,
  })

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
  sendCreated(res, { user, accessToken })
})

// Super admin only — creates any role including branch_admin, super_admin
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

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
  sendSuccess(res, { user, accessToken })
})

export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken

  const { accessToken, refreshToken } = await authService.refreshAccessToken(
    incomingRefreshToken
  )

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
  sendSuccess(res, { accessToken })
})

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id)

  res.clearCookie('refreshToken', {
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