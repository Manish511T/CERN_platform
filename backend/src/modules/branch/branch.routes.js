import { Router } from 'express'
import protect from '../../middleware/protect.js'
import authorize from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import { ROLES } from '../../shared/constants.js'
import * as branchController from './branch.controller.js'
import {
  createBranchSchema,
  updateBranchSchema,
  assignAdminSchema,
  assignVolunteerSchema,
  branchParamSchema,
} from './branch.validation.js'

const router = Router()

// All branch routes require authentication
router.use(protect)

// ── Super Admin only ──────────────────────────────────────────────────────────
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN),
  validate(createBranchSchema),
  branchController.createBranch
)

router.delete(
  '/:branchId',
  authorize(ROLES.SUPER_ADMIN),
  validate(branchParamSchema),
  branchController.deleteBranch
)

router.post(
  '/:branchId/assign-admin',
  authorize(ROLES.SUPER_ADMIN),
  validate(assignAdminSchema),
  branchController.assignAdmin
)

// ── Super Admin + Branch Admin ────────────────────────────────────────────────
router.patch(
  '/:branchId',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(updateBranchSchema),
  branchController.updateBranch
)

router.post(
  '/:branchId/volunteers',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(assignVolunteerSchema),
  branchController.manageVolunteer
)

router.get(
  '/:branchId/volunteers',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(branchParamSchema),
  branchController.getBranchVolunteers
)

// ── All authenticated users ───────────────────────────────────────────────────
router.get('/',          branchController.getAllBranches)
router.get('/:branchId', validate(branchParamSchema), branchController.getBranchById)

export default router