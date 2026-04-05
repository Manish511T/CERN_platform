import { Router } from 'express'
import protect from '../../middleware/protect.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import { ROLES } from '../../shared/constants.js'
import * as userController from './user.controller.js'
import {
  updateProfileSchema,
  userParamSchema,
  getUsersQuerySchema,
} from './user.validation.js'

const router = Router()

router.use(protect)

// ── Own profile ───────────────────────────────────────────────────────────────
router.get('/me',     userController.getMyProfile)
router.patch('/me',   validate(updateProfileSchema), userController.updateMyProfile)

// ── Volunteer specific ────────────────────────────────────────────────────────
router.get(
  '/volunteers/online',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  userController.getOnlineVolunteers
)

router.get(
  '/:userId/stats',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.VOLUNTEER),
  validate(userParamSchema),
  userController.getVolunteerStats
)

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(getUsersQuerySchema),
  userController.getAllUsers
)

router.get(
  '/:userId',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(userParamSchema),
  userController.getUserById
)

router.patch(
  '/:userId/deactivate',
  authorize(ROLES.SUPER_ADMIN),
  validate(userParamSchema),
  userController.deactivateUser
)

router.patch(
  '/:userId/reactivate',
  authorize(ROLES.SUPER_ADMIN),
  validate(userParamSchema),
  userController.reactivateUser
)

export default router