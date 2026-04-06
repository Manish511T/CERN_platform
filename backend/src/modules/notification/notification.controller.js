import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess } from '../../utils/response.utils.js'
import * as notificationService from './notification.service.js'

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query

  const result = await notificationService.getUserNotifications(
    req.user._id,
    Number(page)  || 1,
    Number(limit) || 20,
  )

  sendSuccess(res, result)
})

export const getStats = asyncHandler(async (req, res) => {
  const stats = await notificationService.getNotificationStats()
  sendSuccess(res, { stats })
})