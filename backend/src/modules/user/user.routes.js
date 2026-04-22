import { Router } from 'express'
import protect from '../../middleware/protect.js'
import {
  superAdminOnly,
  adminOnly,
  authorize,
  requireBranchAssignment,
} from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import * as userController from './user.controller.js'
import {
  updateProfileSchema,
  userParamSchema,
  getUsersQuerySchema,
} from './user.validation.js'

const router = Router()

router.use(protect)

// ── Own profile — any authenticated user ──────────────────────────────────────
router.get('/me',    userController.getMyProfile)
router.patch('/me',  validate(updateProfileSchema), userController.updateMyProfile)

// ── Online volunteers — admins only ──────────────────────────────────────────
router.get('/volunteers/online',
  adminOnly,
  userController.getOnlineVolunteers
)

// ── Volunteer stats — admins + the volunteer themselves ───────────────────────
router.get('/:userId/stats',
  authorize('super_admin', 'branch_admin', 'volunteer'),
  validate(userParamSchema),
  userController.getVolunteerStats
)

// ── User list — admins only (filtered by branch for branch_admin) ─────────────
router.get('/',
  adminOnly,
  validate(getUsersQuerySchema),
  userController.getAllUsers
)

// ── Single user detail — admins only ─────────────────────────────────────────
router.get('/:userId',
  adminOnly,
  validate(userParamSchema),
  userController.getUserById
)

// ── Activate / Deactivate — super admin only ─────────────────────────────────
router.patch('/:userId/deactivate',
  superAdminOnly,
  validate(userParamSchema),
  userController.deactivateUser
)

router.patch('/:userId/reactivate',
  superAdminOnly,
  validate(userParamSchema),
  userController.reactivateUser
)

export default router