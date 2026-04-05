import Branch from './branch.model.js'
import User from '../auth/auth.model.js'
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  ValidationError,
} from '../../shared/errors.js'
import { ROLES } from '../../shared/constants.js'
import { toGeoJSONPoint } from '../../utils/geo.utils.js'
import logger from '../../config/logger.js'

// ─── CREATE BRANCH ───────────────────────────────────────────────────────────

export const createBranch = async ({
  name,
  code,
  latitude,
  longitude,
  radiusMeters,
  contactPhone,
  address,
}) => {
  const existing = await Branch.findOne({ code: code.toUpperCase() })
  if (existing) throw new ConflictError(`Branch code ${code} is already in use`)

  const branch = await Branch.create({
    name,
    code: code.toUpperCase(),
    coverageArea: toGeoJSONPoint(latitude, longitude),
    radiusMeters,
    contactPhone: contactPhone ?? null,
    address:      address ?? '',
  })

  logger.info({ event: 'branch_created', branchId: branch._id, code: branch.code })

  return branch
}

// ─── GET ALL BRANCHES ────────────────────────────────────────────────────────

export const getAllBranches = async ({ activeOnly = false } = {}) => {
  const query = activeOnly ? { isActive: true } : {}

  return Branch.find(query)
    .populate('admin', 'name email phone')
    .sort({ createdAt: -1 })
    .lean()
}

// ─── GET BRANCH BY ID ────────────────────────────────────────────────────────

export const getBranchById = async (branchId) => {
  const branch = await Branch.findById(branchId)
    .populate('admin', 'name email phone')

  if (!branch) throw new NotFoundError('Branch')
  return branch
}

// ─── UPDATE BRANCH ───────────────────────────────────────────────────────────

export const updateBranch = async (branchId, updates, requestingUser) => {
  const branch = await Branch.findById(branchId)
  if (!branch) throw new NotFoundError('Branch')

  // Branch admin can only update their own branch
  if (
    requestingUser.role === ROLES.BRANCH_ADMIN &&
    branch.admin?.toString() !== requestingUser._id.toString()
  ) {
    throw new ForbiddenError('You can only update your own branch')
  }

  // Update location if coordinates provided
  if (updates.latitude != null && updates.longitude != null) {
    branch.coverageArea = toGeoJSONPoint(updates.latitude, updates.longitude)
  }

  // Apply scalar updates
  const allowedFields = ['name', 'radiusMeters', 'contactPhone', 'address', 'isActive']
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      branch[field] = updates[field]
    }
  }

  await branch.save()

  logger.info({ event: 'branch_updated', branchId, updatedBy: requestingUser._id })

  return branch
}

// ─── DELETE BRANCH ───────────────────────────────────────────────────────────

export const deleteBranch = async (branchId) => {
  const branch = await Branch.findById(branchId)
  if (!branch) throw new NotFoundError('Branch')

  // Unassign all volunteers from this branch before deleting
  await User.updateMany(
    { branchId },
    { branchId: null, branchVerified: false }
  )

  await branch.deleteOne()

  logger.info({ event: 'branch_deleted', branchId })
}

// ─── ASSIGN ADMIN TO BRANCH ──────────────────────────────────────────────────

export const assignAdmin = async (branchId, userId) => {
  const [branch, user] = await Promise.all([
    Branch.findById(branchId),
    User.findById(userId),
  ])

  if (!branch) throw new NotFoundError('Branch')
  if (!user)   throw new NotFoundError('User')

  if (user.role !== ROLES.BRANCH_ADMIN) {
    throw new ValidationError('User must have branch_admin role to be assigned as branch admin')
  }

  // Remove admin role from previous admin if different person
  if (branch.admin && branch.admin.toString() !== userId) {
    await User.findByIdAndUpdate(branch.admin, {
      branchId: null,
    })
  }

  branch.admin = userId
  await branch.save()

  // Link branch to the admin user
  user.branchId = branchId
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'branch_admin_assigned', branchId, userId })

  return branch.populate('admin', 'name email phone')
}

// ─── MANAGE VOLUNTEER ────────────────────────────────────────────────────────

export const manageVolunteer = async (branchId, volunteerId, action, requestingUser) => {
  const [branch, volunteer] = await Promise.all([
    Branch.findById(branchId),
    User.findById(volunteerId),
  ])

  if (!branch)    throw new NotFoundError('Branch')
  if (!volunteer) throw new NotFoundError('Volunteer')

  if (volunteer.role !== ROLES.VOLUNTEER) {
    throw new ValidationError('User must be a volunteer')
  }

  // Branch admin can only manage their own branch
  if (
    requestingUser.role === ROLES.BRANCH_ADMIN &&
    branch.admin?.toString() !== requestingUser._id.toString()
  ) {
    throw new ForbiddenError('You can only manage volunteers in your own branch')
  }

  switch (action) {
    case 'assign':
      volunteer.branchId        = branchId
      volunteer.branchVerified  = false
      break

    case 'unassign':
      volunteer.branchId        = null
      volunteer.branchVerified  = false
      break

    case 'verify':
      if (volunteer.branchId?.toString() !== branchId) {
        throw new ValidationError('Volunteer must be assigned to this branch before verifying')
      }
      volunteer.branchVerified = true
      break

    case 'unverify':
      volunteer.branchVerified = false
      break

    default:
      throw new ValidationError('Invalid action')
  }

  await volunteer.save({ validateBeforeSave: false })

  logger.info({ event: `volunteer_${action}`, branchId, volunteerId })

  return {
    volunteerId:     volunteer._id,
    volunteerName:   volunteer.name,
    branchId:        volunteer.branchId,
    branchVerified:  volunteer.branchVerified,
    action,
  }
}

// ─── GET BRANCH VOLUNTEERS ───────────────────────────────────────────────────

export const getBranchVolunteers = async (branchId, requestingUser) => {
  const branch = await Branch.findById(branchId)
  if (!branch) throw new NotFoundError('Branch')

  // Branch admin can only see their own branch volunteers
  if (
    requestingUser.role === ROLES.BRANCH_ADMIN &&
    branch.admin?.toString() !== requestingUser._id.toString()
  ) {
    throw new ForbiddenError('You can only view volunteers in your own branch')
  }

  return User.find({ branchId, role: ROLES.VOLUNTEER })
    .select('name email phone isOnDuty branchVerified location createdAt')
    .sort({ branchVerified: -1, createdAt: -1 })
    .lean()
}

// ─── GET NEAREST BRANCH ──────────────────────────────────────────────────────
// Used internally by SOS routing engine

export const getNearestBranch = async (latitude, longitude) => {
  return Branch.findOne({
    coverageArea: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: 50000,
      },
    },
    isActive: true,
  })
}