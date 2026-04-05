import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess } from '../../utils/response.utils.js'
import * as userService from './user.service.js'

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getMyProfile(req.user._id)
  sendSuccess(res, { user })
})

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(req.user._id, req.body)
  sendSuccess(res, { user })
})

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId)
  sendSuccess(res, { user })
})

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, branchId, page, limit, search } = req.query

  const result = await userService.getAllUsers({
    role,
    isActive,
    branchId,
    page:           Number(page)  || 1,
    limit:          Number(limit) || 20,
    search,
    requestingUser: req.user,
  })

  sendSuccess(res, result)
})

export const deactivateUser = asyncHandler(async (req, res) => {
  const result = await userService.deactivateUser(
    req.params.userId,
    req.user
  )
  sendSuccess(res, result)
})

export const reactivateUser = asyncHandler(async (req, res) => {
  const result = await userService.reactivateUser(
    req.params.userId,
    req.user
  )
  sendSuccess(res, result)
})

export const getOnlineVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await userService.getOnlineVolunteers(req.user)
  sendSuccess(res, { volunteers })
})

export const getVolunteerStats = asyncHandler(async (req, res) => {
  const stats = await userService.getVolunteerStats(req.params.userId)
  sendSuccess(res, { stats })
})