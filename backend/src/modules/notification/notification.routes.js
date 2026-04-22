import { Router } from 'express'
import protect from '../../middleware/protect.js'
import { superAdminOnly } from '../../middleware/authorize.js'
import * as notificationController from './notification.controller.js'

const router = Router()

router.use(protect)

// Any authenticated user sees their own notifications
router.get('/', notificationController.getMyNotifications)

// Super admin only — system stats
router.get('/stats',
  superAdminOnly,
  notificationController.getStats
)

export default router