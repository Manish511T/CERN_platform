import { ForbiddenError, UnauthorizedError } from '../shared/errors.js'

// Basic role check — user must have one of the allowed roles
export const authorize = (...roles) => (req, res, next) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'))
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(
        `Access denied. Required: ${roles.join(', ')}. You have: ${req.user.role}`
      ))
    }
    next()
  } catch (err) {
    next(err)
  }
}

// Branch admin must be assigned to a branch before they can manage it
export const requireBranchAssignment = (req, res, next) => {
  try {
    if (!req.user.branchId) {
      return next(new ForbiddenError(
        'You are not assigned to any branch. Contact Super Admin.'
      ))
    }
    next()
  } catch (err) {
    next(err)
  }
}

// Branch admin can only act on their own branch
// Reads branchId from req.params.branchId and compares to req.user.branchId
export const requireOwnBranch = (req, res, next) => {
  try {
    const { role, branchId } = req.user
    const targetBranchId = req.params.branchId

    // Super admin bypasses this check
    if (role === 'super_admin') return next()

    if (!branchId) {
      return next(new ForbiddenError('You are not assigned to any branch.'))
    }

    if (branchId.toString() !== targetBranchId) {
      return next(new ForbiddenError('You can only manage your own branch.'))
    }

    next()
  } catch (err) {
    next(err)
  }
}

// Shorthand middleware combinations for common patterns
export const superAdminOnly    = authorize('super_admin')
export const branchAdminOnly   = authorize('branch_admin')
export const volunteerOnly     = authorize('volunteer')
export const userOnly          = authorize('user')
export const adminOnly         = authorize('super_admin', 'branch_admin')
export const fieldResponders   = authorize('volunteer', 'branch_admin', 'super_admin')