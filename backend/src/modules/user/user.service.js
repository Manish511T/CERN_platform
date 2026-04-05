import User from '../auth/auth.model.js'
import {
  NotFoundError,
  ForbiddenError,
} from '../../shared/errors.js'
import { ROLES } from '../../shared/constants.js'
import logger from '../../config/logger.js'

// ─── GET MY PROFILE ──────────────────────────────────────────────────────────

export const getMyProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('branchId', 'name code')

  if (!user) throw new NotFoundError('User')
  return user.toSafeObject()
}

// ─── UPDATE MY PROFILE ───────────────────────────────────────────────────────

export const updateMyProfile = async (userId, updates) => {
  const user = await User.findById(userId)
  if (!user) throw new NotFoundError('User')

  const allowedFields = ['name', 'phone']
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      user[field] = updates[field]
    }
  }

  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'profile_updated', userId })

  return user.toSafeObject()
}

// ─── GET USER BY ID ──────────────────────────────────────────────────────────
// Admins only

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select('-password -refreshToken -fcmTokens')
    .populate('branchId', 'name code')

  if (!user) throw new NotFoundError('User')
  return user
}

// ─── GET ALL USERS ───────────────────────────────────────────────────────────
// Admins only — with filters and pagination

export const getAllUsers = async ({
  role,
  isActive,
  branchId,
  page,
  limit,
  search,
  requestingUser,
}) => {
  const query = {}

  // Branch admin can only see users/volunteers in their branch
  if (requestingUser.role === ROLES.BRANCH_ADMIN) {
    query.branchId = requestingUser.branchId
  } else {
    if (branchId) query.branchId = branchId
  }

  if (role)               query.role     = role
  if (isActive !== undefined) query.isActive = isActive === 'true'

  // Search by name or email
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken -fcmTokens')
      .populate('branchId', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ])

  return {
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

// ─── DEACTIVATE USER ─────────────────────────────────────────────────────────
// Super admin only

export const deactivateUser = async (targetUserId, requestingUser) => {
  const user = await User.findById(targetUserId)
  if (!user) throw new NotFoundError('User')

  // Prevent self-deactivation
  if (targetUserId === requestingUser._id.toString()) {
    throw new ForbiddenError('You cannot deactivate your own account')
  }

  // Prevent deactivating another super admin
  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ForbiddenError('Cannot deactivate a super admin')
  }

  user.isActive  = false
  user.isOnDuty  = false   // take offline if volunteer
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'user_deactivated', targetUserId, by: requestingUser._id })

  return { message: `${user.name} has been deactivated` }
}

// ─── REACTIVATE USER ─────────────────────────────────────────────────────────

export const reactivateUser = async (targetUserId, requestingUser) => {
  const user = await User.findById(targetUserId)
  if (!user) throw new NotFoundError('User')

  if (targetUserId === requestingUser._id.toString()) {
    throw new ForbiddenError('You cannot reactivate your own account')
  }

  user.isActive = true
  await user.save({ validateBeforeSave: false })

  logger.info({ event: 'user_reactivated', targetUserId, by: requestingUser._id })

  return { message: `${user.name} has been reactivated` }
}

// ─── GET ONLINE VOLUNTEERS ───────────────────────────────────────────────────
// Returns all volunteers currently on duty
// Used by admin dashboard for live overview

export const getOnlineVolunteers = async (requestingUser) => {
  const query = {
    role:     ROLES.VOLUNTEER,
    isOnDuty: true,
    isActive: true,
  }

  // Branch admin sees only their branch
  if (requestingUser.role === ROLES.BRANCH_ADMIN) {
    query.branchId = requestingUser.branchId
  }

  return User.find(query)
    .select('name email phone location branchId branchVerified updatedAt')
    .populate('branchId', 'name code')
    .lean()
}

// ─── GET VOLUNTEER STATS ─────────────────────────────────────────────────────

export const getVolunteerStats = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new NotFoundError('User')
  if (user.role !== ROLES.VOLUNTEER) {
    throw new ForbiddenError('Stats are only available for volunteers')
  }

  // Lazy import to avoid circular dependency
  const { default: SOS } = await import('../sos/sos.model.js')
  const { SOS_STATUS }   = await import('../../shared/constants.js')

  const [total, resolved] = await Promise.all([
    SOS.countDocuments({ acceptedBy: userId }),
    SOS.countDocuments({ acceptedBy: userId, status: SOS_STATUS.RESOLVED }),
  ])

  return {
    totalAccepted:   total,
    totalResolved:   resolved,
    totalPending:    total - resolved,
    resolutionRate:  total > 0 ? Math.round((resolved / total) * 100) : 0,
  }
}