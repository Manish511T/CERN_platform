import { Router } from 'express'
import protect from '../../middleware/protect.js'
import authorize from '../../middleware/authorize.js'
import { ROLES } from '../../shared/constants.js'
import * as notificationController from './notification.controller.js'

const router = Router()

router.use(protect)

// Any authenticated user can see their own notifications
router.get('/', notificationController.getMyNotifications)

// Admin only — system-wide stats
router.get(
  '/stats',
  authorize(ROLES.SUPER_ADMIN),
  notificationController.getStats
)

export default router