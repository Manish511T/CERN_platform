import { Router } from 'express'
import protect from '../../middleware/protect.js'
import {
  authorize,
  superAdminOnly,
  adminOnly,
  volunteerOnly,
} from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import rateLimiter from '../../middleware/rateLimiter.js'
import { upload } from '../../config/cloudinary.js'
import * as sosController from './sos.controller.js'
import {
  triggerSOSSchema,
  updateStatusSchema,
  getHistorySchema,
} from './sos.validation.js'

const router = Router()

router.use(protect)

// USER ONLY — only users can trigger SOS (not volunteers, not admins)
router.post('/trigger',
  authorize('user'),
  rateLimiter.sos,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'voice', maxCount: 1 },
  ]),
  validate(triggerSOSSchema),
  sosController.triggerSOS
)

// VOLUNTEER ONLY — only volunteers accept SOS
router.patch('/accept/:sosId',
  volunteerOnly,
  sosController.acceptSOS
)

// USER ONLY — only the victim can update their own SOS status
router.patch('/status/:sosId',
  authorize('user'),
  validate(updateStatusSchema),
  sosController.updateStatus
)

// USERS + VOLUNTEERS — their own history only
router.get('/history',
  authorize('user', 'volunteer'),
  validate(getHistorySchema),
  sosController.getHistory
)

// ADMINS ONLY — see active SOS (filtered by branch for branch_admin)
router.get('/active',
  adminOnly,
  sosController.getActive
)

export default router