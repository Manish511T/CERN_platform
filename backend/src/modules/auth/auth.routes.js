import { Router } from 'express'
import * as authController from './auth.controller.js'
import protect from '../../middleware/protect.js'
import { authorize, volunteerOnly, superAdminOnly } from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import rateLimiter from '../../middleware/rateLimiter.js'
import {
  registerSchema,
  adminCreateUserSchema,
  loginSchema,
  updateLocationSchema,
  registerFCMSchema,
} from './auth.validation.js'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register',
  rateLimiter.auth,
  validate(registerSchema),         // enforces user|volunteer only
  authController.register
)

router.post('/login',
  rateLimiter.auth,
  validate(loginSchema),
  authController.login
)

router.post('/refresh', authController.refresh)

// ── Authenticated ─────────────────────────────────────────────────────────────
router.post('/logout',
  protect,
  authController.logout
)

router.get('/me',
  protect,
  authController.getMe
)

router.post('/location',
  protect,
  validate(updateLocationSchema),
  authController.updateLocation
)

router.post('/fcm-token',
  protect,
  validate(registerFCMSchema),
  authController.registerFCMToken
)

// Volunteer only — duty toggle
router.patch('/duty',
  protect,
  volunteerOnly,
  authController.toggleDuty
)

// Super Admin only — create any role (branch_admin, super_admin, etc.)
router.post('/admin/create-user',
  protect,
  superAdminOnly,
  validate(adminCreateUserSchema),
  authController.adminCreateUser
)

export default router