import { Router } from 'express'
import protect from '../../middleware/protect.js'
import {
  superAdminOnly,
  adminOnly,
  authorize,
  requireBranchAssignment,
  requireOwnBranch,
} from '../../middleware/authorize.js'
import validate from '../../middleware/validate.js'
import * as branchController from './branch.controller.js'
import {
  createBranchSchema,
  updateBranchSchema,
  assignAdminSchema,
  assignVolunteerSchema,
  branchParamSchema,
} from './branch.validation.js'

const router = Router()

router.use(protect)

// ── Super Admin only ──────────────────────────────────────────────────────────
router.post('/',
  superAdminOnly,
  validate(createBranchSchema),
  branchController.createBranch
)

router.delete('/:branchId',
  superAdminOnly,
  validate(branchParamSchema),
  branchController.deleteBranch
)

router.post('/:branchId/assign-admin',
  superAdminOnly,
  validate(assignAdminSchema),
  branchController.assignAdmin
)

// ── Super Admin + Branch Admin (own branch only) ──────────────────────────────
router.patch('/:branchId',
  adminOnly,
  requireOwnBranch,     // branch_admin can only edit their own branch
  validate(updateBranchSchema),
  branchController.updateBranch
)

router.post('/:branchId/volunteers',
  adminOnly,
  requireOwnBranch,     // branch_admin can only manage their own branch
  validate(assignVolunteerSchema),
  branchController.manageVolunteer
)

router.get('/:branchId/volunteers',
  adminOnly,
  requireOwnBranch,     // branch_admin can only view their own branch
  validate(branchParamSchema),
  branchController.getBranchVolunteers
)

// ── All authenticated users ───────────────────────────────────────────────────
router.get('/',           branchController.getAllBranches)
router.get('/:branchId',  validate(branchParamSchema), branchController.getBranchById)

export default router