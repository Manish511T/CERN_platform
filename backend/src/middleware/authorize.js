import { ForbiddenError } from '../shared/errors.js'

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ForbiddenError(
      `Required roles: ${roles.join(', ')}`
    )
  }
  next()
}

export default authorize