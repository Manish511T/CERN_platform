import { Router } from 'express'
import * as authController from './auth.controller.js'
import protect from '../../middleware/protect.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import rateLimiter from '../../middleware/rateLimiter.js'
import { ROLES } from '../../shared/constants.js'
import {
  registerSchema,
  loginSchema,
  updateLocationSchema,
  registerFCMSchema,
} from './auth.validation.js'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register', rateLimiter.auth, validate(registerSchema), authController.register)
router.post('/login',    rateLimiter.auth, validate(loginSchema),    authController.login)
router.post('/refresh',                                               authController.refresh)
router.post('/logout',   protect,                                     authController.logout)

// ── Protected routes ──────────────────────────────────────────────────────────
router.get('/me', protect, authController.getMe)

router.patch(
  '/duty',
  protect,
  authorize(ROLES.VOLUNTEER),
  authController.toggleDuty
)

router.post(
  '/location',
  protect,
  validate(updateLocationSchema),
  authController.updateLocation
)

router.post(
  '/fcm-token',
  protect,
  validate(registerFCMSchema),
  authController.registerFCMToken
)

export default router