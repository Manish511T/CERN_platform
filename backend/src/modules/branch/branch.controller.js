import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../../utils/response.utils.js'
import * as branchService from './branch.service.js'

export const createBranch = asyncHandler(async (req, res) => {
  const {
    name, code, latitude, longitude,
    radiusMeters, contactPhone, address,
  } = req.body

  const branch = await branchService.createBranch({
    name, code, latitude, longitude,
    radiusMeters, contactPhone, address,
  })

  sendCreated(res, { branch })
})

export const getAllBranches = asyncHandler(async (req, res) => {
  const activeOnly = req.query.activeOnly === 'true'
  const branches = await branchService.getAllBranches({ activeOnly })
  sendSuccess(res, { branches })
})

export const getBranchById = asyncHandler(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.branchId)
  sendSuccess(res, { branch })
})

export const updateBranch = asyncHandler(async (req, res) => {
  const branch = await branchService.updateBranch(
    req.params.branchId,
    req.body,
    req.user
  )
  sendSuccess(res, { branch })
})

export const deleteBranch = asyncHandler(async (req, res) => {
  await branchService.deleteBranch(req.params.branchId)
  sendSuccess(res, { message: 'Branch deleted successfully' })
})

export const assignAdmin = asyncHandler(async (req, res) => {
  const branch = await branchService.assignAdmin(
    req.params.branchId,
    req.body.userId
  )
  sendSuccess(res, { branch })
})

export const manageVolunteer = asyncHandler(async (req, res) => {
  const result = await branchService.manageVolunteer(
    req.params.branchId,
    req.body.volunteerId,
    req.body.action,
    req.user
  )
  sendSuccess(res, result)
})

export const getBranchVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await branchService.getBranchVolunteers(
    req.params.branchId,
    req.user
  )
  sendSuccess(res, { volunteers })
})