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

router.use(protect)

// ── Collection routes (no param) ──────────────────────────────────────────────
router.get('/',
  branchController.getAllBranches
)

router.post('/',
  authorize(ROLES.SUPER_ADMIN),
  validate(createBranchSchema),
  branchController.createBranch
)

// ── Sub-resource routes (specific paths before /:branchId) ────────────────────
router.post('/:branchId/assign-admin',
  authorize(ROLES.SUPER_ADMIN),
  validate(assignAdminSchema),
  branchController.assignAdmin
)

router.post('/:branchId/volunteers',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(assignVolunteerSchema),
  branchController.manageVolunteer
)

router.get('/:branchId/volunteers',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(branchParamSchema),
  branchController.getBranchVolunteers
)

// ── Single resource routes (/:branchId last) ──────────────────────────────────
router.get('/:branchId',
  validate(branchParamSchema),
  branchController.getBranchById
)

router.patch('/:branchId',
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  validate(updateBranchSchema),
  branchController.updateBranch
)

router.delete('/:branchId',
  authorize(ROLES.SUPER_ADMIN),
  validate(branchParamSchema),
  branchController.deleteBranch
)

export default router