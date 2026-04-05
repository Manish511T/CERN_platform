import { Router } from 'express'
import protect from '../../middleware/protect.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import rateLimiter from '../../middleware/rateLimiter.js'
import { upload } from '../../config/cloudinary.js'
import { ROLES } from '../../shared/constants.js'
import * as sosController from './sos.controller.js'
import {
  triggerSOSSchema,
  updateStatusSchema,
  getHistorySchema,
} from './sos.validation.js'

const router = Router()

// All SOS routes require authentication
router.use(protect)

router.post(
  '/trigger',
  rateLimiter.sos,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'voice', maxCount: 1 },
  ]),
  validate(triggerSOSSchema),
  authorize(ROLES.USER, ROLES.VOLUNTEER),
  sosController.triggerSOS
)

router.patch(
  '/accept/:sosId',
  authorize(ROLES.VOLUNTEER),
  sosController.acceptSOS
)

router.patch(
  '/status/:sosId',
  validate(updateStatusSchema),
  sosController.updateStatus
)

router.get(
  '/history',
  validate(getHistorySchema),
  sosController.getHistory
)

router.get(
  '/active',
  authorize(ROLES.BRANCH_ADMIN, ROLES.SUPER_ADMIN),
  sosController.getActive
)

export default router